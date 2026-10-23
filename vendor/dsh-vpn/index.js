
/**
 * dsh-vpn — Host half.
 *
 * Owns the aTrust connect pipeline: keeps the (DPAPI-sealed) credential, spawns
 * worker.ps1 for anything that touches the desktop, streams the worker's JSON
 * lines into a job snapshot the Client polls, and answers "is the tunnel really
 * up?" with OS-level signals (aTrust VNIC address + optional TCP probe).
 *
 * The Client never sees the password and never talks to aTrust directly.
 */

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { homedir, networkInterfaces } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import net from 'node:net'

const HERE = dirname(fileURLToPath(import.meta.url))

export const name = 'dsh-vpn'
export const inject = ['webServer']

const ROUTE = '/vpn/api'
// DSHVPN_HOME 只用于本地自测（把状态目录指到工作区），正常运行时仍是 ~/.dsh/vpn
const DIR = process.env.DSHVPN_HOME || join(homedir(), '.dsh', 'vpn')
const CONFIG_PATH = join(DIR, 'config.json')
const LOG_PATH = join(DIR, 'vpn.log')
const WORKER = join(HERE, 'worker.ps1')

const VERSION = '0.1.0'
const DEFAULT_SERVER = 'https://vpn.seeyon.com'
const EVENT_LIMIT = 160
const LOG_LIMIT = 1024 * 1024

// ---------------------------------------------------------------- 配置

function defaultConfig() {
  return { version: 1, server: DEFAULT_SERVER, user: '', passwordSealed: '', probe: '', updatedAt: 0 }
}

function readConfig() {
  try {
    const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
    return { ...defaultConfig(), ...raw }
  } catch {
    return defaultConfig()
  }
}

function writeConfig(next) {
  mkdirSync(DIR, { recursive: true })
  const config = { ...defaultConfig(), ...next, updatedAt: Date.now() }
  const tmp = CONFIG_PATH + '.tmp'
  writeFileSync(tmp, JSON.stringify(config, null, 2), 'utf8')
  renameSync(tmp, CONFIG_PATH)
  return config
}

function portalLoginUrl(server) {
  const base = String(server || DEFAULT_SERVER).replace(/\/+$/, '')
  return base + '/portal/#/login'
}

function publicConfig(config) {
  return {
    server: config.server || DEFAULT_SERVER,
    user: config.user || '',
    probe: config.probe || '',
    hasPassword: Boolean(config.passwordSealed),
    updatedAt: config.updatedAt || 0,
  }
}

// ---------------------------------------------------------------- 日志

function appendLog(line) {
  try {
    mkdirSync(DIR, { recursive: true })
    const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const text = '[' + stamp + '] ' + line + '\n'
    if (existsSync(LOG_PATH) && statSync(LOG_PATH).size > LOG_LIMIT) {
      renameSync(LOG_PATH, LOG_PATH + '.old')
    }
    writeFileSync(LOG_PATH, text, { encoding: 'utf8', flag: 'a' })
  } catch {
    /* 日志失败不影响主流程 */
  }
}

function readLogTail(lines = 120) {
  try {
    const raw = readFileSync(LOG_PATH, 'utf8')
    const all = raw.split(/\r?\n/).filter(Boolean)
    return all.slice(-lines)
  } catch {
    return []
  }
}

// ---------------------------------------------------------------- 供电：PowerShell

function runPowerShell(script, env = {}, timeoutMs = 30000) {
  // 让子进程用 UTF-8 输出，否则中文错误信息会变成乱码
  const wrapped = "[Console]::OutputEncoding=[Text.Encoding]::UTF8; $OutputEncoding=[Text.Encoding]::UTF8; " + script
  return new Promise((resolve) => {
    const child = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', wrapped], {
      windowsHide: true,
      env: { ...process.env, ...env },
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() })
    }
    const timer = setTimeout(() => {
      try { child.kill() } catch { /* ignore */ }
      finish(-1)
    }, timeoutMs)
    child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.on('error', (error) => { stderr += String(error); finish(-1) })
    child.on('close', (code) => finish(code))
  })
}

