
/**
 * Seeyon OA todo desk — Host half.
 *
 * Keeps the MCP authorization code on the server, calls the Seeyon MCP gateway
 * over JSON-RPC, normalizes affairs into a compact list, and (on the Desktop
 * build) injects the form assistant into the OA guest opened in the sidebar
 * browser. The Client never talks to the gateway directly.
 */

import { createRequire } from 'node:module'
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROUTE = '/seeyon-todo/api'
const CONFIG_DIR = join(homedir(), '.dsh', 'seeyon-todo')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')
const DEBUG_LOG = join(CONFIG_DIR, 'debug.log')
const DEBUG_LOG_LIMIT = 512 * 1024

export const name = 'dsh-seeyon-todo'
export const inject = ['webServer']

const VERSION = '1.7.2'
const DEFAULT_GATEWAY = 'https://xt.seeyon.com/mcp-gateway/1001/apps/seeyon/message'
const DEFAULT_OA_ORIGIN = 'https://xt.seeyon.com'

const T_AFFAIR_LIST = '2ac289d00e969ccc2a110892e2a6518f'
const T_AFFAIR_DETAIL = 'e05af81b54ed0c0036a3de433474472b'
const T_AFFAIR_SUMMARY = 'sy-5c11ddcf610f389843cdcd337a4b707c'
const T_FORM_EXTRACT = 'sy-6d29244b3e89a8af0c467a6aa19e859f'
const T_TEMPLATES = '0972ac5cb66dd38cf478392e57dba505'
const T_DRAFT_CREATE = '4ed67b1c10b8bf5858b3bb81d74dcee7'
const T_DRAFT_READ = 'd43c092a6d243d1c96d58b71b1ef26c2'
const T_DRAFT_UPDATE = '107f28b7cf1fa8ea0b2415c701411b4b'
const T_DRAFT_CONTINUE = '6e454242029dfb335c7902ab65b1f84c'
const WEEKLY_TEMPLATE_ID = '6405666956814665521'
const T_MEETING_LIST = 'f4e455e8ca57a2677d26daa7f3889504'
const T_MEETING_RECEIPT = '0e3d0ff4023a55cceb1a00c0cc86bc5a'
const T_MEETING_DETAIL = 'bb59afbf105014868ceb1b2cf6d9cb4c'
const T_CONFIRM = 'confirm_tool_call'

/**
 * Tools this plugin is allowed to auto-confirm. The gateway now requires a
 * second-confirmation ticket for medium/high-risk tools; we only ever issue
 * tickets for read-only calls, so a destructive tool can never be auto-run.
 */
const READ_ONLY_TOOLS = new Set([T_AFFAIR_LIST, T_AFFAIR_DETAIL, T_AFFAIR_SUMMARY, T_FORM_EXTRACT, T_DRAFT_READ, T_TEMPLATES, T_MEETING_LIST, T_MEETING_DETAIL])
const confirmCache = new Map()

const DEFAULT_TEMPLATES = [
  { id: 'agree', label: '同意', text: '同意。' },
  { id: 'agree-plan', label: '同意，按计划推进', text: '同意，请按计划推进。' },
  { id: 'seen', label: '已阅', text: '已阅。' },
  { id: 'supplement', label: '请补充材料', text: '请补充相关材料后再提交。' },
  { id: 'disagree', label: '不同意', text: '不同意，原因：' },
]

const LEVEL_LABELS = { 3: '非常重要', 2: '重要', 1: '普通', 0: '未标注' }

// ---------------------------------------------------------------- 配置文件

/** @returns {any} */
function defaultConfig() {
  return {
    version: 1,
    gatewayUrl: DEFAULT_GATEWAY,
    token: '',
    oaOrigin: DEFAULT_OA_ORIGIN,
    pageSize: 50,
    maxPages: 4,
    demo: false,
    autoInject: true,
    autoLogin: true,
    oaUsername: '',
    oaPassword: '',
    attitude: '同意',
    templates: DEFAULT_TEMPLATES.map((item) => ({ ...item })),
    fields: [],
  }
}

function clampInt(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(number)))
}

function isHttpsOrLoopback(value) {
  try {
    const url = new URL(String(value))
    if (url.protocol === 'https:') return true
    if (url.protocol !== 'http:') return false
    return url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === '[::1]'
  } catch {
    return false
  }
}

function normalizeOrigin(value, fallback) {
  try {
    const url = new URL(String(value || ''))
    return url.origin
  } catch {
    return fallback
  }
}

function sanitizeTemplates(input) {
  const list = Array.isArray(input) ? input : []
  const seen = new Set()
  const result = []
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue
    const label = String(raw.label == null ? '' : raw.label).trim().slice(0, 40)
    const text = String(raw.text == null ? '' : raw.text).trim().slice(0, 600)
    if (!label) continue
    let id = String(raw.id == null ? '' : raw.id).trim().slice(0, 60)
    if (!id) id = 'tpl-' + Math.random().toString(36).slice(2, 8)
    if (seen.has(id)) id = id + '-' + Math.random().toString(36).slice(2, 6)
    seen.add(id)
    result.push({ id, label, text })
    if (result.length >= 24) break
  }
  return result
}

function sanitizeFields(input) {
  const list = Array.isArray(input) ? input : []
  const result = []
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue
    const label = String(raw.label == null ? '' : raw.label).trim().slice(0, 60)
    const value = String(raw.value == null ? '' : raw.value).slice(0, 2000)
    if (!label) continue
    result.push({ label, value })
    if (result.length >= 60) break
  }
  return result
}

/** Merge an untrusted patch into the current config. */
function mergeConfig(base, patch) {
  const next = { ...base }
  if (patch && typeof patch === 'object') {
    if (typeof patch.gatewayUrl === 'string' && isHttpsOrLoopback(patch.gatewayUrl)) next.gatewayUrl = patch.gatewayUrl.trim()
    if (typeof patch.token === 'string' && patch.token !== '' && patch.token !== '__KEEP__') {
      const token = patch.token.trim()
      next.token = token ? (/^Bearer\s/i.test(token) ? token : 'Bearer ' + token) : ''
    }
    if (typeof patch.oaOrigin === 'string') next.oaOrigin = normalizeOrigin(patch.oaOrigin, base.oaOrigin)
    if (patch.pageSize !== undefined) next.pageSize = clampInt(patch.pageSize, 10, 100, base.pageSize)
    if (patch.maxPages !== undefined) next.maxPages = clampInt(patch.maxPages, 1, 10, base.maxPages)
    if (typeof patch.demo === 'boolean') next.demo = patch.demo
    if (typeof patch.autoInject === 'boolean') next.autoInject = patch.autoInject
    if (typeof patch.autoLogin === 'boolean') next.autoLogin = patch.autoLogin
    if (typeof patch.oaUsername === 'string') next.oaUsername = patch.oaUsername.trim().slice(0, 120)
    if (typeof patch.oaPassword === 'string' && patch.oaPassword !== '' && patch.oaPassword !== '__KEEP__') {
      next.oaPassword = patch.oaPassword.slice(0, 200)
    }
    if (typeof patch.attitude === 'string') next.attitude = patch.attitude.trim().slice(0, 40)
    if (patch.templates !== undefined) next.templates = sanitizeTemplates(patch.templates)
    if (patch.fields !== undefined) next.fields = sanitizeFields(patch.fields)
  }
  return next
}

