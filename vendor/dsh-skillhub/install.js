/**
 * Skill package installation helpers.
 *
 * A SkillHub version download is a flat ZIP whose root contains SKILL.md and
 * optional references/scripts. Install it under ~/.agents/skills, the same
 * directory the Harness skill provider scans. The ZIP is untrusted input:
 * paths, counts, and sizes are validated before anything is written.
 */

import { homedir } from 'node:os'
import { dirname, isAbsolute, join, relative } from 'node:path'
import { existsSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { unzipSync } from './vendor/fflate.mjs'

export const SKILLS_ROOT = process.env.DSH_SKILLHUB_SKILLS_ROOT || join(homedir(), '.agents', 'skills')

export const LIMITS = {
  downloadBytes: 30 * 1024 * 1024,
  unzippedBytes: 60 * 1024 * 1024,
  fileBytes: 20 * 1024 * 1024,
  fileCount: 800,
  bodyBytes: 8 * 1024,
}

export class InstallError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.name = 'InstallError'
    this.code = code
    this.status = status
  }
}

/**
 * Normalize and validate one archive path. Returns null when the path could
 * escape the target directory or is not representable on Windows.
 * @param {unknown} value
 * @returns {string | null}
 */
export function safeRelativePath(value) {
  if (typeof value !== 'string') return null
  let name = value.replace(/\\/g, '/').replace(/^\.\/+/, '')
  if (!name || name.startsWith('/') || /^[A-Za-z]:/.test(name)) return null
  if (/[\0-\x1f<>:"|?*]/.test(name)) return null
  if (name.length > 240) return null
  const parts = name.split('/')
  if (parts.some((part) => !part || part === '.' || part === '..' || /[. ]$/.test(part))) return null
  return name
}

/**
 * Read the small YAML frontmatter block and return its name value.
 * @param {string} text
 * @returns {string}
 */
export function parseFrontmatterName(text) {
  const source = String(text || '').replace(/^\uFEFF/, '')
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!match) return ''
  const line = match[1].match(/^name:\s*(.+)\s*$/m)
  if (!line) return ''
  return line[1].trim().replace(/^['"]|['"]$/g, '').trim()
}

/**
 * Turn a SKILL.md name or SkillHub slug into a safe directory name.
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeSkillName(value) {
  const name = String(value == null ? '' : value).trim().replace(/^['"]|['"]$/g, '').trim()
  if (!name || name.length > 80) return ''
  if (/[\/\\:*?"<>|\0-\x1f]/.test(name)) return ''
  if (name === '.' || name === '..' || /[. ]$/.test(name)) return ''
  return name
}

function stripCommonRoot(entries) {
  if (entries.length === 0) return entries
  const roots = new Set(entries.map((entry) => entry.name.split('/')[0]))
  if (roots.size !== 1) return entries
  const root = [...roots][0]
  if (!entries.some((entry) => entry.name === root + '/SKILL.md')) return entries
  return entries.map((entry) => ({ name: entry.name.slice(root.length + 1), data: entry.data }))
}

/**
 * Validate and expand a SkillHub ZIP in memory.
 * @param {Buffer | Uint8Array} input
 * @param {string} fallbackName
 * @returns {{ name: string, entries: { name: string, data: Buffer }[], skillText: string }}
 */
export function extractSkillZip(input, fallbackName = '') {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input)
  if (buffer.length === 0) throw new InstallError('empty-package', 'the downloaded package is empty', 502)
  if (buffer.length > LIMITS.downloadBytes) throw new InstallError('package-too-large', 'the downloaded package is too large', 413)
  if (buffer[0] !== 0x50 || buffer[1] !== 0x4b) throw new InstallError('not-zip', 'the downloaded file is not a ZIP package', 502)

  let count = 0
  let total = 0
  let raw
  try {
    raw = unzipSync(new Uint8Array(buffer), {
      filter(file) {
        const original = String(file.name || '')
        if (original.endsWith('/') || original.startsWith('__MACOSX/') || original.endsWith('/.DS_Store') || original === '.DS_Store') return false
        const safe = safeRelativePath(original)
        if (!safe) throw new InstallError('unsafe-path', 'the package contains an unsafe path: ' + original, 422)
        const size = Number(file.originalSize || 0)
        if (size > LIMITS.fileBytes) throw new InstallError('file-too-large', 'a file in the package is too large', 413)
        total += size
        count += 1
        if (count > LIMITS.fileCount) throw new InstallError('too-many-files', 'the package contains too many files', 413)
        if (total > LIMITS.unzippedBytes) throw new InstallError('package-too-large', 'the expanded package is too large', 413)
        return true
      },
    })
  } catch (error) {
    if (error instanceof InstallError) throw error
    throw new InstallError('invalid-zip', 'the downloaded package is not a valid ZIP', 502)
  }

  let entries = []
  for (const [rawName, data] of Object.entries(raw)) {
    const name = safeRelativePath(rawName)
    if (!name) continue
    entries.push({ name, data: Buffer.from(data) })
  }
  entries = stripCommonRoot(entries)
  const skillEntry = entries.find((entry) => entry.name === 'SKILL.md')
  if (!skillEntry) throw new InstallError('missing-skill-md', 'the package does not contain SKILL.md', 422)
  const skillText = skillEntry.data.toString('utf8')
  const name = sanitizeSkillName(parseFrontmatterName(skillText)) || sanitizeSkillName(fallbackName)
  if (!name) throw new InstallError('invalid-name', 'the package does not declare a usable skill name', 422)
  return { name, entries, skillText }
}

/**
 * Install one ZIP under targetRoot. Existing skills are never overwritten.
 * @param {Buffer | Uint8Array} input
 * @param {string} targetRoot
 * @param {string} fallbackName
 * @returns {{ alreadyInstalled: boolean, name: string, path: string, files: number }}
 */
export function installSkillPackage(input, targetRoot = SKILLS_ROOT, fallbackName = '') {
  const { name, entries } = extractSkillZip(input, fallbackName)
  mkdirSync(targetRoot, { recursive: true })
  const target = join(targetRoot, name)
  if (existsSync(target)) {
    return { alreadyInstalled: true, name, path: target, files: entries.length }
  }

  const temp = join(targetRoot, '.skillhub-installing-' + randomUUID())
  try {
    mkdirSync(temp, { recursive: true })
    for (const entry of entries) {
      const destination = join(temp, entry.name)
      const inside = relative(temp, destination)
      if (!inside || inside.startsWith('..') || isAbsolute(inside)) {
        throw new InstallError('unsafe-path', 'the package contains an unsafe path: ' + entry.name, 422)
      }
      mkdirSync(dirname(destination), { recursive: true })
      writeFileSync(destination, entry.data)
    }
    if (!existsSync(join(temp, 'SKILL.md'))) throw new InstallError('missing-skill-md', 'the package does not contain SKILL.md', 422)
    try {
      renameSync(temp, target)
    } catch (error) {
      if (existsSync(target)) {
        rmSync(temp, { recursive: true, force: true })
        return { alreadyInstalled: true, name, path: target, files: entries.length }
      }
      throw error
    }
  } catch (error) {
    rmSync(temp, { recursive: true, force: true })
    throw error
  }
  return { alreadyInstalled: false, name, path: target, files: entries.length }
}

/**
 * Read a small JSON request body without buffering unbounded input.
 * @param {import('node:http').IncomingMessage} request
 * @returns {Promise<Record<string, unknown>>}
 */
export function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0
    let tooLarge = false
    const chunks = []
    request.on('data', (chunk) => {
      if (tooLarge) return
      size += chunk.length
      if (size > LIMITS.bodyBytes) {
        tooLarge = true
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      if (tooLarge) {
        reject(new InstallError('body-too-large', 'the request body is too large', 413))
        return
      }
      if (chunks.length === 0) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (error) {
        reject(new InstallError('invalid-json', 'the request body is not valid JSON', 400))
      }
    })
    request.on('error', (error) => reject(error))
  })
}

/**
 * Require a same-origin browser request. A missing Origin is accepted only
 * when the browser explicitly marks the request as same-origin/none.
 * @param {import('node:http').IncomingMessage} request
 * @returns {boolean}
 */
export function isTrustedRequest(request) {
  const site = request.headers['sec-fetch-site']
  if (site === 'same-origin' || site === 'none') return true
  const origin = request.headers.origin
  const host = request.headers.host
  if (!host) return false
  if (origin) {
    try {
      return new URL(origin).host === host
    } catch (error) {
      return false
    }
  }
  const referer = request.headers.referer
  if (referer) {
    try {
      return new URL(referer).host === host
    } catch (error) {
      return false
    }
  }
  return false
}
