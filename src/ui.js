
;(function () {
  var WB = window.__DSH_WORKBENCH__
  if (!WB) return
  var OUR_ID = '@local/dsh-seeyon-workbench'

  WB.load({
    id: OUR_ID,
    factory: function (require) {
      var React = require('react')
      var h = React.createElement
      WB.require = require

      var NS = 'seeyon-workbench'
      var CSS = [
        '.wb-root{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-2,#f5f6f8);color:var(--dsw-alias-label-primary,#1f2328);font-family:var(--dsw-font-family,inherit)}',
        '.wb-root,.wb-root *{box-sizing:border-box}',
        '.wb-root button{font:inherit}',
        '.wb-head{display:flex;align-items:center;gap:9px;padding:calc(var(--dsh-frame-top-clearance,0px) + 13px) 20px 0;background:var(--dsw-alias-bg-layer-1,#fff);flex:none}',
        '.wb-logo{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#2f6bff,#22c3b7);flex:none}',
        '.wb-title{font-size:14px;font-weight:650;line-height:1.2;letter-spacing:-.01em}',
        '.wb-spacer{flex:1}',
        '.wb-chuan{height:28px;padding:0 11px;border-radius:7px;border:1px solid var(--dsw-alias-border-l2,#e4e7ec);background:var(--dsw-alias-bg-layer-1,#fff);cursor:pointer;display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:500;color:var(--dsw-alias-label-secondary,#667085);transition:border-color .15s ease,color .15s ease,background .15s ease}',
        '.wb-chuan:hover{border-color:var(--dsw-alias-border-l3,#cfd4dc);color:var(--dsw-alias-label-primary,#1f2328)}',
        '.wb-chuan.active{border-color:#2f6bff;color:#2f6bff;background:#f5f8ff}',
        '.wb-sep{width:1px;height:14px;background:var(--dsw-alias-border-l2,#e4e7ec);margin:0 2px;flex:none}',
        '.wb-subtab{height:32px;padding:0 8px;border:0;border-bottom:2px solid transparent;background:transparent;font-size:12.5px;color:var(--dsw-alias-label-secondary,#667085);cursor:pointer;margin-bottom:-1px}',
        '.wb-subtab:hover{color:var(--dsw-alias-label-primary,#1f2328)}',
        '.wb-subtab.active{color:#2f6bff;border-bottom-color:#2f6bff;font-weight:600}',
        '.wb-subact{height:24px;padding:0 8px;border:0;border-radius:6px;background:transparent;font-size:12px;color:var(--dsw-alias-label-tertiary,#98a2b3);cursor:pointer}',
        '.wb-subact:hover{background:var(--dsw-alias-bg-layer-3,#f2f3f5);color:var(--dsw-alias-label-primary,#1f2328)}',
        '.wb-dot{width:6px;height:6px;border-radius:50%;background:#c3c9d4;flex:none}',
        '.wb-dot.on{background:#12b76a}',
        '.wb-tabs{display:flex;align-items:center;gap:22px;padding:6px 20px 0;background:var(--dsw-alias-bg-layer-1,#fff);border-bottom:1px solid var(--dsw-alias-border-l2,#e4e7ec);flex:none}',
        '.wb-tab{height:32px;padding:0;border:0;border-bottom:2px solid transparent;background:transparent;font-size:13px;color:var(--dsw-alias-label-secondary,#667085);cursor:pointer;margin-bottom:-1px;transition:color .15s ease,border-color .15s ease}',
        '.wb-tab:hover{color:var(--dsw-alias-label-primary,#1f2328)}',
        '.wb-tab.active{color:var(--dsw-alias-label-primary,#1f2328);border-bottom-color:#2f6bff;font-weight:600}',
        '.wb-main{flex:1;min-width:0;min-height:0;overflow:auto;position:relative;background:var(--dsw-alias-bg-layer-1,#fff)}',
        '.wb-main.wb-fixed{overflow:hidden;display:flex;flex-direction:column}',
        '.wb-main.wb-fixed>.wb-mount{flex:1;min-height:0;height:auto}',
        '.wb-mount{height:100%;min-height:0}',
        // 被挂载的面板自带品牌头，这里只留工作台自己的标题
        '.wb-mount .st-brand,.wb-mount .sh-brand{display:none!important}',
        '.wb-mount .st-head,.wb-mount .st-tabs-inline,.wb-mount .st-meetings-head{display:none!important}',
        // skillhub 自带的 shell 顶距里含 frame-clearance，嵌进来会多出一条空行
        '.wb-mount .sh-shell{padding-top:16px!important}',
        '.wb-mount .vp-logo,.wb-mount .vp-h1,.wb-mount .vp-sub{display:none!important}',
        // 只抹平待办台和 VPN 的居中容器；skillhub 完全用它自己的布局
        '.wb-mount .st-shell,.wb-mount .vp-shell{padding:16px 20px 40px!important;max-width:none!important;margin:0!important}',
        // 品牌块隐藏后 header 只剩右侧按钮，收掉它的行高与下边距，避免顶部一条空行
        '.wb-mount .sh-header{margin-bottom:0!important;min-height:0!important;align-items:center!important}',
        '.wb-vpnbar{display:flex;align-items:center;gap:10px;padding:8px 20px;border-bottom:1px solid var(--dsw-alias-border-l2,#e4e7ec);flex:none;background:var(--dsw-alias-bg-layer-1,#fff)}',
        '.wb-back{height:26px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#667085);cursor:pointer;font-size:12.5px}',
        '.wb-back:hover{background:var(--dsw-alias-bg-layer-3,#f2f3f5);color:var(--dsw-alias-label-primary,#1f2328)}',
        '.wb-vpnstate{font-size:12px;color:var(--dsw-alias-label-tertiary,#98a2b3)}',
        '.wb-missing{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:100%;color:var(--dsw-alias-label-tertiary,#98a2b3);font-size:12.5px;text-align:center;padding:40px}',
        '.wb-missing svg{opacity:.5}',
        '.wb-sheet{position:fixed;inset:0;background:rgba(15,20,30,.45);backdrop-filter:blur(3px);z-index:50;display:flex;align-items:center;justify-content:center;padding:26px}',
        '.wb-sheet-card{width:min(1040px,94vw);height:min(800px,90vh);background:#fff;border-radius:18px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 30px 70px rgba(15,20,30,.35)}',
        '.wb-sheet-head{display:flex;align-items:center;gap:10px;padding:12px 18px;border-bottom:1px solid var(--dsw-alias-border-l2,#e4e7ec);flex:none}',
        '.wb-sheet-title{font-size:13.5px;font-weight:600}',
        '.wb-close{width:28px;height:28px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2,#e4e7ec);background:#fff;cursor:pointer;font-size:14px;line-height:1;color:#667085}',
        '.wb-close:hover{background:#f2f3f5}',
        // webview 不能放在可滚动容器里，否则 Electron 里会白屏 —— 这里必须 overflow:hidden
        '.wb-sheet-body{flex:1;min-height:0;overflow:hidden;display:flex}',
        '.wb-sheet-body>.wb-mount{flex:1;min-width:0;min-height:0}',
      ].join('\n')

      var DICTS = {
        zh: { panel: '致远工作台', title: '致远工作台', subtitle: '',
          oa: 'OA', todo: '待办', meetings: '会议', skills: 'skillhub',
          newCollab: '新建协同', oaHome: '主页', refresh: '刷新', settings: '设置',
          chuan: 'VPN', vpn: 'VPN', vpnOn: '已连接', vpnOff: '未连接', vpnTitle: 'VPN',
          missing: '这块面板没加载出来，检查对应插件是否已被工作台接管', close: '关闭' },
        en: { panel: 'Workbench', title: 'Seeyon Workbench', subtitle: '',
          oa: 'OA', todo: 'To-dos', meetings: 'Meetings', skills: 'skillhub',
          newCollab: 'New collab', oaHome: 'Home', refresh: 'Refresh', settings: 'Settings',
          chuan: 'VPN', vpn: 'VPN', vpnOn: 'Connected', vpnOff: 'Off', vpnTitle: 'VPN',
          missing: 'Panel not mounted — check the source plugin bundle', close: 'Close' }
      }

      function findVendor(keyword) {
        var ids = Object.keys(WB.vendors || {})
        for (var i = 0; i < ids.length; i++) {
          if (ids[i].toLowerCase().indexOf(keyword) >= 0) return WB.vendors[ids[i]]
        }
        return null
      }

      // 把某个插件的 Client 半挂起来：截获它注册到 main 槽的那棵 React 树
      function instantiate(def, ctx) {
        if (!def || typeof def.factory !== 'function') return null
        var captured = null
        var mod = null
        try { mod = def.factory(WB.require) } catch (error) { return null }
        var fake = {
          effect: function (fn) { try { var d = fn(); return typeof d === 'function' ? d : function () {} } catch (e) { return function () {} } },
          get: function (key) { try { return ctx.get(key) } catch (e) { return undefined } },
          locale: ctx.locale,
          slots: {
            inject: function (name, cb) { try { cb() } catch (e) {} },
            register: function (config, render) {
              if (config && config.name === 'main' && !captured) {
                try { captured = render({}) } catch (e) { captured = null }
              }
              return function () {}
            }
          }
        }
        try { mod.apply(fake) } catch (error) { console.warn('[workbench] mount failed', error) }
        return captured
      }

      // 切到内置面板的某个 tab（待办台里「会议」是 tab，不是独立面板）
      function Mounted(props) {
        var ref = React.useRef(null)
        React.useEffect(function () {
          if (!props.tabText) return undefined
          var tries = 0
          var timer = setInterval(function () {
            tries++
            var node = ref.current
            if (node) {
              var items = node.querySelectorAll('button, .st-tab, [role=tab]')
              for (var i = 0; i < items.length; i++) {
                if ((items[i].innerText || '').trim() === props.tabText) {
                  items[i].click()
                  clearInterval(timer)
                  return
                }
              }
            }
            if (tries > 24) clearInterval(timer)
          }, 300)
          return function () { clearInterval(timer) }
        }, [props.tabText])
        return h('div', { className: 'wb-mount', ref: ref }, props.element)
      }

      function App(props) {
        var ctx = props.ctx
        var t = props.t
        var tabState = React.useState('todo')
        var tab = tabState[0]
        var setTab = tabState[1]
        var refreshState = React.useState(0)
        var refreshKey = refreshState[0]
        var setRefreshKey = refreshState[1]
        var oaOriginRef = React.useRef('https://xt.seeyon.com')
        var statusState = React.useState(null)
        var status = statusState[0]
        var setStatus = statusState[1]
        var cache = React.useRef({})

        React.useEffect(function () {
          var alive = true
          var load = function () {
            fetch('/vpn/api/state', { credentials: 'same-origin' })
              .then(function (r) { return r.json() })
              .then(function (json) { if (alive) setStatus(json) })
              .catch(function () {})
          }
          load()
          var timer = setInterval(load, 2500)
          return function () { alive = false; clearInterval(timer) }
        }, [])

        var getPanel = function (key) {
          if (cache.current[key]) return cache.current[key]
          var def = key === 'skills' ? findVendor('skillhub') : findVendor('seeyon-todo')
          var entry = { ok: false, element: null }
          if (def) {
            var el = instantiate(def, ctx)
            if (el) { entry.ok = true; entry.element = el }
          }
          cache.current[key] = entry
          return entry
        }

        var vpnPanel = function () {
          if (cache.current.vpn) return cache.current.vpn
          var def = findVendor('dsh-vpn')
          var entry = { ok: false, element: null }
          if (def) {
            var el = instantiate(def, ctx)
            if (el) { entry.ok = true; entry.element = el }
          }
          cache.current.vpn = entry
          return entry
        }

        React.useEffect(function () {
          fetch('/seeyon-todo/api/config', { credentials: 'same-origin' })
            .then(function (r) { return r.json() })
            .then(function (json) {
              var cfg = json && (json.config || json)
              var origin = cfg && (cfg.oaOrigin || cfg.origin || cfg.oaUrl)
              if (origin) oaOriginRef.current = String(origin)
            })
            .catch(function () {})
        }, [])

        var openOa = function (path) {
          var url = oaOriginRef.current.replace(/\/+$/, '') + path
          try {
            var sidebar = ctx && typeof ctx.get === 'function' ? ctx.get('sidebarRight') : null
            if (sidebar && typeof sidebar.openTab === 'function') {
              sidebar.openTab('browser', { params: { url: url }, revealIfOpened: true })
              return
            }
          } catch (e) { /* 没有右侧浏览器就退回新标签页 */ }
          try { window.open(url, '_blank', 'noopener') } catch (e) {}
        }

        var refreshPanel = function () {
          var key = tab === 'skills' ? 'skills' : 'oa_' + tab
          delete cache.current[key]
          setRefreshKey(refreshKey + 1)
        }

        // 面板自己的头部被收掉了，但按钮还在 DOM 里 —— 按 .st-actions 的固定顺序触发
        // 顺序：0 新建 · 1 主页 · 2 刷新 · 3 注入 · 4 设置
        var clickAction = function (index) {
          try {
            var nodes = document.querySelectorAll('.wb-mount .st-actions .st-btn')
            if (nodes && nodes[index]) { nodes[index].click(); return true }
          } catch (e) { /* ignore */ }
          return false
        }

        var tunnel = status && status.tunnel ? status.tunnel : null
        var online = Boolean(tunnel && tunnel.up)
        var isVpnView = tab === 'vpn'
        var isOaView = tab === 'todo' || tab === 'meetings'
        var panel = isVpnView ? vpnPanel() : getPanel(tab === 'skills' ? 'skills' : 'oa_' + tab)

        var railButton = function (key, label) {
          return h('button', { key: key, className: 'wb-tab' + (tab === key ? ' active' : ''), onClick: function () { setTab(key) } }, label)
        }

        return h('div', { className: 'wb-root' }, [
          h('div', { className: 'wb-head', key: 'head' }, [
            h('div', { className: 'wb-logo', key: 'logo' }, [h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none' }, [
              h('path', { key: 'a', d: 'M4 7h16M4 12h10M4 17h7', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' })
            ])]),
            h('div', { className: 'wb-title', key: 'title' }, t('title')),
            h('div', { className: 'wb-spacer', key: 'sp' }),
            h('button', {
              className: 'wb-chuan' + (tab === 'vpn' ? ' active' : ''),
              key: 'vpn',
              title: t('vpnTitle') + ' · ' + (online ? t('vpnOn') : t('vpnOff')),
              onClick: function () { setTab('vpn') }
            }, [
              h('span', { className: 'wb-dot ' + (online ? 'on' : ''), key: 'dot' }),
              h('span', { key: 'txt' }, t('vpn'))
            ])
          ]),
          h('div', { className: 'wb-tabs', key: 'tabs' }, [
            railButton('todo', t('todo')),
            railButton('meetings', t('meetings')),
            railButton('skills', t('skills')),
            h('div', { className: 'wb-spacer', key: 'sp' }),
            isOaView ? h('button', { className: 'wb-subact', key: 'new', onClick: function () { if (!clickAction(0)) openOa('/seeyon/collaboration/collaboration.do?method=newColl') } }, t('newCollab')) : null,
            isOaView ? h('button', { className: 'wb-subact', key: 'home', onClick: function () { if (!clickAction(1)) openOa('/seeyon/main.do') } }, t('oaHome')) : null,
            isOaView ? h('button', { className: 'wb-subact', key: 'refresh', onClick: function () { if (!clickAction(2)) refreshPanel() } }, t('refresh')) : null,
            isOaView ? h('button', { className: 'wb-subact', key: 'more', onClick: function () { clickAction(4) } }, t('settings')) : null
          ]),
          h('div', { className: 'wb-main' + (isVpnView ? ' wb-fixed' : ''), key: 'main' }, panel.ok
            ? h(Mounted, { key: tab + ':' + refreshKey, element: panel.element, tabText: tab === 'meetings' ? '会议' : '' })
            : h('div', { className: 'wb-missing' }, [
                h('svg', { key: 'i', width: 30, height: 30, viewBox: '0 0 24 24', fill: 'none' }, [
                  h('rect', { key: 'r', x: 3.5, y: 5, width: 17, height: 14, rx: 3, stroke: 'currentColor', strokeWidth: 1.5 }),
                  h('path', { key: 'p', d: 'M3.5 10h17', stroke: 'currentColor', strokeWidth: 1.5 })
                ]),
                h('div', { key: 't' }, t('missing'))
              ])),
        ])
      }

      function apply(ctx) {
        ctx.effect(function () { return ctx.locale.register(NS, DICTS) }, NS + ': dictionaries')
        var t = ctx.locale.bind(NS)

        ctx.effect(function () {
          var style = document.createElement('style')
          style.setAttribute('data-dsh-seeyon-workbench', 'styles')
          style.textContent = CSS
          document.head.appendChild(style)
          return function () { style.remove() }
        }, NS + ': styles')

        ctx.slots.inject('main', function () {
          return ctx.slots.register({ name: 'main', key: 'seeyon-workbench', locale: NS }, function () {
            return h(App, { ctx: ctx, t: t })
          })
        })

        ctx.slots.inject('sidebar.panellist', function () {
          return ctx.slots.register({
            name: 'sidebar.panellist',
            id: 'seeyon-workbench',
            order: 1,
            label: function () { return t('panel') },
            locale: NS
          }, function () {
            return h('span', { style: { display: 'inline-flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }, 'aria-hidden': 'true' }, [
              h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
                h('path', { key: 'a', d: 'M4 7h16M4 12h10M4 17h7', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' })
              ])
            ])
          })
        })
      }

      return { name: NS, inject: ['slots', 'locale', 'layout'], apply: apply }
    }
  })
})()