export function readConfig() {
  try {
    const stat = statSync(CONFIG_PATH)
    if (!stat.isFile()) return defaultConfig()
    const parsed = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
    return mergeConfig(defaultConfig(), parsed)
  } catch {
    return defaultConfig()
  }
}

function writeConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true })
  const temp = CONFIG_PATH + '.tmp-' + process.pid
  writeFileSync(temp, JSON.stringify(config, null, 2) + '\n', 'utf8')
  renameSync(temp, CONFIG_PATH)
}

function publicConfig(config) {
  const hasToken = Boolean(config.token)
  const hasPassword = Boolean(config.oaPassword)
  return {
    gatewayUrl: config.gatewayUrl,
    oaOrigin: config.oaOrigin,
    pageSize: config.pageSize,
    maxPages: config.maxPages,
    demo: config.demo,
    autoInject: config.autoInject,
    autoLogin: config.autoLogin,
    oaUsername: config.oaUsername,
    hasPassword,
    attitude: config.attitude,
    templates: config.templates,
    fields: config.fields,
    hasToken,
    tokenHint: hasToken ? config.token.slice(-4) : '',
    configPath: CONFIG_PATH,
    defaultGateway: DEFAULT_GATEWAY,
    defaultOaOrigin: DEFAULT_OA_ORIGIN,
  }
}

// ---------------------------------------------------------------- 网关调用

class TodoError extends Error {
  constructor(code, message, hint) {
    super(message)
    this.name = 'TodoError'
    this.code = code
    this.hint = hint || ''
  }
}

let rpcId = 0

function absoluteUrl(value, origin) {
  const text = String(value == null ? '' : value).trim()
  if (!text) return ''
  if (/^https?:\/\//i.test(text)) return text
  try {
    return new URL(text, origin).href
  } catch {
    return text
  }
}

function parsePayload(raw) {
  const text = String(raw == null ? '' : raw).trim()
  if (!text) throw new TodoError('empty', '网关返回了空响应')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) continue
    const body = trimmed.slice(5).trim()
    if (!body || body === '[DONE]') continue
    return JSON.parse(body)
  }
  return JSON.parse(text)
}

function describeError(error, config) {
  const message = error instanceof Error ? error.message : String(error)
  let hint = ''
  if (/未知应用类型/.test(message)) {
    hint = '网关把请求里的应用类型判为未注册。请到 OA「个人应用设置 → 任务令牌 → 获取 MCP 授权码」重新获取授权码，并把页面显示的完整网关地址（含 /mcp-gateway/<appType>/ 这一段）填到设置里。'
  } else if (/HTTP\s*401|未授权|Unauthorized/i.test(message)) {
    hint = '授权码无效或已过期，回 OA 重新获取一次 MCP 授权码。'
  } else if (/HTTP\s*400/.test(message)) {
    hint = '400 多为授权码失效、任务令牌未绑定，或网关地址中的应用类型不对；也可能是一次请求没带 Authorization。'
  } else if (/fetch failed|ENOTFOUND|ECONNREFUSED|timed out|aborted|EAI_AGAIN/i.test(message)) {
    hint = '连不上网关：确认已连上 OA 所在网络（本机是 aTrust VPN），并检查网关地址是否可访问。'
  } else if (/工具 .* 返回错误/.test(message)) {
    hint = '网关连上了，但这个工具调用被拒。优先检查授权码对应的任务令牌是否已绑定。'
  }
  return { code: error && error.code ? error.code : 'gateway', message, hint }
}

async function rpc(config, method, params, timeoutMs = 25000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(config.gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: config.token,
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params: params || {} }),
      signal: controller.signal,
    })
    const text = await response.text()
    let payload
    try {
      payload = parsePayload(text)
    } catch (error) {
      if (response.status >= 400) {
        throw new TodoError('http', 'HTTP ' + response.status + '：' + text.slice(0, 300))
      }
      throw new TodoError('parse', '网关返回了无法解析的报文：' + text.slice(0, 200))
    }
    if (payload && payload.error) {
      const detail = payload.error.message || JSON.stringify(payload.error)
      throw new TodoError('gateway', String(detail))
    }
    if (response.status >= 400) {
      throw new TodoError('http', 'HTTP ' + response.status + '：' + text.slice(0, 300))
    }
    return payload ? payload.result : null
  } finally {
    clearTimeout(timer)
  }
}

async function fetchConfirmUuid(config, tool) {
  const cached = confirmCache.get(tool)
  if (cached && cached.expiresAt - 5000 > Date.now()) return cached.uuid
  const result = await rpc(config, 'tools/call', { name: T_CONFIRM, arguments: { toolName: tool } }, 15000)
  const structured = result && result.structuredContent
  let parsed = structured && typeof structured === 'object' ? structured : null
  if (!parsed || !parsed.uuid) {
    const texts = (result && Array.isArray(result.content) ? result.content : [])
      .filter((item) => item && item.type === 'text' && typeof item.text === 'string')
      .map((item) => item.text)
    if (texts.length) {
      try {
        const fromText = JSON.parse(texts.join('\n'))
        parsed = fromText && fromText.data ? fromText.data : fromText
      } catch {
        parsed = null
      }
    }
  }
  const uuid = parsed && (parsed.uuid || (parsed.data && parsed.data.uuid))
  if (!uuid) throw new TodoError('confirm', '网关没有返回二次确认票据')
  const expiresAt = Number(parsed.expiresAt) || Date.now() + 240000
  confirmCache.set(tool, { uuid, expiresAt })
  return uuid
}

async function callToolRaw(config, tool, args) {
  const result = await rpc(config, 'tools/call', { name: tool, arguments: args || {} })
  if (result && result.isError) {
    const text = (result.content || []).filter((item) => item && item.type === 'text').map((item) => item.text).join('\n')
    throw new TodoError('tool', '工具 ' + tool + ' 返回错误：' + (text || JSON.stringify(result)).slice(0, 400))
  }
  const texts = (result && Array.isArray(result.content) ? result.content : [])
    .filter((item) => item && item.type === 'text' && typeof item.text === 'string')
    .map((item) => item.text)
  const joined = texts.join('\n').trim()
  if (!joined) return result && result.structuredContent !== undefined ? result.structuredContent : result
  try {
    return JSON.parse(joined)
  } catch {
    return joined
  }
}