/** DPAPI（CurrentUser）加密：只有当前 Windows 用户能解。 */
async function sealSecret(plain) {
  const b64 = Buffer.from(plain, 'utf8').toString('base64')
  const script = [
    "try { Add-Type -AssemblyName System.Security -ErrorAction Stop } catch { [void][Reflection.Assembly]::LoadWithPartialName('System.Security') }",
    "$raw = [Convert]::FromBase64String($env:DSHVPN_IN)",
    "$plain = [Text.Encoding]::UTF8.GetString($raw)",
    "$bytes = [Text.Encoding]::UTF8.GetBytes($plain)",
    "[Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect($bytes, $null, 'CurrentUser'))",
  ].join('; ')
  const out = await runPowerShell(script, { DSHVPN_IN: b64 }, 20000)
  if (out.code !== 0 || !out.stdout) throw new Error('凭据加密失败: ' + (out.stderr || 'no output'))
  return out.stdout.trim()
}

async function openSecret(sealed) {
  if (!sealed) return ''
  const script = [
    "try { Add-Type -AssemblyName System.Security -ErrorAction Stop } catch { [void][Reflection.Assembly]::LoadWithPartialName('System.Security') }",
    "$raw = [Convert]::FromBase64String($env:DSHVPN_IN)",
    "$bytes = [Security.Cryptography.ProtectedData]::Unprotect($raw, $null, 'CurrentUser')",
    "[Convert]::ToBase64String($bytes)",
  ].join('; ')
  const out = await runPowerShell(script, { DSHVPN_IN: sealed }, 20000)
  if (out.code !== 0 || !out.stdout) throw new Error('凭据解密失败: ' + (out.stderr || 'no output'))
  return Buffer.from(out.stdout.trim(), 'base64').toString('utf8')
}

// ---------------------------------------------------------------- 状态

/** aTrust VNIC 拿到地址，才算隧道起来了。 */
function detectTunnel() {
  const interfaces = networkInterfaces()
  const found = []
  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!/atrust/i.test(name)) continue
    for (const address of addresses || []) {
      if (address.family !== 'IPv4' || address.internal) continue
      if (address.address.startsWith('169.254.')) continue
      found.push({ adapter: name, ip: address.address })
    }
  }
  return found
}

function tcpProbe(target, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const [host, portText] = String(target).split(':')
    const port = Number(portText)
    if (!host || !port || Number.isNaN(port)) return resolve({ ok: false, error: '探针格式应为 host:port' })
    const socket = new net.Socket()
    const done = (result) => {
      socket.removeAllListeners()
      socket.destroy()
      resolve(result)
    }
    socket.setTimeout(timeoutMs)
    socket.once('connect', () => done({ ok: true }))
    socket.once('timeout', () => done({ ok: false, error: '超时' }))
    socket.once('error', (error) => done({ ok: false, error: error.code || String(error) }))
    socket.connect(port, host)
  })
}

// ---------------------------------------------------------------- 任务（worker 进程）

let job = null

