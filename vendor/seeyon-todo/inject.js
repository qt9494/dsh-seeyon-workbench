
/**
 * Seeyon form assistant — runs inside the OA page (injected by the Host via
 * Electron). Renders a floating panel with opinion templates, an attitude
 * picker, one-click field filling, and a point-and-pick field mapper.
 *
 * It is deliberately framework-free and namespaced: the OA page is a jQuery
 * application, and anything global we touch must survive its re-renders.
 */
(function () {
  'use strict'

  var MOUNT_ID = '__seeyon_todo_assistant__'
  var STORAGE = {
    opinion: 'seeyon-todo:opinion',
    attitude: 'seeyon-todo:attitude',
    fields: 'seeyon-todo:fields',
  }
  var payload = window.__SEEYON_TODO_PAYLOAD__ || null
  if (!payload || typeof payload !== 'object' || !payload.version) return

  var existing = document.getElementById(MOUNT_ID)
  if (existing && existing.__seeyonAssistant) {
    existing.__seeyonAssistant.update(payload)
    return
  }

  // ---------------------------------------------------------------- utilities

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(String(value))
    return String(value).replace(/[^a-zA-Z0-9_-]/g, function (ch) { return '\\' + ch })
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false
    try {
      var style = window.getComputedStyle(el)
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false
      var rect = el.getBoundingClientRect()
      return rect.width > 2 && rect.height > 2
    } catch (error) {
      return false
    }
  }

  function cssPath(el, root) {
    if (!el || el.nodeType !== 1) return ''
    var doc = root || el.ownerDocument
    if (el.id && doc.querySelectorAll('#' + cssEscape(el.id)).length === 1) return '#' + cssEscape(el.id)
    var parts = []
    var node = el
    while (node && node.nodeType === 1 && node !== doc.body && parts.length < 8) {
      if (node.id && doc.querySelectorAll('#' + cssEscape(node.id)).length === 1) {
        parts.unshift('#' + cssEscape(node.id))
        break
      }
      var tag = node.tagName.toLowerCase()
      var index = 1
      var sibling = node
      while ((sibling = sibling.previousElementSibling)) {
        if (sibling.tagName === node.tagName) index += 1
      }
      parts.unshift(tag + ':nth-of-type(' + index + ')')
      node = node.parentElement
    }
    return parts.join(' > ')
  }

  function frameRecord(frameEl) {
    if (!frameEl) return null
    var stack = []
    var current = frameEl
    var doc = document
    while (current) {
      var index = 0
      var host = current.ownerDocument
      var frames = host.querySelectorAll('iframe, frame')
      for (var i = 0; i < frames.length; i += 1) {
        if (frames[i] === current) index = i
      }
      stack.unshift(cssPath(current))
      var owner = current.ownerDocument
      var nextDoc = owner.defaultView
      var parentFrame = null
      try {
        if (nextDoc && nextDoc.frameElement) parentFrame = nextDoc.frameElement
      } catch (error) {
        parentFrame = null
      }
      current = parentFrame
    }
    return stack
  }

  function recordFor(el) {
    var doc = el.ownerDocument
    var frameStack = []
    var win = doc.defaultView
    try {
      while (win && win.frameElement) {
        frameStack.unshift(cssPath(win.frameElement))
        win = win.frameElement.ownerDocument.defaultView
      }
    } catch (error) {
      frameStack = []
    }
    return { frames: frameStack, sel: cssPath(el) }
  }

  function resolveRecord(record) {
    if (!record || !record.sel) return null
    var doc = document
    if (Array.isArray(record.frames)) {
      for (var i = 0; i < record.frames.length; i += 1) {
        var frameEl = doc.querySelector(record.frames[i])
        if (!frameEl) return null
        try {
          doc = frameEl.contentDocument
        } catch (error) {
          return null
        }
        if (!doc) return null
      }
    }
    try {
      var el = doc.querySelector(record.sel)
      return el || null
    } catch (error) {
      return null
    }
  }

  function readStore(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch (error) {
      return fallback
    }
  }

  function writeStore(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      /* storage may be blocked; the assistant still works for this page */
    }
  }

  function visibleText(el, limit) {
    try {
      var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim()
      return text.slice(0, limit || 200)
    } catch (error) {
      return ''
    }
  }

  function nearbyLabel(el) {
    var node = el
    for (var depth = 0; depth < 5 && node; depth += 1) {
      var container = node.parentElement
      if (!container) break
      var labelEls = container.querySelectorAll('label, th, .label, .form-label, .td_title, .field-label')
      for (var i = 0; i < labelEls.length; i += 1) {
        var text = visibleText(labelEls[i], 60)
        if (text && text.length <= 40) return text.replace(/[:：*＊\s]+$/, '')
      }
      var previous = node.previousElementSibling
      if (previous) {
        var previousText = visibleText(previous, 60)
        if (previousText && previousText.length <= 40 && !previous.querySelector('input,textarea,select')) {
          return previousText.replace(/[:：*＊\s]+$/, '')
        }
      }
      node = container
    }
    var placeholder = el.getAttribute && (el.getAttribute('placeholder') || el.getAttribute('title') || el.getAttribute('aria-label'))
    return placeholder ? String(placeholder).slice(0, 40) : ''
  }

  function editableElements(doc) {
    var list = []
    var selector = 'textarea, input[type="text"], input:not([type]), [contenteditable="true"], [contenteditable=""]'
    var found = doc.querySelectorAll(selector)
    for (var i = 0; i < found.length; i += 1) list.push(found[i])
    var frames = doc.querySelectorAll('iframe')
    for (var j = 0; j < frames.length; j += 1) {
      try {
        var inner = frames[j].contentDocument
        if (inner) list = list.concat(editableElements(inner))
      } catch (error) {
        /* cross-origin: skip */
      }
    }
    return list
  }

  function setControlValue(el, value) {
    if (!el) return false
    var tag = el.tagName ? el.tagName.toLowerCase() : ''
    if (tag === 'input' || tag === 'textarea') {
      var proto = tag === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
      var descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
      if (descriptor && descriptor.set) descriptor.set.call(el, value)
      else el.value = value
      el.dispatchEvent(new Event('input', { bubbles: true }))
      el.dispatchEvent(new Event('change', { bubbles: true }))
      el.dispatchEvent(new Event('blur', { bubbles: true }))
      return true
    }
    if (tag === 'select') {
      var options = Array.prototype.slice.call(el.options || [])
      var match = options.find(function (option) { return option.textContent.trim() === String(value) }) ||
        options.find(function (option) { return option.textContent.indexOf(String(value)) >= 0 })
      if (!match) return false
      el.value = match.value
      el.dispatchEvent(new Event('change', { bubbles: true }))
      return true
    }
    var isEditorBody = tag === 'body' || (el.ownerDocument && el.ownerDocument.designMode === 'on')
    if (isEditorBody) {
      try {
        el.innerHTML = '<p>' + String(value).replace(/[<>&]/g, function (ch) { return ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : '&amp;' }) + '</p>'
        el.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
        return true
      } catch (error) {
        return false
      }
    }
    if (el.isContentEditable || String(el.getAttribute('contenteditable')) === 'true') {
      try {
        el.focus()
        el.innerHTML = ''
        var paragraph = el.ownerDocument.createElement('p')
        paragraph.textContent = value
        el.appendChild(paragraph)
        el.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: 'insertText', data: value }))
        el.dispatchEvent(new Event('change', { bubbles: true }))
        return true
      } catch (error) {
        return false
      }
    }
    return false
  }

  // ---------------------------------------------------------------- element finders

  function scoreOpinionCandidate(el) {
    var attrs = [
      String(el.id || ''),
      String(el.getAttribute('name') || ''),
      String(el.className || ''),
      String(el.getAttribute('placeholder') || ''),
      String(el.getAttribute('title') || ''),
    ].join(' ').toLowerCase()
    var score = 0
    if (/opinion|attitude|suggest/.test(attrs)) score += 45
    if (/意见/.test(attrs)) score += 45
    if (/edui|ueditor|editor|contenteditable/.test(attrs)) score += 25
    if (/content|comment|remark/.test(attrs)) score += 15
    var label = ''
    try {
      label = (el.closest('tr, .form-row, .field, li, div') || {}).innerText || ''
    } catch (error) {
      label = ''
    }
    if (/处理意见|签批意见|意见|审批意见/.test(label)) score += 35
    var tag = String(el.tagName || '').toLowerCase()
    if (tag === 'textarea') score += 20
    if (el.isContentEditable) score += 10
    if (el.disabled || el.readOnly) score -= 100
    if (!isVisible(el)) score -= 60
    try {
      var rect = el.getBoundingClientRect()
      if (rect.width > 300 && rect.height > 60) score += 12
    } catch (error) {
      /* ignore */
    }
    return score
  }

  function findOpinionEditor() {
    var saved = resolveRecord(readStore(STORAGE.opinion, null))
    if (saved && isVisible(saved)) return saved

    var candidates = editableElements(document)
    var best = null
    var bestScore = -Infinity
    for (var i = 0; i < candidates.length; i += 1) {
      var el = candidates[i]
      var type = String(el.getAttribute('type') || '').toLowerCase()
      if (type === 'hidden' || type === 'checkbox' || type === 'radio' || type === 'file') continue
      var score = scoreOpinionCandidate(el)
      if (score > bestScore) {
        bestScore = score
        best = el
      }
    }
    return bestScore >= 35 ? best : null
  }

  function findAttitudeControl() {
    var saved = resolveRecord(readStore(STORAGE.attitude, null))
    if (saved && isVisible(saved)) return saved

    var selects = document.querySelectorAll('select')
    var best = null
    var bestScore = -Infinity
    for (var i = 0; i < selects.length; i += 1) {
      var el = selects[i]
      if (!isVisible(el)) continue
      var text = Array.prototype.map.call(el.options || [], function (option) { return option.textContent }).join(' ')
      var attrs = String(el.id || '') + ' ' + String(el.getAttribute('name') || '') + ' ' + String(el.className || '')
      var score = 0
      if (/同意/.test(text)) score += 30
      if (/不同意/.test(text)) score += 20
      if (/attitude|result|opinion|态度|结果/i.test(attrs)) score += 40
      if (/请选择|--/.test(text)) score += 5
      if (score > bestScore) {
        bestScore = score
        best = el
      }
    }
    if (bestScore >= 30) return best
    return null
  }

  function controlSelector() {
    return 'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select, [contenteditable="true"]'
  }

  function controlIn(container) {
    if (!container) return null
    if (container.matches && container.matches(controlSelector()) && isVisible(container)) return container
    if (!container.querySelector) return null
    var found = container.querySelectorAll(controlSelector())
    for (var i = 0; i < found.length; i += 1) {
      if (isVisible(found[i])) return found[i]
    }
    return null
  }

  function nearestControl(container, node) {
    if (!container || !container.querySelectorAll) return null
    var candidates = container.querySelectorAll(controlSelector())
    var best = null
    var bestScore = Infinity
    var nodeRect
    try {
      nodeRect = node.getBoundingClientRect()
    } catch (error) {
      nodeRect = { top: 0, left: 0 }
    }
    for (var i = 0; i < candidates.length; i += 1) {
      var el = candidates[i]
      if (!isVisible(el) || el === node) continue
      var rect
      try {
        rect = el.getBoundingClientRect()
      } catch (error) {
        continue
      }
      var score = Math.abs(rect.top - nodeRect.top) * 4 + Math.abs(rect.left - nodeRect.left)
      if (score < bestScore) {
        bestScore = score
        best = el
      }
    }
    return best
  }

  function findControlForLabelNode(node) {
    var text = visibleText(node, 80).replace(/[:：*＊\s]+$/, '')
    if (node.tagName === 'LABEL' && node.getAttribute('for')) {
      try {
        var byFor = document.getElementById(node.getAttribute('for'))
        if (byFor && isVisible(byFor)) return byFor
      } catch (error) {
        /* ignore */
      }
    }
    var sibling = node.nextElementSibling
    while (sibling) {
      var inside = controlIn(sibling)
      if (inside) return inside
      sibling = sibling.nextElementSibling
    }
    var container = node.parentElement
    for (var depth = 0; depth < 4 && container; depth += 1) {
      var nearest = nearestControl(container, node)
      if (nearest) return nearest
      container = container.parentElement
    }
    return null
  }

  function findFieldByLabel(label) {
    var needle = String(label || '').trim()
    if (!needle) return null
    var maps = readStore(STORAGE.fields, [])
    for (var m = 0; m < maps.length; m += 1) {
      if (maps[m] && maps[m].label === needle) {
        var mapped = resolveRecord(maps[m].record)
        if (mapped && isVisible(mapped)) return mapped
      }
    }
    var nodes = document.querySelectorAll('label, th, td, .label, .td_title, .form-label, .field-label, span, div')
    for (var i = 0; i < nodes.length; i += 1) {
      var node = nodes[i]
      if (node.children.length > 3) continue
      var text = visibleText(node, 80).replace(/[:：*＊\s]+$/, '')
      if (!text || text !== needle) continue
      var control = findControlForLabelNode(node)
      if (control) return control
    }
    return null
  }

  // ---------------------------------------------------------------- actions

  function setOpinion(text) {
    var editor = findOpinionEditor()
    if (!editor) {
      toast('没找到意见输入框，先点「拾取元素」指定一次', 'warn')
      return false
    }
    var ok = setControlValue(editor, text)
    if (ok) {
      toast('意见已填入', 'ok')
      try {
        editor.scrollIntoView({ block: 'center', behavior: 'smooth' })
      } catch (error) {
        /* ignore */
      }
    } else {
      toast('这个输入框没法直接写值，请手动粘贴', 'warn')
    }
    return ok
  }

  function setAttitude(text) {
    var value = String(text || '').trim()
    if (!value) return false
    var control = findAttitudeControl()
    if (!control) {
      toast('没找到审批态度控件，可先「拾取元素」指定', 'warn')
      return false
    }
    if (String(control.tagName).toLowerCase() === 'select') {
      var options = Array.prototype.slice.call(control.options || [])
      var match = options.find(function (option) { return option.textContent.trim() === value }) ||
        options.find(function (option) { return option.textContent.indexOf(value) >= 0 })
      if (!match) {
        toast('这个下拉里没有「' + value + '」', 'warn')
        return false
      }
      control.value = match.value
      control.dispatchEvent(new Event('change', { bubbles: true }))
      toast('态度已选：' + value, 'ok')
      return true
    }
    var radios = document.querySelectorAll('input[type="radio"]')
    for (var i = 0; i < radios.length; i += 1) {
      var radio = radios[i]
      var label = ''
      if (radio.id) {
        var labelEl = document.querySelector('label[for="' + cssEscape(radio.id) + '"]')
        if (labelEl) label = visibleText(labelEl, 40)
      }
      if (!label) label = visibleText(radio.parentElement, 40)
      if (label.indexOf(value) >= 0) {
        radio.click()
        toast('态度已选：' + value, 'ok')
        return true
      }
    }
    toast('找到了控件但没匹配到「' + value + '」', 'warn')
    return false
  }

  function fillFields() {
    var fields = Array.isArray(payload.fields) ? payload.fields : []
    var maps = readStore(STORAGE.fields, [])
    var filled = 0
    var missed = []
    for (var i = 0; i < fields.length; i += 1) {
      var field = fields[i]
      if (!field || !field.label) continue
      var target = findFieldByLabel(field.label)
      if (target && setControlValue(target, String(field.value == null ? '' : field.value))) filled += 1
      else missed.push(field.label)
    }
    for (var j = 0; j < maps.length; j += 1) {
      var map = maps[j]
      if (!map || !map.label || !map.value) continue
      var mapped = resolveRecord(map.record)
      if (mapped && setControlValue(mapped, String(map.value))) filled += 1
    }
    if (filled > 0) toast('已填入 ' + filled + ' 个字段' + (missed.length ? '，未找到：' + missed.join('、') : ''), missed.length ? 'warn' : 'ok')
    else toast(fields.length || maps.length ? '没匹配到字段，先用「拾取元素」绑定一次' : '还没有配置字段模板（设置 → 字段填入）', 'warn')
    return filled
  }

  // ---------------------------------------------------------------- picker

  var picking = false
  var pickHandler = null
  var pickMove = null

  function startPicking() {
    if (picking) return
    picking = true
    closePanel()
    var highlight = document.createElement('div')
    highlight.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #4f6ef7;background:rgba(79,110,247,.12);border-radius:4px;transition:all .06s linear;'
    document.documentElement.appendChild(highlight)

    pickMove = function (event) {
      var target = event.target
      if (!target || target.nodeType !== 1) return
      var rect = target.getBoundingClientRect()
      highlight.style.left = rect.left + 'px'
      highlight.style.top = rect.top + 'px'
      highlight.style.width = rect.width + 'px'
      highlight.style.height = rect.height + 'px'
    }
    pickHandler = function (event) {
      event.preventDefault()
      event.stopPropagation()
      var target = event.target
      stopPicking()
      if (!target || target.nodeType !== 1) return
      askMapping(target)
    }
    document.addEventListener('mousemove', pickMove, true)
    document.addEventListener('mousedown', pickHandler, true)
    document.addEventListener('click', pickHandler, true)
    toast('进入拾取模式：点一下要填的表单控件，Esc 取消', 'info')
    window.addEventListener('keydown', escPick)
    window.__seeyonPickHighlight = highlight
  }

  function escPick(event) {
    if (event.key === 'Escape') stopPicking()
  }

  function stopPicking() {
    if (!picking) return
    picking = false
    if (pickHandler) {
      document.removeEventListener('mousedown', pickHandler, true)
      document.removeEventListener('click', pickHandler, true)
    }
    if (pickMove) document.removeEventListener('mousemove', pickMove, true)
    window.removeEventListener('keydown', escPick)
    pickHandler = null
    pickMove = null
    try {
      var highlight = window.__seeyonPickHighlight
      if (highlight && highlight.parentNode) highlight.parentNode.removeChild(highlight)
      window.__seeyonPickHighlight = null
    } catch (error) {
      /* ignore */
    }
  }

  function ensurePanel() {
    if (!promptEl) {
      panelOpen = true
      panelEl.hidden = false
      renderPanel()
    }
  }

  function askMapping(target) {
    ensurePanel()
    var label = nearbyLabel(target)
    var value = ''
    try {
      if (target.isContentEditable) value = visibleText(target, 100)
      else value = String(target.value || '')
    } catch (error) {
      value = ''
    }
    openPrompt({
      title: '绑定这个控件',
      hint: '给这个控件起个字段名，填值时按名字匹配。',
      fields: [
        { key: 'label', label: '字段名', value: label || '' },
        { key: 'value', label: '要填入的值（可留空）', value: value || '' },
      ],
      confirm: '保存绑定',
      onConfirm: function (values) {
        var record = recordFor(target)
        var text = String(values.label || '').trim()
        if (!text) return
        var maps = readStore(STORAGE.fields, [])
        maps = maps.filter(function (item) { return !(item && item.label === text) })
        maps.push({ label: text, record: record, value: String(values.value || ''), boundAt: Date.now() })
        writeStore(STORAGE.fields, maps)
        toast('已绑定「' + text + '」，下次点「一键填入」会填这里', 'ok')
        openPanel()
      },
    })
  }

  // ---------------------------------------------------------------- UI

  var root
  var shadow
  var panelEl
  var pillEl
  var toastEl
  var promptEl
  var panelOpen = false
  var current = payload

  var CSS = [
    ':host{all:initial}',
    '*{box-sizing:border-box}',
    '.wrap{position:fixed;right:22px;bottom:22px;z-index:2147483645;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif;color:#1f2328;font-size:13px;line-height:1.5;direction:ltr}',
    '.pill{width:54px;height:54px;border-radius:18px;border:0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#3b5bfd 0%,#7c4dff 100%);box-shadow:0 10px 26px rgba(59,91,253,.34),inset 0 1px 0 rgba(255,255,255,.25);position:relative;transition:transform .16s ease,box-shadow .16s ease}',
    '.pill:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(59,91,253,.42)}',
    '.pill svg{width:25px;height:25px}',
    '.pill .badge{position:absolute;top:-5px;right:-5px;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:#fff;color:#3b5bfd;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(15,23,42,.18)}',
    '.panel{position:absolute;right:0;bottom:68px;width:338px;max-height:min(72vh,620px);display:flex;flex-direction:column;background:#fff;border-radius:16px;border:1px solid #e6e9f0;box-shadow:0 24px 60px rgba(15,23,42,.22);overflow:hidden;animation:pop .16s ease}',
    '@keyframes pop{from{opacity:0;transform:translateY(6px) scale(.98)}to{opacity:1;transform:none}}',
    '.panel[hidden]{display:none}',
    '.head{display:flex;align-items:center;gap:9px;padding:13px 14px;background:linear-gradient(135deg,#f4f6ff,#fbf8ff);border-bottom:1px solid #eceff6}',
    '.logo{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#3b5bfd,#7c4dff);display:flex;align-items:center;justify-content:center;color:#fff;flex:none}',
    '.logo svg{width:15px;height:15px}',
    '.titles{min-width:0;flex:1}',
    '.titles b{display:block;font-size:13px;font-weight:650}',
    '.titles span{display:block;font-size:11px;color:#7a8296;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.iconbtn{width:26px;height:26px;border:0;border-radius:8px;background:transparent;color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none}',
    '.iconbtn:hover{background:#eceffb;color:#26324b}',
    '.body{overflow:auto;padding:12px 14px 6px}',
    '.section{margin-bottom:13px}',
    '.section h4{margin:0 0 7px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#8a91a3;font-weight:650;display:flex;align-items:center;gap:6px}',
    '.chips{display:flex;flex-wrap:wrap;gap:6px}',
    '.chip{border:1px solid #d9def0;background:#f8f9ff;color:#2f3a55;border-radius:8px;padding:5px 9px;font-size:12px;cursor:pointer;transition:all .12s ease}',
    '.chip:hover{border-color:#9aa9ee;background:#eef1ff;color:#1f2b4d}',
    '.chip:active{transform:scale(.98)}',
    '.row{display:flex;gap:8px;align-items:center}',
    'select.sel{flex:1;height:30px;border:1px solid #d9def0;border-radius:8px;background:#fff;color:#22304a;font-size:12px;padding:0 8px}',
    'button.primary{width:100%;height:33px;border:0;border-radius:9px;background:linear-gradient(135deg,#3b5bfd,#6f4bff);color:#fff;font-size:12.5px;font-weight:600;cursor:pointer;box-shadow:0 6px 16px rgba(59,91,253,.24)}',
    'button.primary:hover{filter:brightness(1.04)}',
    '.hint{font-size:11px;color:#8a91a3;line-height:1.55;margin-top:6px}',
    '.foot{display:flex;gap:6px;padding:10px 14px 12px;border-top:1px solid #eef1f7;background:#fbfcfe}',
    'button.ghost{flex:1;height:29px;border:1px solid #dfe4f1;border-radius:8px;background:#fff;color:#46506a;font-size:12px;cursor:pointer}',
    'button.ghost:hover{border-color:#b9c3e6;color:#2c3a5e}',
    '.toast{position:absolute;left:50%;bottom:132px;transform:translateX(-50%);max-width:300px;padding:8px 12px;border-radius:9px;background:#1f2937;color:#fff;font-size:12px;line-height:1.45;box-shadow:0 10px 24px rgba(0,0,0,.28);opacity:0;pointer-events:none;transition:opacity .18s ease;text-align:center}',
    '.toast[data-show="1"]{opacity:1}',
    '.toast[data-tone="ok"]{background:#186b3f}',
    '.toast[data-tone="warn"]{background:#8a4b12}',
    '.toast[data-tone="info"]{background:#243b8f}',
    '.prompt{position:absolute;left:10px;right:10px;bottom:66px;background:#fff;border:1px solid #e2e6f2;border-radius:12px;box-shadow:0 18px 44px rgba(15,23,42,.26);padding:13px;animation:pop .14s ease}',
    '.prompt[hidden]{display:none}',
    '.prompt h5{margin:0 0 3px;font-size:12.5px;font-weight:650}',
    '.prompt p{margin:0 0 9px;font-size:11px;color:#8189a0;line-height:1.5}',
    '.prompt label{display:block;font-size:11px;color:#5f6880;margin:7px 0 4px}',
    '.prompt input{width:100%;height:30px;border:1px solid #d9def0;border-radius:8px;padding:0 9px;font-size:12px;color:#22304a;outline:none}',
    '.prompt input:focus{border-color:#7f92f4;box-shadow:0 0 0 3px rgba(79,110,247,.14)}',
    '.prompt .acts{display:flex;gap:7px;justify-content:flex-end;margin-top:11px}',
    '.prompt .acts button{height:28px;padding:0 12px;border-radius:8px;font-size:12px;cursor:pointer;border:1px solid #dfe4f1;background:#fff;color:#46506a}',
    '.prompt .acts button.ok{background:#3b5bfd;border-color:#3b5bfd;color:#fff;font-weight:600}',
    '@media (prefers-color-scheme:dark){.panel{background:#1b2030;border-color:#2c3449}.head{background:linear-gradient(135deg,#1d2436,#232b40);border-bottom-color:#2c3449}.titles b{color:#eef1f8}.titles span{color:#9aa3b8}.section h4{color:#8f98ae}.chip{background:#232b40;border-color:#333d57;color:#d7dceb}.chip:hover{background:#2a334c;color:#fff}.body{color:#d7dceb}.prompt{background:#1b2030;border-color:#2c3449}.prompt h5{color:#eef1f8}.prompt input{background:#232b40;border-color:#333d57;color:#eef1f8}.foot{background:#171c2a;border-top-color:#2c3449}button.ghost{background:#232b40;border-color:#333d57;color:#c9d0e2}select.sel{background:#232b40;border-color:#333d57;color:#eef1f8}.iconbtn:hover{background:#2a334c}.hint{color:#8f98ae}}',
  ].join('\n')

  function el(tag, attrs, children) {
    var node = document.createElement(tag)
    if (attrs) {
      for (var key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) continue
        if (key === 'text') node.textContent = attrs[key]
        else if (key === 'html') node.innerHTML = attrs[key]
        else if (key === 'class') node.className = attrs[key]
        else if (key.slice(0, 2) === 'on') node.addEventListener(key.slice(2).toLowerCase(), attrs[key])
        else node.setAttribute(key, attrs[key])
      }
    }
    if (children) {
      for (var i = 0; i < children.length; i += 1) {
        if (!children[i]) continue
        node.appendChild(typeof children[i] === 'string' ? document.createTextNode(children[i]) : children[i])
      }
    }
    return node
  }

  function icon(paths, size) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('stroke-width', '1.9')
    svg.setAttribute('stroke-linecap', 'round')
    svg.setAttribute('stroke-linejoin', 'round')
    if (size) { svg.setAttribute('width', size); svg.setAttribute('height', size) }
    for (var i = 0; i < paths.length; i += 1) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('d', paths[i])
      svg.appendChild(path)
    }
    return svg
  }

  function toast(message, tone) {
    if (!toastEl) return
    toastEl.textContent = message
    toastEl.setAttribute('data-tone', tone || 'info')
    toastEl.setAttribute('data-show', '1')
    clearTimeout(toast._timer)
    toast._timer = setTimeout(function () { toastEl.setAttribute('data-show', '0') }, 2600)
  }

  function openPrompt(options) {
    ensurePanel()
    var body = el('div')
    var values = {}
    var inputs = {}
    body.appendChild(el('h5', { text: options.title || '' }))
    if (options.hint) body.appendChild(el('p', { text: options.hint }))
    ;(options.fields || []).forEach(function (field) {
      body.appendChild(el('label', { text: field.label || field.key }))
      var input = el('input', { type: 'text' })
      input.value = field.value || ''
      inputs[field.key] = input
      values[field.key] = field.value || ''
      body.appendChild(input)
    })
    var acts = el('div', { class: 'acts' })
    var cancel = el('button', { type: 'button', text: options.cancel || '取消', onclick: function () { promptEl.hidden = true } })
    var confirm = el('button', { type: 'button', class: 'ok', text: options.confirm || '确定' })
    confirm.addEventListener('click', function () {
      var result = {}
      for (var key in inputs) result[key] = inputs[key].value
      promptEl.hidden = true
      if (options.onConfirm) options.onConfirm(result)
    })
    acts.appendChild(cancel)
    acts.appendChild(confirm)
    body.appendChild(acts)
    promptEl.innerHTML = ''
    promptEl.appendChild(body)
    promptEl.hidden = false
    var first = inputs[Object.keys(inputs)[0]]
    if (first) setTimeout(function () { first.focus(); first.select() }, 30)
  }

  function renderPanel() {
    panelEl.innerHTML = ''

    var head = el('div', { class: 'head' }, [
      el('div', { class: 'logo' }, [icon(['M5 4h14v16H5z', 'M8 8h8', 'M8 12h5']) ]),
      el('div', { class: 'titles' }, [
        el('b', { text: '致远表单助手' }),
        el('span', { text: current.subject || '表单填写与意见代填' }),
      ]),
      el('button', { class: 'iconbtn', type: 'button', title: '关闭', onclick: closePanel }, [icon(['M6 6l12 12M18 6L6 18'])]),
    ])

    var body = el('div', { class: 'body' })

    var tplSection = el('div', { class: 'section' }, [el('h4', { text: '意见代填' })])
    var chips = el('div', { class: 'chips' })
    var templates = Array.isArray(current.templates) ? current.templates : []
    if (!templates.length) chips.appendChild(el('span', { class: 'hint', text: '还没有意见模板，到插件设置里加几条' }))
    templates.forEach(function (tpl) {
      chips.appendChild(el('button', {
        type: 'button',
        class: 'chip',
        text: tpl.label || '意见',
        title: tpl.text || '',
        onclick: function () { setOpinion(String(tpl.text == null ? '' : tpl.text)) },
      }))
    })
    tplSection.appendChild(chips)
    body.appendChild(tplSection)

    var attitudeSection = el('div', { class: 'section' }, [el('h4', { text: '审批态度' })])
    var row = el('div', { class: 'row' })
    var options = ['同意', '不同意', '已阅', '转办', '待定']
    if (current.attitude && options.indexOf(current.attitude) < 0) options.unshift(current.attitude)
    var select = el('select', { class: 'sel', 'aria-label': '审批态度' })
    options.forEach(function (option) {
      select.appendChild(el('option', { value: option, text: option }))
    })
    if (current.attitude && options.indexOf(current.attitude) >= 0) select.value = current.attitude
    var applyAttitude = el('button', { class: 'chip', type: 'button', text: '写入', onclick: function () { setAttitude(select.value) } })
    row.appendChild(select)
    row.appendChild(applyAttitude)
    attitudeSection.appendChild(row)
    body.appendChild(attitudeSection)

    var fieldsSection = el('div', { class: 'section' }, [el('h4', { text: '一键填入' })])
    var fieldCount = (Array.isArray(current.fields) ? current.fields.length : 0) + readStore(STORAGE.fields, []).length
    var fillBtn = el('button', { class: 'primary', type: 'button', text: fieldCount ? '填入 ' + fieldCount + ' 个字段' : '一键填入（先绑定字段）' })
    fillBtn.addEventListener('click', function () { fillFields() })
    fieldsSection.appendChild(fillBtn)
    fieldsSection.appendChild(el('div', { class: 'hint', text: '按字段名匹配表单控件。匹配不到时，点「拾取元素」在页面上点一下这个控件，绑定一次即可长期复用。' }))
    body.appendChild(fieldsSection)

    var foot = el('div', { class: 'foot' })
    foot.appendChild(el('button', { class: 'ghost', type: 'button', text: '拾取元素', onclick: function () { startPicking() } }))
    foot.appendChild(el('button', {
      class: 'ghost',
      type: 'button',
      text: '清空绑定',
      onclick: function () {
        writeStore(STORAGE.fields, [])
        writeStore(STORAGE.opinion, null)
        writeStore(STORAGE.attitude, null)
        toast('已清空本页绑定', 'ok')
        renderPanel()
      },
    }))

    var prompt = el('div', { class: 'prompt', hidden: '' })
    toastEl = el('div', { class: 'toast', 'data-show': '0' })

    panelEl.appendChild(head)
    panelEl.appendChild(body)
    panelEl.appendChild(prompt)
    panelEl.appendChild(foot)
    panelEl.appendChild(toastEl)
    promptEl = panelEl.querySelector('.prompt')
  }

  function openPanel() {
    panelOpen = true
    panelEl.hidden = false
    renderPanel()
  }

  function closePanel() {
    panelOpen = false
    panelEl.hidden = true
  }

  function togglePanel() {
    if (panelOpen) closePanel()
    else openPanel()
  }

  function mount() {
    root = document.createElement('div')
    root.id = MOUNT_ID
    root.setAttribute('data-seeyon-todo', 'assistant')
    shadow = root.attachShadow({ mode: 'open' })
    var style = document.createElement('style')
    style.textContent = CSS
    shadow.appendChild(style)

    var wrap = document.createElement('div')
    wrap.className = 'wrap'
    panelEl = el('div', { class: 'panel' })
    panelEl.hidden = true
    pillEl = el('button', { class: 'pill', type: 'button', title: '致远表单助手', 'aria-label': '致远表单助手' })
    pillEl.appendChild(icon(['M6 3.8h12a1.4 1.4 0 0 1 1.4 1.4v13.6a1.4 1.4 0 0 1-1.4 1.4H6a1.4 1.4 0 0 1-1.4-1.4V5.2A1.4 1.4 0 0 1 6 3.8z', 'M8 8.4h8', 'M8 12h8', 'M8 15.6h4.6']))
    var badge = el('span', { class: 'badge', text: String((current.templates || []).length) })
    pillEl.appendChild(badge)
    pillEl.addEventListener('click', togglePanel)

    wrap.appendChild(panelEl)
    wrap.appendChild(pillEl)
    shadow.appendChild(wrap)
    document.documentElement.appendChild(root)

    root.__seeyonAssistant = {
      update: function (next) {
        current = next
        var nextBadge = shadow.querySelector('.badge')
        if (nextBadge) nextBadge.textContent = String((next.templates || []).length)
        if (panelOpen) renderPanel()
        toast('已切换到：' + (next.subject || '新单据'), 'info')
      },
      open: openPanel,
      close: closePanel,
      fill: fillFields,
      opinion: setOpinion,
    }
  }

  try {
    mount()
    setTimeout(function () {
      toast('表单助手已就绪：点右下角按钮填意见/字段', 'ok')
    }, 500)
  } catch (error) {
    try {
      console.warn('[seeyon-todo] inject failed', error)
    } catch (ignored) {
      /* ignore */
    }
  }
})()