/**
 * Call a tool, attaching the gateway's second-confirmation ticket for the
 * read-only tools we allow. Never auto-confirms anything outside READ_ONLY_TOOLS.
 */
async function callTool(config, tool, args) {
  if (!READ_ONLY_TOOLS.has(tool)) return callToolRaw(config, tool, args)
  let uuid = ''
  try {
    uuid = await fetchConfirmUuid(config, tool)
  } catch {
    uuid = ''
  }
  const payload = uuid ? { ...(args || {}), _confirmUuid: uuid } : args || {}
  try {
    return await callToolRaw(config, tool, payload)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (!uuid || !/二次确认|confirmUuid/i.test(message)) throw error
    confirmCache.delete(tool)
    const retry = await fetchConfirmUuid(config, tool)
    return callToolRaw(config, tool, { ...(args || {}), _confirmUuid: retry })
  }
}

function unwrap(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of ['data', 'result', 'body']) {
      const value = data[key]
      if (value === undefined || value === null) continue
      if (Array.isArray(value) && value.length === 0) continue
      return value
    }
  }
  return data
}

function pickRows(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    for (const key of ['data', 'records', 'list', 'rows', 'affairList']) {
      if (Array.isArray(data[key])) return data[key]
    }
  }
  return []
}

function pickTotal(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  for (const key of ['affairCount', 'total', 'totalCount']) {
    const value = data[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
  }
  return null
}

function mapAffair(row, config) {
  const rawId = row && (row.affairId != null ? row.affairId : row.id != null ? row.id : row.summaryId)
  const origin = (config && config.oaOrigin) || DEFAULT_OA_ORIGIN
  return {
    id: rawId == null ? '' : String(rawId),
    subject: String((row && row.subject) || '').trim(),
    sender: String((row && (row.senderName || row.startMemberName)) || '').trim(),
    receiveTime: String((row && (row.receiveTime || row.createDate)) || '').trim(),
    deadline: String((row && (row.deadlineDate || row.deadlineDatetime)) || '').trim(),
    level: Number(row && row.importantLevel) || 0,
    subState: Number(row && row.subState) || 0,
    node: String((row && row.nodeName) || '').trim(),
    template: String((row && row.templateName) || '').trim(),
    url: absoluteUrl(row && (row.webUrl || row.pcUrl), origin),
    bodyType: Number(row && row.bodyType) || 0,
  }
}

async function fetchTodos(config, options = {}) {
  if (config.demo) {
    const items = demoItems()
    return { items: items.map((item) => ({ ...item })), total: items.length, demo: true, fetchedAt: Date.now() }
  }
  if (!config.token) throw new TodoError('config', '还没有配置 MCP 授权码')
  const pageSize = clampInt(config.pageSize, 10, 100, 50)
  const maxPages = clampInt(options.pages || config.maxPages, 1, 10, 4)
  const items = []
  let total = null
  for (let page = 1; page <= maxPages; page += 1) {
    const raw = await callTool(config, T_AFFAIR_LIST, {
      baseParam: { state: 3, pageNo: page, pageSize },
    })
    const data = unwrap(raw)
    const rows = pickRows(data)
    if (!rows.length) break
    for (const row of rows) items.push(mapAffair(row, config))
    const count = pickTotal(data)
    if (count !== null) total = count
    if (rows.length < pageSize) break
    if (total !== null && items.length >= total) break
  }
  const unique = []
  const seen = new Set()
  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue
    seen.add(item.id)
    unique.push(item)
  }
  return { items: unique, total: total === null ? unique.length : total, demo: false, fetchedAt: Date.now() }
}

async function fetchCounts(config) {
  const data = unwrap(await callTool(config, T_AFFAIR_SUMMARY, {}))
  const source = data && typeof data === 'object' ? data : {}
  return {
    pending: Number(source.pendingAffairCount) || 0,
    done: Number(source.doneAffairCount) || 0,
    sent: Number(source.sentAffairCount) || 0,
    waitSend: Number(source.waitSendAffairCount) || 0,
  }
}

async function fetchDetail(config, affairId) {
  if (!affairId) throw new TodoError('input', '缺少 affairId')
  if (config.demo) return demoDetail(affairId)
  const raw = await callTool(config, T_AFFAIR_DETAIL, { affairIds: String(affairId) })
  const data = unwrap(raw)
  const record = Array.isArray(data) ? data[0] : data
  if (!record || typeof record !== 'object') return null
  const toArray = (value) => (Array.isArray(value) ? value : [])
  return {
    id: String(record.affairId == null ? affairId : record.affairId),
    subject: String(record.subject || ''),
    sender: String(record.senderName || ''),
    receiveTime: String(record.receiveTime || ''),
    deadline: String(record.deadlineDate || ''),
    node: String(record.nodeName || ''),
    template: String(record.templateName || ''),
    importantLevel: Number(record.importantLevel) || 0,
    content: String(record.content || ''),
    attachmentList: toArray(record.attachmentList).map((item) => ({
      name: String((item && item.filename) || (item && item.name) || ''),
      size: Number(item && item.size) || 0,
    })),
    opinionRequired: Boolean(record.opinionRequired),
    attitudeOptions: toArray(record.attitudeOptions).map((item) => (typeof item === 'string' ? item : String((item && (item.name || item.label)) || ''))).filter(Boolean),
    availableActions: toArray(record.availableActions).map((item) => (typeof item === 'string' ? item : String((item && (item.name || item.label)) || ''))).filter(Boolean),
    finished: Boolean(record.finished),
    webUrl: absoluteUrl(record.webUrl, config.oaOrigin),
  }
}

async function callToolConfirmed(config, tool, args) {
  const uuid = await fetchConfirmUuid(config, tool)
  try {
    return await callToolRaw(config, tool, { ...(args || {}), _confirmUuid: uuid })
  } finally {
    confirmCache.delete(tool)
  }
}

function buildWeeklySummary(list) {
  return list.map((item) => {
    const lines = item.contents.map((text, index) => (index + 1) + '、' + String(text).replace(/\r/g, '').replace(/\n+/g, ' '))
    return item.project + '：\n' + lines.join('\n')
  }).join('\n\n')
}