function startJob(action, params = {}) {
  if (job && job.running) return { ok: false, error: 'busy' }
  job = {
    id: Date.now().toString(36),
    action,
    running: true,
    startedAt: Date.now(),
    finishedAt: 0,
    events: [],
    result: null,
    error: '',
    needCode: false,
  }
  const current = job

  const push = (event) => {
    current.events.push({ t: Date.now() - current.startedAt, ...event })
    if (current.events.length > EVENT_LIMIT) current.events.splice(0, current.events.length - EVENT_LIMIT)
    if (event.phase === 'need_code') current.needCode = true
    appendLog(action + ' ' + (event.phase || '-') + ' ' + (event.message || ''))
  }

  const args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', WORKER, '-Action', action]
  if (params.server) args.push('-Server', params.server)
  if (params.user) args.push('-User', params.user)
  if (params.probe) args.push('-Probe', params.probe)
  if (params.code) args.push('-Code', params.code)

  let child
  try {
    child = spawn('powershell.exe', args, {
      windowsHide: true,
      env: { ...process.env, DSHVPN_PASSWORD: params.password || '' },
    })
  } catch (error) {
    current.running = false
    current.error = String(error)
    return { ok: false, error: String(error) }
  }

  let buffer = ''
  let stderr = ''

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (chunk) => {
    buffer += chunk
    let index = buffer.indexOf('\n')
    while (index >= 0) {
      const line = buffer.slice(0, index).trim()
      buffer = buffer.slice(index + 1)
      index = buffer.indexOf('\n')
      if (!line) continue
      try {
        const payload = JSON.parse(line)
        if (payload.final) current.result = payload
        else push(payload)
      } catch {
        push({ phase: 'output', message: line })
      }
    }
  })

  child.stderr.setEncoding('utf8')
  child.stderr.on('data', (chunk) => { stderr += chunk })

  const killer = setTimeout(() => {
    push({ phase: 'timeout', message: '超过 ' + Math.round((params.timeoutMs || 120000) / 1000) + ' 秒未完成，中止', level: 'error' })
    try { child.kill() } catch { /* ignore */ }
  }, params.timeoutMs || 120000)

  child.on('error', (error) => {
    clearTimeout(killer)
    current.running = false
    current.finishedAt = Date.now()
    current.error = String(error)
    appendLog(action + ' spawn error ' + String(error))
  })

  child.on('close', (code) => {
    clearTimeout(killer)
    current.running = false
    current.finishedAt = Date.now()
    if (stderr.trim()) {
      current.error = stderr.trim().split(/\r?\n/).slice(-6).join('\n')
      appendLog(action + ' stderr ' + current.error.slice(0, 400))
    }
    if (!current.result) {
      current.result = { ok: false, state: 'error', message: '进程退出（code ' + code + '）' }
      push({ phase: 'exit', message: current.error || ('worker 退出 code ' + code), level: 'error' })
    }
  })

  appendLog(action + ' started (id ' + current.id + ')')
  return { ok: true, id: current.id }
}

function jobView() {
  if (!job) return null
  return {
    id: job.id,
    action: job.action,
    running: job.running,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    needCode: job.needCode,
    error: job.error,
    result: job.result,
    events: job.events.slice(-60),
  }
}

// ---------------------------------------------------------------- HTTP 管道

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(body)
}