/** Parse the CAP4 工时登记 formText into per-project work items. */
function parseWorklogText(formText) {
  const text = String(formText || '')
  const dateMatch = text.match(/工时日期：\s*(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : ''
  const start = text.indexOf('【明细表：工时明细】')
  if (start < 0) return { date, items: [] }
  const next = text.indexOf('【明细表：', start + 8)
  const section = next > 0 ? text.slice(start, next) : text.slice(start)
  const items = []
  for (const block of section.split(/第\d+行：/).slice(1)) {
    const project = ((block.match(/MX-项目名称：([^\n]*)/) || [])[1] || '').trim()
    const content = ((block.match(/MX-工作内容：([\s\S]*?)(?=\nMX-|$)/) || [])[1] || '').trim()
    const hours = Number((block.match(/MX-消耗工时：([\d.]+)/) || [])[1] || 0)
    if (!project && !content) continue
    items.push({ project, content, hours: Number.isFinite(hours) ? hours : 0 })
  }
  return { date, items }
}

/**
 * Weekly plan preparation:
 * 1. create a 周工作计划 draft from the template (default period = current week);
 * 2. read this week's 工时登记 and group the work items by project;
 * 3. rewrite the 本周期计划 rows (and append when there are more projects);
 * 4. return the draft's continue-open URL so the client can show it in the panel.
 */
async function collectWeekly(config, start, end) {
  const logs = []
  for (let page = 1; page <= 3; page += 1) {
    const raw = await callTool(config, T_AFFAIR_LIST, { baseParam: { state: 2, pageNo: page, pageSize: 50 } })
    const rows = pickRows(unwrap(raw))
    if (!rows.length) break
    for (const row of rows) {
      const subject = String(row.subject || '')
      const date = (subject.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || ''
      if (!subject.includes('工时登记') || !date) continue
      if (start && end && (date < start || date > end)) continue
      logs.push(row)
    }
    if (rows.length < 50) break
  }
  const projects = new Map()
  for (const log of logs) {
    const exRaw = await callTool(config, T_FORM_EXTRACT, { affairId: String(log.affairId) })
    const ex = unwrap(exRaw) || exRaw
    const parsed = parseWorklogText(ex && ex.formText)
    for (const item of parsed.items) {
      if (!item.project) continue
      const bucket = projects.get(item.project) || { project: item.project, contents: [], hours: 0 }
      if (item.content && !bucket.contents.includes(item.content)) bucket.contents.push(item.content)
      bucket.hours += item.hours
      projects.set(item.project, bucket)
    }
  }
  const list = Array.from(projects.values())
  if (!list.length) throw new TodoError('weekly', '本周没有读到工时登记，无法生成周计划数据')
  const total = list.reduce((sum, item) => sum + (item.hours || 0), 0) || list.length
  const weights = list.map((item) => Math.max(5, Math.round(((item.hours || 1) / total) * 100)))
  const diff = 100 - weights.reduce((a, b) => a + b, 0)
  if (weights.length) weights[0] += diff
  return { list, weights, sources: logs.length }
}

async function readDraftSnapshot(config, masterId) {
  const readRaw = await callTool(config, T_DRAFT_READ, { masterId: String(masterId), subTablePreviewLimit: 10 })
  const data = unwrap(readRaw) || readRaw
  const masterFields = Array.isArray(data.masterFields) ? data.masterFields : []
  const field = (name) => masterFields.find((item) => item && item.fieldName === name) || {}
  return {
    data,
    title: String(field('field0066').showValue || ''),
    start: String(field('field0053').showValue || ''),
    end: String(field('field0054').showValue || ''),
    ownerValue: String(field('field0018').value || ''),
    ownerName: String(field('field0018').showValue || ''),
  }
}

async function applyWeeklyRows(config, masterId, data, list, weights, start, end, owner) {
  const subTables = Array.isArray(data.subTables) ? data.subTables : []
  const table = subTables.find((item) => item && item.tableName === 'formson_73882')
  const existing = table && Array.isArray(table.rows) ? table.rows : []
  const changed = ['field0103', 'field0102', 'field0034', 'field0087', 'field0090', 'field0042', 'field0043']
  const records = []
  const appended = []
  list.forEach((item, index) => {
    const desc = item.contents.join('\n')
    const values = [
      { name: 'field0103', value: item.project, showValue: item.project },
      { name: 'field0102', value: String(weights[index]), showValue: String(weights[index]) },
      { name: 'field0034', value: desc, showValue: desc },
      { name: 'field0087', value: start, showValue: start },
      { name: 'field0090', value: end, showValue: end },
      { name: 'field0042', value: owner.value, showValue: owner.showValue },
      { name: 'field0043', value: '', showValue: '' },
    ]
    if (index < existing.length) records.push({ id: existing[index].id, fields: values })
    else appended.push({ fields: values })
  })
  if (records.length) {
    await callToolConfirmed(config, T_DRAFT_UPDATE, {
      masterId: String(masterId),
      formDataParams: { subTables: [{ name: 'formson_73882', changedFields: changed, records }] },
    })
  }
  if (appended.length) {
    await callToolConfirmed(config, T_DRAFT_CONTINUE, {
      masterId: String(masterId),
      formDataParams: { subTables: [{ name: 'formson_73882', changedFields: changed, records: appended }] },
    })
  }
  const summary = buildWeeklySummary(list)
  const summaryTable = subTables.find((item) => item && item.tableName === 'formson_73959')
  const summaryRow = summaryTable && Array.isArray(summaryTable.rows) ? summaryTable.rows[0] : null
  const summaryField = [{ name: 'field0226', value: summary, showValue: summary }]
  const masterSummary = {
    masterTable: { name: 'formmain_73881', changedFields: ['field0305'], record: { fields: [{ name: 'field0305', value: summary, showValue: summary }] } },
  }
  if (summaryRow) {
    masterSummary.subTables = [{ name: 'formson_73959', changedFields: ['field0226'], records: [{ id: summaryRow.id, fields: summaryField }] }]
    await callToolConfirmed(config, T_DRAFT_UPDATE, { masterId: String(masterId), formDataParams: masterSummary })
  } else {
    await callToolConfirmed(config, T_DRAFT_UPDATE, { masterId: String(masterId), formDataParams: masterSummary })
    await callToolConfirmed(config, T_DRAFT_CONTINUE, {
      masterId: String(masterId),
      formDataParams: { subTables: [{ name: 'formson_73959', changedFields: ['field0226'], records: [{ fields: summaryField }] }] },
    })
  }

  const continueArgs = {
    masterId: String(masterId),
    templateId: WEEKLY_TEMPLATE_ID,
    formDataParams: { masterTable: { name: 'formmain_73881', record: { fields: [] } } },
  }
  const extra = existing.slice(list.length).map((row) => row.id).filter(Boolean)
  if (extra.length) {
    continueArgs.deleteRowIds = extra
    continueArgs.deleteSubTableName = 'formson_73882'
  }
  const contRaw = await callToolConfirmed(config, T_DRAFT_CONTINUE, continueArgs)
  const cont = unwrap(contRaw) || contRaw
  return absoluteUrl((cont && (cont.webUrl || cont.url)) || '', config.oaOrigin)
}

export async function prepareWeeklyPlan(config) {
  const draft = await createFormDraft(config, WEEKLY_TEMPLATE_ID, '周工作计划')
  const snapshot = await readDraftSnapshot(config, draft.masterId)
  const { list, weights, sources } = await collectWeekly(config, snapshot.start, snapshot.end)
  const url = await applyWeeklyRows(config, draft.masterId, snapshot.data, list, weights, snapshot.start, snapshot.end, { value: snapshot.ownerValue, showValue: snapshot.ownerName })
  return {
    ok: true,
    title: snapshot.title,
    masterId: draft.masterId,
    url: url || draft.url,
    start: snapshot.start,
    end: snapshot.end,
    rows: list.map((item, index) => ({ project: item.project, weight: weights[index], hours: item.hours, contents: item.contents })),
    sources,
  }
}

let templateCache = { at: 0, items: [] }

export async function listTemplates(config) {
  if (Date.now() - templateCache.at < 5 * 60 * 1000 && templateCache.items.length) return templateCache.items
  const raw = await callTool(config, T_TEMPLATES, {})
  const data = unwrap(raw) || raw
  const rows = data && Array.isArray(data.templates) ? data.templates : []
  const items = rows
    .map((item) => ({ id: String(item.templateId || ''), name: String(item.templateName || ''), formId: String(item.formId || '') }))
    .filter((item) => item.id && item.name)
  items.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
  templateCache = { at: Date.now(), items }
  return items
}

export async function createFormDraft(config, templateId, templateName) {
  if (!templateId) throw new TodoError('input', '缺少 templateId')
  const raw = await callToolConfirmed(config, T_DRAFT_CREATE, { templateId: String(templateId) })
  const draft = unwrap(raw) || raw
  const masterId = draft && (draft.masterId || draft.id)
  if (!masterId) throw new TodoError('draft', '创建草稿失败：网关没有返回 masterId')
  const origin = config.oaOrigin || DEFAULT_OA_ORIGIN
  const url = origin + '/seeyon/collaboration/collaboration.do?method=newColl&fromNewItem=true&showTab=true&templateId=' + encodeURIComponent(String(templateId)) + '&comiFillbackCacheId=' + encodeURIComponent(String(masterId))
  return { ok: true, masterId: String(masterId), templateId: String(templateId), templateName: String(templateName || ''), url }
}

export async function previewWeekly(config) {
  const { start, end } = currentWeekRange()
  const { list, weights, sources } = await collectWeekly(config, start, end)
  return {
    ok: true,
    start,
    end,
    sources,
    summary: buildWeeklySummary(list),
    rows: list.map((item, index) => ({ project: item.project, weight: weights[index], hours: item.hours, contents: item.contents })),
  }
}

export async function fillWeeklyDraft(config, masterId) {
  if (!masterId) throw new TodoError('input', '缺少 masterId')
  const snapshot = await readDraftSnapshot(config, masterId)
  const { list, weights, sources } = await collectWeekly(config, snapshot.start, snapshot.end)
  const url = await applyWeeklyRows(config, masterId, snapshot.data, list, weights, snapshot.start, snapshot.end, { value: snapshot.ownerValue, showValue: snapshot.ownerName })
  return {
    ok: true,
    url,
    sources,
    start: snapshot.start,
    end: snapshot.end,
    rows: list.map((item, index) => ({ project: item.project, weight: weights[index], hours: item.hours, contents: item.contents })),
  }
}

function stripHtmlText(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const MEETING_CACHE_PATH = join(CONFIG_DIR, 'meeting-cache.json')

function readMeetingCache() {
  try {
    const parsed = JSON.parse(readFileSync(MEETING_CACHE_PATH, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    return {}
  }
}

function writeMeetingCache(map) {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(MEETING_CACHE_PATH, JSON.stringify(map, null, 2) + '\n', 'utf8')
  } catch (error) {
    /* ignore */
  }
}

export async function fetchMeetings(config) {
  const raw = await callTool(config, T_MEETING_LIST, { listType: 'pending', pageNo: 1, pageSize: 12 })
  const data = unwrap(raw) || raw
  const rows = data && Array.isArray(data.data) ? data.data : []
  const items = []
  for (const row of rows.slice(0, 12)) {
    const item = {
      id: String(row.meetingId || ''),
      name: String(row.meetingName || ''),
      time: String(row.showTime || ''),
      location: String(row.location || row.roomName || ''),
      status: String(row.statusName || ''),
      creator: String(row.creatorName || ''),
      feedback: String(row.feedbackFlagName || ''),
      content: '',
      meetingNo: '',
      meetingNumber: '',
      joinUrl: '',
      roomId: '',
      roomName: '',
      detailUrl: '',
      declined: false,
    }
    if (!item.id) continue
    try {
      const detail = unwrap(await callTool(config, T_MEETING_DETAIL, { meetingId: item.id })) || {}
      const vo = detail.meetingVo || {}
      item.content = stripHtmlText(vo.content || '')
      item.meetingNo = String(vo.meetingPassword || '')
      const video = vo.videoMeetingId
      if (video && typeof video === 'object') {
        item.roomName = String(video.videoRoomName || '')
        item.roomId = String(video.videoRoomId || '')
      }
      item.detailUrl = absoluteUrl(vo.pcUrl || '', config.oaOrigin)
      const reply = detail.myReply || {}
      item.declined = String(reply.feedbackFlag) === '0' || /不参加/.test(String(reply.feedbackFlagName || ''))
      item.feedback = String(reply.feedbackFlagName || item.feedback || '')
    } catch (error) {
      /* keep list-level data when the detail call fails */
    }
    const cache = readMeetingCache()
    const saved = cache[item.id]
    if (saved) {
      item.meetingNumber = String(saved.number || '')
      item.joinUrl = String(saved.joinUrl || '')
    }
    items.push(item)
  }
  return items
}

export async function saveMeetingInfo(meetingId, info) {
  if (!meetingId) throw new TodoError('input', '缺少 meetingId')
  const cache = readMeetingCache()
  const previous = cache[meetingId] || {}
  cache[meetingId] = {
    number: String((info && info.number) || previous.number || ''),
    joinUrl: String((info && info.joinUrl) || previous.joinUrl || ''),
  }
  writeMeetingCache(cache)
  return { ok: true }
}

export async function setMeetingReceipt(config, meetingId, receiptType) {
  if (!meetingId) throw new TodoError('input', '缺少 meetingId')
  const raw = await callToolConfirmed(config, T_MEETING_RECEIPT, { meetingId: String(meetingId), receiptType: Number(receiptType) })
  return { ok: true, data: unwrap(raw) || raw }
}

function extractLabel(text, label, stopLabels) {
  const custom = (stopLabels || []).filter(Boolean)
  const base = custom.length ? custom.join('|') : '[\\u4e00-\\u9fa5A-Za-z0-9（）()]{1,18}'
  const re = new RegExp(label + '：([\\s\\S]*?)(?=\\n(?:' + base + ')：|\\n【明细表|$)')
  const match = String(text || '').match(re)
  return match ? match[1].trim() : ''
}

export async function previewProjectReport(config) {
  let report = null
  for (let page = 1; page <= 3 && !report; page += 1) {
    const raw = await callTool(config, T_AFFAIR_LIST, { baseParam: { state: 2, pageNo: page, pageSize: 50 } })
    const rows = pickRows(unwrap(raw))
    if (!rows.length) break
    report = rows.find((row) => String(row.subject || '').includes('项目周报')) || null
  }
  if (!report) throw new TodoError('report', '没有找到已提交的项目周报')

  const ex = unwrap(await callTool(config, T_FORM_EXTRACT, { affairId: String(report.affairId) })) || {}
  const text = String(ex.formText || '')
  const projectName = extractLabel(text, '项目名称', [])
  const progress = extractLabel(text, '当前完成进度', ['下一步关键要事'])
  const next = extractLabel(text, '下一步关键要事', ['进度目标'])

  const { start, end } = currentWeekRange()
  let mine = []
  try {
    const collected = await collectWeekly(config, start, end)
    mine = collected.list
  } catch (error) {
    mine = []
  }

  const others = []
  for (let page = 1; page <= 3; page += 1) {
    const raw = await callTool(config, T_AFFAIR_LIST, { baseParam: { state: 3, pageNo: page, pageSize: 50 } })
    const rows = pickRows(unwrap(raw))
    if (!rows.length) break
    for (const row of rows) {
      const subject = String(row.subject || '')
      if (!/工时登记|工作日志/.test(subject)) continue
      const otherEx = unwrap(await callTool(config, T_FORM_EXTRACT, { affairId: String(row.affairId) })) || {}
      const otherText = String(otherEx.formText || '')
      if (projectName && !otherText.includes(projectName)) continue
      const contents = []
      const parsed = parseWorklogText(otherText)
      for (const item of parsed.items) {
        if (item.content && !contents.includes(item.content)) contents.push(item.content)
      }
      if (!contents.length) {
        for (const block of otherText.split(/第\d+行：/)) {
          const match = block.match(/(?:MX-)?(?:工作内容|工作描述|本周工作内容|今日工作内容)：([\s\S]*?)(?=\n(?:MX-|[^\n：]{1,12}：)|$)/)
          if (match && match[1].trim() && !contents.includes(match[1].trim())) contents.push(match[1].trim())
        }
      }
      if (contents.length) others.push({ sender: String(row.senderName || ''), contents })
    }
    if (rows.length < 50) break
  }

  const mineLines = mine.map((item) => item.project + '：' + item.contents.join('；'))
  const otherLines = others.map((item) => (item.sender || '其他成员') + '：' + item.contents.join('；'))
  const progressText = [
    progress,
    mineLines.length ? '本周进展：\n' + mineLines.join('\n') : '',
    otherLines.length ? '其他成员进展：\n' + otherLines.join('\n') : '',
  ].filter(Boolean).join('\n\n')
  const nextText = next || '（沿用上一条周报的「下一步关键要事」，可自行补充）'

  return {
    ok: true,
    projectName,
    reportSubject: String(report.subject || ''),
    sections: [
      { key: 'progress', title: '当前完成进度', text: progressText },
      { key: 'next', title: '下一步关键要事', text: nextText },
    ],
    sources: { mine: mine.length, others: others.length },
  }
}

function currentWeekRange() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const fmt = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  const day = now.getDay() || 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1))
  const friday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 4)
  return { start: fmt(monday), end: fmt(friday) }
}

// ---------------------------------------------------------------- 示例数据
// ---------------------------------------------------------------- 示例数据

function demoItems() {
  const now = Date.now()
  const day = 86400000
  const fmt = (offset) => {
    const date = new Date(now + offset)
    const pad = (n) => String(n).padStart(2, '0')
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':00'
  }
  return [
    { id: 'demo-1', subject: '【BUG】客户A 登录页验证码偶发不显示', sender: '王工', receiveTime: fmt(-2 * day), deadline: fmt(-1 * day), level: 3, subState: 11, node: '研发负责人', template: 'BUG单', url: '', bodyType: 20 },
    { id: 'demo-2', subject: '客户B 满意度评分 72 分（合同 86 万）', sender: '李经理', receiveTime: fmt(-day), deadline: fmt(0), level: 3, subState: 12, node: '项目经理', template: '满意度评分', url: '', bodyType: 20 },
    { id: 'demo-3', subject: '交付项目周报-第43周', sender: '张顾问', receiveTime: fmt(-3 * day), deadline: fmt(2 * day), level: 2, subState: 12, node: '部门负责人', template: '交付项目周报', url: '', bodyType: 20 },
    { id: 'demo-4', subject: '资源协调申请单-实施顾问 2 人', sender: '赵主管', receiveTime: fmt(-4 * day), deadline: fmt(4 * day), level: 2, subState: 12, node: '资源经理', template: '资源协调申请单', url: '', bodyType: 20 },
    { id: 'demo-5', subject: '工时登记-2026-10-20', sender: '我', receiveTime: fmt(-day), deadline: fmt(0), level: 1, subState: 12, node: '本人填报', template: '工时登记', url: '', bodyType: 20 },
    { id: 'demo-6', subject: '合同用印申请-客户C 年框', sender: '钱助理', receiveTime: fmt(-5 * day), deadline: fmt(6 * day), level: 1, subState: 12, node: '法务审核', template: '用印申请', url: '', bodyType: 20 },
    { id: 'demo-7', subject: '关于国庆值班安排的通知', sender: '孙行政', receiveTime: fmt(-6 * day), deadline: '', level: 0, subState: 11, node: '知会', template: '', url: '', bodyType: 10 },
  ]
}

function demoDetail(id) {
  const item = demoItems().find((row) => row.id === id) || demoItems()[0]
  return {
    id: item.id,
    subject: item.subject,
    sender: item.sender,
    receiveTime: item.receiveTime,
    deadline: item.deadline,
    node: item.node,
    template: item.template,
    importantLevel: item.level,
    content: '<p>这是示例数据。配置好 MCP 授权码后，这里会显示真实单据正文。</p>',
    attachmentList: [{ name: '示例附件.pdf', size: 128000 }],
    opinionRequired: true,
    attitudeOptions: ['同意', '不同意', '已阅'],
    availableActions: ['审批', '退回', '加签'],
    finished: false,
    webUrl: item.url,
  }
}

// ---------------------------------------------------------------- Electron 注入

const runtime = {
  active: null,
  known: new Set(),
  timer: null,
  stopAt: 0,
  injected: new Map(),
  lastInjectedAt: 0,
  lastUrl: '',
  error: '',
}

let electronCache
let electronResolved = false

function getElectron() {
  if (electronResolved) return electronCache
  electronResolved = true
  try {
    const require = createRequire(import.meta.url)
    const mod = require('electron')
    electronCache = mod && typeof mod === 'object' && mod.webContents ? mod : null
  } catch {
    electronCache = null
  }
  return electronCache
}

function safeAllWebContents(electron) {
  try {
    const list = electron.webContents.getAllWebContents()
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function safeUrl(contents) {
  try {
    return contents.isDestroyed() ? '' : contents.getURL() || ''
  } catch {
    return ''
  }
}

function sameOrigin(a, b) {
  try {
    return new URL(a).origin === new URL(b).origin
  } catch {
    return false
  }
}

function buildPayload(target, config) {
  return {
    version: VERSION,
    affairId: target.id || '',
    subject: target.subject || '',
    attitude: config.attitude || '',
    templates: config.templates || [],
    fields: config.fields || [],
    injectedAt: Date.now(),
  }
}

function injectionScript(payload) {
  let source = ''
  try {
    source = readFileSync(join(HERE, 'inject.js'), 'utf8')
  } catch {
    source = '/* inject.js missing */'
  }
  return ';(function(){try{window.__SEEYON_TODO_PAYLOAD__=' + JSON.stringify(payload) + ';}catch(e){}})();\n' + source
}

async function injectInto(contents, config) {
  if (!runtime.active) return
  const url = safeUrl(contents)
  if (!url) return
  if (runtime.injected.get(contents.id) === url) return
  try {
    const script = injectionScript(buildPayload(runtime.active, config))
    await contents.executeJavaScript(script, true)
    runtime.injected.set(contents.id, url)
    runtime.lastInjectedAt = Date.now()
    runtime.lastUrl = url
    runtime.error = ''
  } catch (error) {
    runtime.error = error instanceof Error ? error.message : String(error)
  }
}

function matchesTarget(url) {
  if (!runtime.active || !runtime.active.url) return false
  return sameOrigin(url, runtime.active.url)
}

async function tick() {
  const electron = getElectron()
  if (!electron || !runtime.active) return
  const config = readConfig()
  const all = safeAllWebContents(electron)
  for (const contents of all) {
    if (!contents || contents.isDestroyed()) continue
    const id = contents.id
    const url = safeUrl(contents)
    if (!runtime.known.has(id)) {
      runtime.known.add(id)
      if (sameOrigin(url, config.oaOrigin)) {
        runtime.injected.set(id, '')
        void injectInto(contents, config)
      }
      try {
        contents.on('did-finish-load', () => {
          if (!runtime.active) return
          if (matchesTarget(safeUrl(contents))) void injectInto(contents, readConfig())
        })
        contents.on('did-navigate', () => {
          if (!runtime.active) return
          if (matchesTarget(safeUrl(contents))) void injectInto(contents, readConfig())
        })
        contents.on('destroyed', () => {
          runtime.known.delete(id)
          runtime.injected.delete(id)
        })
      } catch {
        // Older Electron builds may reject listener attachment; the poll below still works.
      }
    } else if (matchesTarget(url) && runtime.injected.get(id) !== url) {
      void injectInto(contents, config)
    }
  }
  if (Date.now() > runtime.stopAt) stopInjection()
}

function stopInjection() {
  if (runtime.timer) {
    clearInterval(runtime.timer)
    runtime.timer = null
  }
}

function startInjection(target) {
  const electron = getElectron()
  runtime.active = target
  runtime.injected.clear()
  runtime.known.clear()
  runtime.error = ''
  runtime.stopAt = Date.now() + 120000
  if (!electron) {
    runtime.active = null
    runtime.error = '当前宿主不是 Desktop（Electron），无法往 OA 页面注入按钮'
    return { ok: false, electron: false, error: runtime.error }
  }
  const all = safeAllWebContents(electron)
  for (const contents of all) {
    if (contents && !contents.isDestroyed()) runtime.known.add(contents.id)
  }
  if (!runtime.timer) runtime.timer = setInterval(() => { void tick() }, 700)
  void tick()
  return { ok: true, electron: true }
}

function injectionStatus() {
  return {
    electron: Boolean(getElectron()),
    active: Boolean(runtime.active),
    targetUrl: runtime.active ? runtime.active.url : '',
    lastInjectedAt: runtime.lastInjectedAt,
    lastUrl: runtime.lastUrl,
    error: runtime.error,
  }
}

// ---------------------------------------------------------------- HTTP 工具

function sendJson(response, status, value) {
  const body = Buffer.from(JSON.stringify(value), 'utf8')
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Length': body.length,
  })
  response.end(body)
}

function readJsonBody(request, limit = 128 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
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
      if (!chunks.length) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('请求体不是合法 JSON'))
      }
    })
    request.on('error', reject)
  })
}

function isTrustedRequest(request) {
  const host = String(request.headers.host || '')
  if (!host) return false
  const origin = request.headers.origin
  if (!origin) return true
  try {
    const url = new URL(String(origin))
    return url.host === host
  } catch {
    return false
  }
}

function methodGuard(request, response, allowed) {
  if (allowed.includes(request.method || '')) return true
  response.writeHead(405, { Allow: allowed.join(', ') })
  response.end()
  return false
}

// ---------------------------------------------------------------- 插件入口

export function apply(ctx) {
  ctx.effect(() => {
    const disposers = []
    const route = (path, handler) => {
      disposers.push(ctx.webServer.register({ kind: 'exact', path: ROUTE + path, handler }))
    }

    route('/meeting-info', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = await readJsonBody(request, 8 * 1024)
        const result = await saveMeetingInfo(body.meetingId, { number: body.number, joinUrl: body.joinUrl })
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    route('/meetings', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const items = await fetchMeetings(config)
        sendJson(response, 200, { ok: true, items })
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/meeting-receipt', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const body = await readJsonBody(request, 8 * 1024)
        const result = await setMeetingReceipt(config, body.meetingId, body.receiptType)
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/report/preview', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        sendJson(response, 200, await previewProjectReport(config))
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/templates', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const items = await listTemplates(config)
        sendJson(response, 200, { ok: true, items })
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/draft', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const body = await readJsonBody(request, 8 * 1024)
        const result = await createFormDraft(config, body.templateId, body.templateName)
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/weekly/preview', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const result = await previewWeekly(config)
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/weekly/fill', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const body = await readJsonBody(request, 8 * 1024)
        const result = await fillWeeklyDraft(config, body.masterId)
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/weekly', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        if (config.demo) throw new TodoError('demo', '示例数据不能生成周计划草稿')
        if (!config.token) throw new TodoError('config', '还没有配置 MCP 授权码')
        const result = await prepareWeeklyPlan(config)
        sendJson(response, 200, result)
      } catch (error) {
        sendJson(response, 500, { ok: false, error: describeError(error, config) })
      }
    })

    route('/login', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      sendJson(response, 200, {
        ok: Boolean(config.oaUsername && config.oaPassword),
        username: config.oaUsername,
        password: config.oaPassword,
      })
    })

    route('/bootstrap', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      sendJson(response, 200, {
        ok: true,
        version: VERSION,
        config: publicConfig(config),
        injection: injectionStatus(),
        levels: LEVEL_LABELS,
      })
    })

    route('/config', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = await readJsonBody(request)
        const current = readConfig()
        const next = mergeConfig(current, body && body.config ? body.config : body)
        if (!isHttpsOrLoopback(next.gatewayUrl)) {
          return sendJson(response, 400, { ok: false, error: '网关地址必须是 https（本机调试可用 http://127.0.0.1）' })
        }
        writeConfig(next)
        sendJson(response, 200, { ok: true, config: publicConfig(next) })
      } catch (error) {
        sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    route('/test', async (request, response) => {
      if (!methodGuard(request, response, ['POST', 'GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      const startedAt = Date.now()
      try {
        if (!config.token) throw new TodoError('config', '还没有配置 MCP 授权码')
        const counts = await fetchCounts(config)
        sendJson(response, 200, {
          ok: true,
          message: '连接正常：待办 ' + counts.pending + ' 条 / 已办 ' + counts.done + ' 条',
          counts,
          elapsedMs: Date.now() - startedAt,
        })
      } catch (error) {
        const info = describeError(error, config)
        sendJson(response, 200, { ok: false, error: info, elapsedMs: Date.now() - startedAt })
      }
    })

    route('/todos', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      try {
        const data = await fetchTodos(config)
        sendJson(response, 200, { ok: true, ...data, levels: LEVEL_LABELS })
      } catch (error) {
        const info = describeError(error, config)
        sendJson(response, 200, { ok: false, error: info, items: [], total: 0, demo: config.demo })
      }
    })

    route('/detail', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      const config = readConfig()
      const url = new URL(String(request.url || '/'), 'http://localhost')
      const id = url.searchParams.get('id') || ''
      try {
        const detail = await fetchDetail(config, id)
        sendJson(response, 200, { ok: true, detail })
      } catch (error) {
        const info = describeError(error, config)
        sendJson(response, 200, { ok: false, error: info, detail: null })
      }
    })

    route('/open', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = await readJsonBody(request)
        const url = String((body && body.url) || '').trim()
        if (!/^https?:\/\//i.test(url)) return sendJson(response, 400, { ok: false, error: '无效的链接' })
        const config = readConfig()
        if (!sameOrigin(url, config.oaOrigin)) {
          return sendJson(response, 400, { ok: false, error: '链接不在配置的 OA 站点下：' + config.oaOrigin })
        }
        const target = { url, id: String((body && body.id) || ''), subject: String((body && body.subject) || '') }
        const result = config.autoInject ? startInjection(target) : { ok: false, electron: false, error: '自动注入已关闭' }
        sendJson(response, 200, { ok: true, injection: result, status: injectionStatus() })
      } catch (error) {
        sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    route('/inject', async (request, response) => {
      if (!methodGuard(request, response, ['GET', 'POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      if (request.method === 'POST') {
        try {
          const body = await readJsonBody(request)
          const config = readConfig()
          const url = String((body && body.url) || '').trim()
          if (!/^https?:\/\//i.test(url) || !sameOrigin(url, config.oaOrigin)) {
            return sendJson(response, 400, { ok: false, error: '需要当前 OA 站点的链接' })
          }
          const result = startInjection({ url, id: String((body && body.id) || ''), subject: String((body && body.subject) || '') })
          return sendJson(response, 200, { ok: result.ok, injection: result, status: injectionStatus() })
        } catch (error) {
          return sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
        }
      }
      sendJson(response, 200, { ok: true, status: injectionStatus() })
    })

    route('/assistant.js', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = Buffer.from(readFileSync(join(HERE, 'inject.js'), 'utf8'), 'utf8')
        response.writeHead(200, {
          'Content-Type': 'text/javascript; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Length': body.length,
        })
        response.end(body)
      } catch (error) {
        sendJson(response, 500, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    route('/log', async (request, response) => {
      if (!methodGuard(request, response, ['POST'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      try {
        const body = await readJsonBody(request, 32 * 1024)
        const line = new Date().toISOString() + ' ' + JSON.stringify(body) + '\n'
        mkdirSync(CONFIG_DIR, { recursive: true })
        let size = 0
        try {
          size = statSync(DEBUG_LOG).size
        } catch {
          size = 0
        }
        if (size > DEBUG_LOG_LIMIT) {
          try {
            renameSync(DEBUG_LOG, DEBUG_LOG + '.1')
          } catch {
            /* ignore */
          }
        }
        appendFileSync(DEBUG_LOG, line, 'utf8')
        sendJson(response, 200, { ok: true })
      } catch (error) {
        sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : String(error) })
      }
    })

    route('/debug', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      if (!isTrustedRequest(request)) return sendJson(response, 403, { ok: false, error: 'forbidden' })
      let text = ''
      try {
        text = readFileSync(DEBUG_LOG, 'utf8')
      } catch {
        text = ''
      }
      const body = Buffer.from(text.slice(-64000), 'utf8')
      response.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'Content-Length': body.length,
      })
      response.end(body)
    })

    route('/health', async (request, response) => {
      if (!methodGuard(request, response, ['GET'])) return
      const config = readConfig()
      let requireType = 'n/a'
      try {
        const require = createRequire(import.meta.url)
        const mod = require('electron')
        requireType = mod === null ? 'null' : typeof mod === 'string' ? 'string:' + mod.slice(0, 40) : typeof mod + ':' + Object.keys(mod || {}).slice(0, 5).join('|')
      } catch (error) {
        requireType = 'error:' + (error instanceof Error ? error.message : String(error))
      }
      sendJson(response, 200, {
        ok: true,
        version: VERSION,
        configPath: CONFIG_PATH,
        hasToken: Boolean(config.token),
        gatewayUrl: config.gatewayUrl,
        electron: Boolean(getElectron()),
        processType: process.type || 'node',
        electronVersion: process.versions.electron || '',
        argv0: String(process.argv[0] || '').slice(0, 80),
        requireType,
      })
    })

    return () => {
      stopInjection()
      for (const dispose of disposers) {
        try {
          dispose()
        } catch {
          // The host may already have disposed the route.
        }
      }
    }
  }, 'dsh-seeyon-todo: routes')

  ctx.effect(() => () => stopInjection(), 'dsh-seeyon-todo: injection')
}

export const __internal = { mergeConfig, sanitizeTemplates, sanitizeFields, mapAffair, parsePayload, demoItems }