function isTrustedRequest(request) {
  const host = String(request.headers.host || '')
  const origin = request.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function readJsonBody(request, limit = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('请求体过大'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      const text = Buffer.concat(chunks).toString('utf8').trim()
      if (!text) return resolve({})
      try {
        resolve(JSON.parse(text))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

async function snapshot() {
  const config = readConfig()
  const tunnels = detectTunnel()
  const probe = config.probe ? await tcpProbe(config.probe) : null
  const tunnelUp = tunnels.length > 0 && (!probe || probe.ok)
  return {
    ok: true,
    version: VERSION,
    config: publicConfig(config),
    tunnel: { up: tunnelUp, addresses: tunnels, probe },
    job: jobView(),
    now: Date.now(),
  }
}

// ---------------------------------------------------------------- 插件入口

export function apply(ctx) {
  ctx.effect(() => {
    const disposers = []
    const route = (path, handler) => {
      disposers.push(ctx.webServer.register({ kind: 'exact', path: ROUTE + path, handler }))
    }

    route('/state', async (request, response) => {
      if (request.method !== 'GET') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        sendJson(response, 200, await snapshot())
      } catch (error) {
        sendJson(response, 500, { ok: false, error: String(error) })
      }
    })

    route('/config', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = await readJsonBody(request)
        const current = readConfig()
        const server = String(body.server || current.server || DEFAULT_SERVER).trim()
        if (!/^https?:\/\//i.test(server)) return sendJson(response, 400, { ok: false, error: '服务器地址需要 http(s)://' })
        const next = {
          ...current,
          server,
          user: String(body.user ?? current.user ?? '').trim(),
          probe: String(body.probe ?? current.probe ?? '').trim(),
        }
        const password = typeof body.password === 'string' ? body.password : ''
        if (password) next.passwordSealed = await sealSecret(password)
        if (body.clearPassword) next.passwordSealed = ''
        writeConfig(next)
        sendJson(response, 200, { ok: true, config: publicConfig(next) })
      } catch (error) {
        sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    // 连接由 Client 侧的内置浏览器完成（登录页 → 自动填表 → aTrust 客户端被唤起），
    // Host 只负责：给凭据、判状态、留日志。
    route('/connect', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      if (!config.user || !config.passwordSealed) {
        return sendJson(response, 400, { ok: false, error: '还没保存账号密码，先去设置里填一次' })
      }
      appendLog('connect requested (browser login mode)')
      sendJson(response, 200, { ok: true, mode: 'browser', portal: portalLoginUrl(config.server) })
    })

    // 内置浏览器登录前取一次凭据；只对同源 Client 开放，不落 Client 持久化。
    route('/credentials', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const config = readConfig()
        const password = await openSecret(config.passwordSealed)
        if (!config.user || !password) return sendJson(response, 400, { ok: false, error: '凭据不完整，请重新保存' })
        sendJson(response, 200, { ok: true, username: config.user, password, server: config.server })
      } catch (error) {
        sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    route('/disconnect', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      sendJson(response, 200, { ok: true, mode: 'manual', hint: '断开请在 aTrust 托盘图标里点「断开 / 退出登录」' })
    })

    route('/code', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = await readJsonBody(request)
        const code = String(body.code || '').trim()
        if (!code) return sendJson(response, 400, { ok: false, error: '验证码为空' })
        const started = startJob('code', { code, timeoutMs: 120000 })
        if (!started.ok) return sendJson(response, 409, started)
        sendJson(response, 200, { ok: true, id: started.id })
      } catch (error) {
        sendJson(response, 400, { ok: false, error: String(error) })
      }
    })

    route('/diagnose', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      const started = startJob('diagnose', { server: config.server, probe: config.probe, timeoutMs: 60000 })
      if (!started.ok) return sendJson(response, 409, started)
      sendJson(response, 200, { ok: true, id: started.id })
    })

    // 没有内置浏览器时（纯 Web 界面）退化成系统浏览器打开登录页，状态仍由 Host 判定
    route('/open-browser', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const config = readConfig()
        const url = portalLoginUrl(config.server)
        spawn('cmd.exe', ['/c', 'start', '', url], { detached: true, stdio: 'ignore', windowsHide: true }).unref()
        appendLog('open portal in system browser: ' + url)
        sendJson(response, 200, { ok: true, url })
      } catch (error) {
        sendJson(response, 500, { ok: false, error: String(error) })
      }
    })

    route('/log', async (request, response) => {
      if (request.method !== 'GET') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      sendJson(response, 200, { ok: true, path: LOG_PATH, lines: readLogTail(120) })
    })

    route('/open-log', async (request, response) => {
      if (request.method !== 'POST') return sendJson(response, 405, { ok: false, error: 'method' })
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        spawn('explorer.exe', ['/select,', LOG_PATH], { detached: true, stdio: 'ignore' }).unref()
        sendJson(response, 200, { ok: true, path: LOG_PATH })
      } catch (error) {
        sendJson(response, 500, { ok: false, error: String(error) })
      }
    })

    return () => {
      for (const dispose of disposers.splice(0)) {
        try { dispose() } catch { /* 宿主可能已经卸载过路由 */ }
      }
    }
  }, 'dsh-vpn: routes')
}
