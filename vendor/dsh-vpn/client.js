
window.__ModuleLoader__.load({
  id: '@local/dsh-vpn',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'vpn'
    const PANEL_ID = 'vpn'
    const API = '/vpn/api'
    const POLL_MS = 1500
    const LOGIN_TIMEOUT_MS = 150000

    const DICTS = {
      zh: {
        panel: 'VPN', title: 'VPN 一键连接',
        subtitle: '在内置浏览器里登录，登录成功后 aTrust 会被唤起并连上；以隧道为准',
        stateDisconnected: '未连接', stateConnecting: '连接中', stateConnected: '已连接',
        stateError: '连接失败', stateManual: '需要你接手',
        connect: '连接', connecting: '连接中…', disconnect: '断开',
        settings: '设置', logs: '执行日志', noLogs: '还没有记录，点「连接」试试。',
        server: '服务器地址', account: '账号', password: '密码',
        passwordKeep: '已保存，留空表示不修改', passwordEmpty: '未保存',
        probe: '成功判定探针（可选）',
        probeHint: '例如 10.1.2.3:443，隧道通了它也要通才算成功；留空则只看网卡',
        save: '保存', saving: '保存中…', saved: '已保存', close: '关闭',
        tunnel: '隧道 IP', elapsed: '耗时', diag: '诊断', openLog: '打开日志文件',
        loginArea: '登录页（内置浏览器）', hide: '收起', show: '展开',
        stepOpen: '打开登录页', stepFill: '填写账号密码', stepSubmit: '提交登录',
        stepWait: '等 aTrust 连上', needManual: '请在下面的登录页里完成验证（验证码 / 扫码 / 二次认证）',
        noBridge: '这个界面没有内置浏览器，已在系统浏览器打开登录页，登录完这里会自动变「已连接」',
        noCred: '先去设置里保存账号密码', failed: '没等到隧道，看看登录页是否卡在验证',
        disconnectHint: '断开请在 aTrust 托盘图标里点「断开 / 退出登录」',
        browserHint: '登录页只在这里打开，不占你的主浏览器'
      },
      en: {
        panel: 'VPN', title: 'VPN one-click',
        subtitle: 'Sign in inside the embedded browser; aTrust wakes up and the tunnel is verified',
        stateDisconnected: 'Disconnected', stateConnecting: 'Connecting', stateConnected: 'Connected',
        stateError: 'Failed', stateManual: 'Needs you',
        connect: 'Connect', connecting: 'Connecting…', disconnect: 'Disconnect',
        settings: 'Settings', logs: 'Run log', noLogs: 'Nothing yet — press Connect.',
        server: 'Server', account: 'Account', password: 'Password',
        passwordKeep: 'Already saved; leave blank to keep', passwordEmpty: 'Not saved',
        probe: 'Success probe (optional)',
        probeHint: 'e.g. 10.1.2.3:443 — the tunnel must pass this too',
        save: 'Save', saving: 'Saving…', saved: 'Saved', close: 'Close',
        tunnel: 'Tunnel IP', elapsed: 'Elapsed', diag: 'Diagnose', openLog: 'Open log file',
        loginArea: 'Login page (embedded)', hide: 'Collapse', show: 'Expand',
        stepOpen: 'Open login page', stepFill: 'Fill credentials', stepSubmit: 'Submit',
        stepWait: 'Wait for aTrust', needManual: 'Finish the challenge below (captcha / QR / 2FA)',
        noBridge: 'No embedded browser here; opened the login page in your browser. This panel flips to Connected by itself.',
        noCred: 'Save account and password in Settings first', failed: 'Tunnel never came up — check the login page',
        disconnectHint: 'Disconnect from the aTrust tray menu',
        browserHint: 'The login page only lives here'
      }
    }

    const CSS = [
      '.vp-root{height:100%;min-height:0;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-2,#f5f6f8);color:var(--dsw-alias-label-primary,#1f2328);font-family:var(--dsw-font-family,inherit)}',
      '.vp-root,.vp-root *{box-sizing:border-box}',
      '.vp-root button,.vp-root input{font:inherit}',
      '.vp-shell{width:100%;max-width:820px;margin:0 auto;padding:calc(var(--dsh-frame-top-clearance,0px) + 22px) 24px 24px;display:flex;flex-direction:column;min-height:0;flex:1}',
      '.vp-head{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex:none}',
      '.vp-logo{width:40px;height:40px;flex:none;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#2f6bff 0%,#19b6a8 100%);box-shadow:0 7px 18px rgba(47,107,255,.24)}',
      '.vp-h1{margin:0;font-size:18px;font-weight:650;line-height:1.25}',
      '.vp-sub{margin:3px 0 0;font-size:12px;color:var(--dsw-alias-label-secondary,#667085)}',
      '.vp-spacer{flex:1}',
      '.vp-btn{height:30px;padding:0 11px;border:1px solid var(--dsw-alias-border-l2,#e4e7ec);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font-size:12.5px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}',
      '.vp-btn:hover{border-color:var(--dsw-alias-border-l3,#cfd4dc)}',
      '.vp-btn:disabled{opacity:.55;cursor:default}',
      '.vp-btn.primary{background:linear-gradient(135deg,#2f6bff,#3f7dff);border-color:transparent;color:#fff;height:36px;padding:0 18px;font-size:13px;font-weight:600;box-shadow:0 6px 14px rgba(47,107,255,.26)}',
      '.vp-card{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e4e7ec);border-radius:14px;padding:16px 18px;flex:none}',
      '.vp-state{display:flex;align-items:center;gap:11px}',
      '.vp-dot{width:10px;height:10px;border-radius:50%;flex:none;background:#b8bec9}',
      '.vp-dot.on{background:#12b76a;box-shadow:0 0 0 5px rgba(18,183,106,.14)}',
      '.vp-dot.busy{background:#2f6bff;box-shadow:0 0 0 5px rgba(47,107,255,.14);animation:vp-pulse 1.2s ease-in-out infinite}',
      '.vp-dot.err{background:#e5484d;box-shadow:0 0 0 5px rgba(229,72,77,.14)}',
      '.vp-dot.warn{background:#ef8d1f;box-shadow:0 0 0 5px rgba(239,141,31,.16)}',
      '@keyframes vp-pulse{0%,100%{opacity:1}50%{opacity:.35}}',
      '.vp-label{font-size:14.5px;font-weight:600}',
      '.vp-detail{margin-top:2px;font-size:12px;color:var(--dsw-alias-label-secondary,#667085)}',
      '.vp-actions{display:flex;align-items:center;gap:9px;margin-top:14px;flex-wrap:wrap}',
      '.vp-meta{display:flex;gap:22px;margin-top:14px;padding-top:13px;border-top:1px dashed var(--dsw-alias-border-l2,#e4e7ec);flex-wrap:wrap}',
      '.vp-meta-key{font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:var(--dsw-alias-label-tertiary,#98a2b3)}',
      '.vp-meta-val{margin-top:3px;font-size:12.5px;font-variant-numeric:tabular-nums;word-break:break-all}',
      '.vp-steps{display:flex;gap:14px;margin-top:12px;flex-wrap:wrap}',
      '.vp-step{font-size:11.5px;color:var(--dsw-alias-label-tertiary,#98a2b3);display:flex;align-items:center;gap:5px}',
      '.vp-step.done{color:#0b8a56}',
      '.vp-step.active{color:#2f6bff;font-weight:600}',
      '.vp-browser{margin-top:14px;flex:1;min-height:220px;display:flex;flex-direction:column;border:1px solid var(--dsw-alias-border-l2,#e4e7ec);border-radius:12px;overflow:hidden;background:#fff}',
      '.vp-browser-head{display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid var(--dsw-alias-border-l2,#e4e7ec);background:var(--dsw-alias-bg-layer-3,#f2f3f5);font-size:11.5px;color:var(--dsw-alias-label-secondary,#667085)}',
      '.vp-browser-body{flex:1;min-height:0;position:relative;background:#fff}',
      '.vp-browser-body webview{width:100%;height:100%;border:0;display:flex}',
      '.vp-log{margin-top:12px;flex:none;max-height:150px;overflow:auto;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#e4e7ec);border-radius:12px;padding:4px 0}',
      '.vp-row{display:flex;gap:9px;padding:5px 12px;font-size:12px;line-height:1.5}',
      '.vp-time{flex:none;width:44px;color:var(--dsw-alias-label-tertiary,#98a2b3);font-variant-numeric:tabular-nums}',
      '.vp-msg{flex:1;min-width:0;word-break:break-word}',
      '.vp-row.error .vp-msg{color:#c9372c}',
      '.vp-row.warn .vp-msg{color:#b25e09}',
      '.vp-row.ok .vp-msg{color:#0b8a56}',
      '.vp-sheet{position:fixed;inset:0;background:rgba(15,20,30,.34);display:flex;justify-content:flex-end;z-index:40}',
      '.vp-sheet-body{width:min(420px,92vw);height:100%;background:var(--dsw-alias-bg-layer-1,#fff);box-shadow:-12px 0 32px rgba(15,20,30,.16);padding:22px;overflow:auto}',
      '.vp-field{margin-bottom:15px}',
      '.vp-field label{display:block;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary,#667085);margin-bottom:6px}',
      '.vp-field input{width:100%;height:34px;border:1px solid var(--dsw-alias-border-l2,#e4e7ec);border-radius:8px;padding:0 10px;background:var(--dsw-alias-bg-layer-1,#fff);color:inherit}',
      '.vp-field input:focus{outline:none;border-color:#2f6bff;box-shadow:0 0 0 3px rgba(47,107,255,.12)}',
      '.vp-field .hint{margin-top:5px;font-size:11px;color:var(--dsw-alias-label-tertiary,#98a2b3);line-height:1.5}',
      '.vp-sheet-foot{display:flex;gap:9px;justify-content:flex-end;margin-top:20px}',
      '.vp-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);background:#1f2430;color:#fff;font-size:12.5px;padding:9px 16px;border-radius:10px;z-index:60}'
    ].join('\n')

    function icon(size) {
      const s = size || 18
      return h('svg', { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': 'true' }, [
        h('path', { key: 'a', d: 'M12 2.8 4.8 5.6v6.1c0 4.4 3 8.3 7.2 9.5 4.2-1.2 7.2-5.1 7.2-9.5V5.6L12 2.8Z', stroke: 'currentColor', strokeWidth: 1.7, strokeLinejoin: 'round' }),
        h('path', { key: 'b', d: 'M8.9 11.9h6.2M12 8.8v6.2', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' })
      ])
    }

    async function request(path, init) {
      const options = Object.assign({ credentials: 'same-origin' }, init || {})
      if (options.body && !options.headers) options.headers = { 'Content-Type': 'application/json' }
      const response = await fetch(API + path, options)
      let payload = null
      try { payload = await response.json() } catch (error) { payload = null }
      if (!response.ok) throw new Error((payload && payload.error) || ('HTTP ' + response.status))
      return payload
    }

    function fmtDuration(ms) {
      if (!ms || ms < 0) return '—'
      const seconds = ms / 1000
      if (seconds < 60) return seconds.toFixed(1) + 's'
      return Math.floor(seconds / 60) + 'm ' + Math.round(seconds % 60) + 's'
    }

    // 在内置浏览器里填表：先找密码框，再找同屏的文本输入框当账号，找不到登录按钮就返回原因
    // 在登录页里找输入框并填值；返回 JSON 诊断，方便在日志里看出卡在哪
    function buildFillScript(username, password) {
      return '(function(){'
        + 'var U=' + JSON.stringify(String(username)) + ';'
        + 'var P=' + JSON.stringify(String(password)) + ';'
        + 'function info(o){o.title=(document.title||"").slice(0,40);return JSON.stringify(o)}'
        + 'function shown(el){if(!el)return false;try{var s=getComputedStyle(el);'
        + 'if(s.display==="none"||s.visibility==="hidden"||s.opacity==="0")return false;'
        + 'var r=el.getBoundingClientRect();return r.width>2&&r.height>2}catch(e){return false}}'
        + 'var inputs=Array.prototype.slice.call(document.querySelectorAll("input"));'
        + 'var pwd=null,user=null,i,el,t,pwdList=[];'
        + 'for(i=0;i<inputs.length;i++){el=inputs[i];if((el.type||"").toLowerCase()==="password"&&shown(el))pwdList.push(el)}'
        + 'if(!pwdList.length){var tabs=Array.prototype.slice.call(document.querySelectorAll("div,span,a,button"));'
        + 'for(i=0;i<tabs.length;i++){var tb=tabs[i];var tt=((tb.innerText||tb.textContent||"")+"");'
        + 'if(tt.length>10||!/账号密码|密码登录|账号登录/.test(tt))continue;if(!shown(tb))continue;try{tb.click()}catch(e){}'
        + 'return info({s:"tab",inputs:inputs.length})}}'
        + 'if(!pwdList.length)return info({s:"no-form",inputs:inputs.length});'
        + 'for(i=0;i<pwdList.length;i++){el=pwdList[i];if(/密码|password/i.test((el.id||"")+(el.name||"")+(el.placeholder||""))){pwd=el;break}}'
        + 'if(!pwd)pwd=pwdList[pwdList.length-1];'
        + 'var hint=/账号|帐号|用户名|用户|工号|手机|邮箱|account|user|login/i;'
        + 'for(i=0;i<inputs.length;i++){el=inputs[i];if(el===pwd)continue;t=(el.type||"text").toLowerCase();'
        + 'if(!(t==="text"||t==="tel"||t==="email"||t==="number"||t===""))continue;if(!shown(el))continue;'
        + 'var tag=(el.placeholder||"")+(el.name||"")+(el.id||"")+(el.getAttribute("aria-label")||"");'
        + 'if(hint.test(tag)){user=el;break}}'
        + 'if(!user){for(i=0;i<inputs.length;i++){el=inputs[i];if(el===pwd)continue;t=(el.type||"text").toLowerCase();'
        + 'if((t==="text"||t==="tel"||t==="email"||t==="number"||t==="")&&shown(el)){user=el;break}}}'
        + 'for(i=0;i<inputs.length;i++){el=inputs[i];if(el===pwd||el===user)continue;'
        + 'if(shown(el)&&/(验证码|captcha)/i.test((el.placeholder||"")+(el.name||"")+(el.id||"")))return info({s:"captcha"})}'
        + 'var imgs=Array.prototype.slice.call(document.querySelectorAll("img"));'
        + 'for(i=0;i<imgs.length;i++){if(shown(imgs[i])&&/(checkcode|captcha|verify)/i.test(imgs[i].src||""))return info({s:"captcha"})}'
        + 'function setv(node,val){try{node.focus()}catch(e){}'
        + 'try{var d=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value");d&&d.set?d.set.call(node,val):(node.value=val)}catch(e){node.value=val}'
        + 'node.dispatchEvent(new Event("input",{bubbles:true}));node.dispatchEvent(new Event("change",{bubbles:true}))}'
        + 'function nearText(node,levels){var s="",cur=node,k=0;while(cur&&k<(levels||3)){s+=((cur.innerText||"")+" ");cur=cur.parentElement;k++}return s}'
        + 'var agree=null,boxList=Array.prototype.slice.call(document.querySelectorAll("input[type=checkbox]"));'
        + 'for(i=0;i<boxList.length;i++){el=boxList[i];if(el.checked)continue;if(/同意|协议|agreement/i.test(nearText(el,3))){agree=el;break}}'
        + 'if(!agree&&boxList.length===1&&!boxList[0].checked)agree=boxList[0];'
        + 'if(agree){try{var lab=agree.closest("label");(lab||agree.parentElement||agree).click()}catch(e){}'
        + 'if(!agree.checked){try{agree.click()}catch(e){}}'
        + 'if(!agree.checked){var txList=Array.prototype.slice.call(document.querySelectorAll("span,div,label,p"));'
        + 'for(i=0;i<txList.length;i++){var nd=txList[i];var s2=(nd.innerText||"");'
        + 'if(s2.length<=40&&/我已阅读|同意.*协议|阅读.*协议/.test(s2)&&shown(nd)){try{nd.click()}catch(e){}break}}}'
        + 'if(!agree.checked){var up=agree.parentElement;for(i=0;i<3&&up;i++){if(/check/i.test(""+(up.className||""))){try{up.click()}catch(e){}break}up=up.parentElement}}'
        + 'if(!agree.checked){try{agree.click()}catch(e){}}}'
        + 'if(user)setv(user,U);'
        + 'setv(pwd,P);'
        + 'var nodes=Array.prototype.slice.call(document.querySelectorAll("button,[role=button],a,div,span"));'
        + 'var btn=null;'
        + 'for(i=0;i<nodes.length;i++){var b=nodes[i];var txt=((b.innerText||b.textContent||"")+"").replace(/\s+/g,"");'
        + 'if(!txt||txt.length>6)continue;if(!/^(登录|登陆|立即登录|登录账号|LOGIN)$/i.test(txt))continue;if(!shown(b))continue;'
        + 'if(b.tagName==="DIV"||b.tagName==="SPAN"){var p2=b.parentElement;if(p2&&/btn|button/i.test((p2.className||"")+"")){b=p2}}'
        + 'btn=b;break}'
        + 'if(!btn){try{pwd.dispatchEvent(new KeyboardEvent("keydown",{bubbles:true,key:"Enter",keyCode:13,which:13}));'
        + 'pwd.dispatchEvent(new KeyboardEvent("keyup",{bubbles:true,key:"Enter",keyCode:13,which:13}))}catch(e){}'
        + 'return info({s:"enter",user:!!user,pwdOk:(pwd.value||"").length>0,agreed:agree?!!agree.checked:null})}'
        + 'var br=btn.getBoundingClientRect();'
        + 'return info({s:"ready",user:!!user,pwdOk:(pwd.value||"").length>0,agreed:agree?!!agree.checked:null,'
        + 'disabled:!!btn.disabled||btn.getAttribute("aria-disabled")==="true",rect:{x:br.left,y:br.top,w:br.width,h:br.height}})'
        + '})()'
    }

    function App(props) {
      const t = props.t
      const [snapshot, setSnapshot] = React.useState(null)
      const [phase, setPhase] = React.useState('idle')
      const [events, setEvents] = React.useState([])
      const [error, setError] = React.useState('')
      const [settingsOpen, setSettingsOpen] = React.useState(false)
      const [toast, setToast] = React.useState('')
      const [browserOpen, setBrowserOpen] = React.useState(false)

      const hostRef = React.useRef(null)
      const guestRef = React.useRef(null)
      const phaseRef = React.useRef('idle')
      const startedAtRef = React.useRef(0)

      const setPhaseSafe = React.useCallback(function (value) {
        phaseRef.current = value
        setPhase(value)
      }, [])

      const log = React.useCallback(function (message, level) {
        setEvents(function (prev) {
          const next = prev.concat([{ at: Date.now(), message: message, level: level || '' }])
          return next.length > 80 ? next.slice(next.length - 80) : next
        })
      }, [])

      const load = React.useCallback(async function () {
        try {
          const next = await request('/state')
          setSnapshot(next)
          setError('')
          return next
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
          return null
        }
      }, [])

      React.useEffect(function () {
        let alive = true
        const tick = function () { if (alive) void load() }
        tick()
        const timer = setInterval(tick, POLL_MS)
        return function () { alive = false; clearInterval(timer) }
      }, [load])

      React.useEffect(function () {
        if (!toast) return undefined
        const timer = setTimeout(function () { setToast('') }, 2400)
        return function () { clearTimeout(timer) }
      }, [toast])

      const tunnelUp = Boolean(snapshot && snapshot.tunnel && snapshot.tunnel.up)

      // 隧道一起来，就认为连接成功（不依赖登录页自己的提示）
      React.useEffect(function () {
        if (!tunnelUp) return
        if (phaseRef.current === 'submitted' || phaseRef.current === 'waiting' || phaseRef.current === 'manual') {
          log('隧道已建立，判定为已连接', 'ok')
          setPhaseSafe('connected')
        }
      }, [tunnelUp, log, setPhaseSafe])

      const releaseGuest = React.useCallback(async function () {
        const guest = guestRef.current
        guestRef.current = null
        if (!guest) return
        try { await guest.bridge.release(guest.lease) } catch (err) { /* 释放失败不影响流程 */ }
      }, [])

      const runLogin = React.useCallback(async function () {
        setError('')
        setEvents([])
        startedAtRef.current = Date.now()
        setPhaseSafe('opening')
        log(t('stepOpen'))

        let credentials = null
        try {
          credentials = await request('/credentials', { method: 'POST', body: '{}' })
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
          setPhaseSafe('error')
          log(t('noCred'), 'error')
          return
        }
        log('凭据已取到（' + credentials.username + '）')

        const bridge = window.dshDesktop && window.dshDesktop.protocolVersion === 1 ? window.dshDesktop.browser : null
        if (!bridge || typeof bridge.acquire !== 'function') {
          log(t('noBridge'), 'warn')
          try { await request('/open-browser', { method: 'POST', body: '{}' }) } catch (err) { /* ignore */ }
          setPhaseSafe('waiting')
          return
        }

        await releaseGuest()
        let reservation = null
        try {
          reservation = await bridge.acquire('dsh-vpn')
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
          setPhaseSafe('error')
          log('申请内置浏览器失败：' + err, 'error')
          return
        }

        // 容器必须先可见并渲染出来，webview 才能挂到 DOM 上
        setBrowserOpen(true)
        await new Promise(function (resolve) { setTimeout(resolve, 80) })
        let host = hostRef.current
        if (!host) {
          await new Promise(function (resolve) { setTimeout(resolve, 220) })
          host = hostRef.current
        }
        if (!host) {
          log('找不到内置浏览器容器，无法打开登录页', 'error')
          setPhaseSafe('error')
          return
        }

        const view = document.createElement('webview')
        view.setAttribute('name', reservation.lease)
        view.setAttribute('partition', reservation.partition)
        view.setAttribute('allowpopups', '')
        view.setAttribute('src', 'about:blank#' + reservation.lease)
        view.setAttribute('data-sidebar-browser-frame', 'webview')
        view.style.width = '100%'
        view.style.height = '100%'
        view.style.border = '0'
        host.appendChild(view)
        guestRef.current = { view: view, lease: reservation.lease, bridge: bridge }

        let stopped = false
        const deadline = Date.now() + LOGIN_TIMEOUT_MS

        const fill = async function () {
          if (stopped) return 'stopped'
          let result = ''
          try {
            const script = buildFillScript(credentials.username, credentials.password)
            result = await view.executeJavaScript(script, true)
          } catch (err) {
            return 'exec-error'
          }
          return String(result || '')
        }

        // webview 必须先触发过 about:blank 的 dom-ready，loadURL 才是合法的
        await new Promise(function (resolve) {
          let done = false
          const finish = function () { if (done) return; done = true; resolve() }
          view.addEventListener('dom-ready', finish, { once: true })
          setTimeout(finish, 4000)
        })

        view.addEventListener('dom-ready', function () { log('登录页已加载') })
        view.addEventListener('did-fail-load', function (event) {
          log('页面加载失败：' + (event && event.errorDescription ? event.errorDescription : 'unknown'), 'error')
        })

        // 断线/重连瞬间 VNIC 会改 DNS 后缀，域名解析可能短暂失败 —— 退避重试，最后兜底走系统浏览器
        const portalUrl = credentials.server.replace(/\/+$/, '') + '/portal/#/login'
        const backoff = [800, 1500, 2500, 4000, 6000, 8000]
        let loaded = false
        for (let attempt = 0; attempt < backoff.length && !loaded; attempt++) {
          try {
            await view.loadURL(portalUrl)
            loaded = true
          } catch (err) {
            const message = err && err.message ? err.message : String(err)
            const networkish = /ERR_NAME_NOT_RESOLVED|ERR_NETWORK_CHANGED|ERR_INTERNET_DISCONNECTED|ERR_CONNECTION/i.test(message)
            log((networkish ? '网络还没就绪（' + (message.match(/ERR_[A-Z_]+/) || ['解析/连接失败'])[0] + '），' : '') + '打开登录页失败（第 ' + (attempt + 1) + ' 次）', 'warn')
            if (attempt === backoff.length - 1) {
              log('多次失败，改用系统浏览器打开登录页；你在那边登录，这里会自动变「已连接」', 'warn')
              try { await request('/open-browser', { method: 'POST', body: '{}' }) } catch (e) { /* 打不开也不阻塞 */ }
              setPhaseSafe('waiting')
              return
            }
            await new Promise(function (resolve) { setTimeout(resolve, backoff[attempt]) })
          }
        }

        setPhaseSafe('loading')
        log(t('stepFill'))

        // 走 webview 的输入通道，产生 isTrusted 的真实鼠标事件（合成 click 会被某些前端校验丢掉）
        const clickAt = function (rect) {
          if (!rect || !(rect.w > 0) || !(rect.h > 0)) return false
          const x = Math.round(rect.x + rect.w / 2)
          const y = Math.round(rect.y + rect.h / 2)
          try {
            try { view.focus() } catch (err) { /* 焦点拿不到就算了 */ }
            view.sendInputEvent({ type: 'mouseMove', x: x, y: y })
            view.sendInputEvent({ type: 'mouseDown', x: x, y: y, button: 'left', clickCount: 1 })
            view.sendInputEvent({ type: 'mouseUp', x: x, y: y, button: 'left', clickCount: 1 })
            return true
          } catch (err) {
            return false
          }
        }

        let attempts = 0
        while (!stopped && Date.now() < deadline) {
          attempts++
          const rawResult = await fill()
          let result = { s: String(rawResult) }
          try { result = JSON.parse(rawResult) } catch (err) { result = { s: String(rawResult) } }

          if (result.s === 'no-form' && attempts <= 3) {
            log('还没找到登录表单（页面标题「' + (result.title || '') + '」，input ' + (result.inputs || 0) + ' 个）')
          }
          if (result.s === 'ready' || result.s === 'enter') {
            const note = (result.user ? '' : '，账号框没找到') + (result.pwdOk === false ? '，密码框没写进去' : '') + (result.agreed === false ? '，协议没勾上' : '')
            if (result.s === 'enter') {
              log(t('stepSubmit') + '（第 ' + attempts + ' 次尝试，没找到按钮，回车提交' + note + '）', 'ok')
            } else {
              const rectInfo = result.rect ? ('@' + Math.round(result.rect.x) + ',' + Math.round(result.rect.y) + ' ' + Math.round(result.rect.w) + 'x' + Math.round(result.rect.h)) : '@无坐标'
              log('填表完成' + note + (result.disabled ? '（按钮禁用中）' : '') + '，点「登录」' + rectInfo, 'ok')
              const ok = clickAt(result.rect)
              if (!ok) log('真实鼠标点击不可用，退回页面内 click()', 'warn')
              try {
                if (!ok) await view.executeJavaScript('(function(){var ns=Array.prototype.slice.call(document.querySelectorAll("button,[role=button],a"));for(var i=0;i<ns.length;i++){var t=((ns[i].innerText||"")+"").replace(/ /g,"");if(t==="登录"||t==="登陆"||t==="立即登录"){ns[i].click();return "ok"}}return "none"})()', true)
              } catch (err) { /* 兜底失败就等补点 */ }
            }
            setPhaseSafe('submitted')
            break
          }
          if (result.s === 'captcha') {
            log('登录页要图形验证码，交给你在下面填', 'warn')
            setPhaseSafe('manual')
            break
          }
          if (result === 'no-button') {
            // 已经在登录中或页面还没渲染完
          }
          await new Promise(function (resolve) { setTimeout(resolve, 1200) })
        }

        if (phaseRef.current === 'submitted') log(t('stepWait'))

        // 等隧道；期间处理两件事：① 登录页还停着就补点一次 ② 出现验证码/短信就把浏览器交给你
        let retryClicks = 0
        let goneCount = 0
        const settle = setInterval(async function () {
          if (stopped) return
          const state = await load()
          if (state && state.tunnel && state.tunnel.up) {
            setBrowserOpen(false)
            clearInterval(settle)
            return
          }
          if (phaseRef.current !== 'submitted') return

          let probe = ''
          try {
            probe = await view.executeJavaScript('(function(){'
              + 'var p=document.querySelector("input[type=password]");var still=false;'
              + 'try{var pr=p?p.getBoundingClientRect():null;still=!!pr&&pr.width>2&&pr.height>2}catch(e){}'
              + 'var cap=false;try{cap=Boolean(document.querySelector("input[placeholder*=验证码],input[placeholder*=短信],input[name*=captcha i]"))}catch(e){}'
              + 'var b=null,ns=Array.prototype.slice.call(document.querySelectorAll("button,[role=button],a"));'
              + 'for(var i=0;i<ns.length;i++){var t=((ns[i].innerText||"")+"").replace(/ /g,"");'
              + 'if(t==="登录"||t==="登陆"||t==="立即登录"){b=ns[i];break}}'
              + 'var br=b?b.getBoundingClientRect():null;'
              + 'return JSON.stringify({still:still,captcha:cap,rect:br?{x:br.left,y:br.top,w:br.width,h:br.height}:null})'
              + '})()', true)
          } catch (err) { probe = '' }

          let info = null
          try { info = JSON.parse(probe) } catch (err) { info = null }
          if (!info) return

          // 密码框消失 = 登录页已经跳走，说明登录被接受了，收起内置浏览器
          if (!info.still) {
            goneCount++
            if (goneCount >= 2) {
              setBrowserOpen(false)
              log('登录页已跳转，收起内置浏览器，继续等 aTrust 连上', 'ok')
              clearInterval(settle)
            }
            return
          }
          goneCount = 0

          if (info.captcha) {
            setPhaseSafe('manual')
            log(t('needManual'), 'warn')
            clearInterval(settle)
            return
          }
          if (info.still && retryClicks < 2) {
            retryClicks++
            // 按钮可能是「表单合法才可用」，先重填再点；4 次分别换一种点击方式
            const again = await fill()
            let parsed = null
            try { parsed = JSON.parse(again) } catch (err) { parsed = null }
            const rect = parsed && parsed.s === 'ready' && parsed.rect && parsed.rect.w > 0 ? parsed.rect : info.rect
            let how = ''
            if (retryClicks === 1) {
              how = clickAt(rect) ? '真实鼠标' : '鼠标不可用'
            } else if (retryClicks === 2) {
              try {
                how = await view.executeJavaScript('(function(){'
                  + 'var ns=Array.prototype.slice.call(document.querySelectorAll("button,[role=button],a"));'
                  + 'for(var i=0;i<ns.length;i++){var t=((ns[i].innerText||"")+"").replace(/ /g,"");'
                  + 'if(t==="登录"||t==="登陆"||t==="立即登录"){var b=ns[i];var r=b.getBoundingClientRect();'
                  + '["mousedown","mouseup","click"].forEach(function(k){b.dispatchEvent(new MouseEvent(k,{bubbles:true,cancelable:true,clientX:r.left+r.width/2,clientY:r.top+r.height/2}))});'
                  + 'return "js-mouse"}}return "none"'
                  + '})()', true)
              } catch (err) { how = 'js 失败' }
            } else if (retryClicks === 3) {
              try {
                await view.executeJavaScript('(function(){var p=document.querySelector("input[type=password]");if(p){p.focus();return "ok"}return "no"})()', true)
                view.sendInputEvent({ type: 'keyDown', keyCode: 'Return' })
                view.sendInputEvent({ type: 'char', keyCode: '\r' })
                view.sendInputEvent({ type: 'keyUp', keyCode: 'Return' })
                how = '回车'
              } catch (err) { how = '回车失败' }
            } else {
              try {
                how = await view.executeJavaScript('(function(){'
                  + 'var ns=Array.prototype.slice.call(document.querySelectorAll("button,[role=button],a,div,span"));'
                  + 'for(var i=0;i<ns.length;i++){var t=((ns[i].innerText||"")+"").replace(/ /g,"");'
                  + 'if((t==="登录"||t==="登陆")&&ns[i].click){ns[i].click();return "click"}}return "none"'
                  + '})()', true)
              } catch (err) { how = '兜底失败' }
            }
            log('还停在登录页，重新填表并再点「登录」（第 ' + retryClicks + ' 次，方式：' + how + '）', 'warn')
            // 把页面上可能弹出来的校验提示读回来（协议/密码/验证码…）
            try {
              const hint = await view.executeJavaScript('(function(){'
                + 'var b=document.body?String(document.body.innerText):"";'
                + 'var m=b.match(/.{0,30}(错误|失败|不能为空|请输入|验证码|已过期|拒绝|不正确|锁定|超时|未同意).{0,30}/);'
                + 'return m?m[0].replace(/\\s+/g," "):"none"'
                + '})()', true)
              if (hint && hint !== 'none') log('页面提示：' + String(hint).slice(0, 100), 'warn')
            } catch (err) { /* ignore */ }
          }
        }, 3000)

        setTimeout(function () {
          stopped = true
          clearInterval(settle)
          if (phaseRef.current === 'submitted' || phaseRef.current === 'loading') {
            setPhaseSafe('manual')
            log(t('failed'), 'warn')
          }
        }, LOGIN_TIMEOUT_MS)
      }, [load, log, releaseGuest, setPhaseSafe, t])

      const connect = async function () {
        const state = await load()
        if (!state) return
        if (!state.config.hasPassword || !state.config.user) {
          setError(t('noCred'))
          setSettingsOpen(true)
          return
        }
        if (state.tunnel && state.tunnel.up) {
          const ips = (state.tunnel.addresses || []).map(function (item) { return item.ip }).join(' / ')
          setToast('已经连着了：' + ips)
          setPhaseSafe('connected')
          return
        }
        void runLogin()
      }

      const disconnect = async function () {
        setToast(t('disconnectHint'))
      }

      const diagnose = async function () {
        try {
          await request('/diagnose', { method: 'POST', body: '{}' })
          setToast('诊断已执行，详见日志文件')
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
        }
      }

      const openLog = async function () {
        try { await request('/open-log', { method: 'POST', body: '{}' }); setToast(t('openLog')) } catch (err) { setError(String(err)) }
      }

      // 收起只是视觉隐藏：登录页一旦卸载，aTrust 的会话可能跟着断，所以不销毁 guest
      const closeBrowser = function () {
        setBrowserOpen(false)
      }

      const busy = phase === 'opening' || phase === 'loading' || phase === 'submitted' || phase === 'waiting'
      const needManual = phase === 'manual'
      const tunnelIp = snapshot && snapshot.tunnel && snapshot.tunnel.addresses && snapshot.tunnel.addresses.length
        ? snapshot.tunnel.addresses.map(function (item) { return item.ip }).join(' / ')
        : '—'

      let statusKey = 'stateDisconnected'
      let dotClass = ''
      if (tunnelUp) { statusKey = 'stateConnected'; dotClass = 'on' }
      else if (busy) { statusKey = 'stateConnecting'; dotClass = 'busy' }
      else if (needManual) { statusKey = 'stateManual'; dotClass = 'warn' }
      else if (phase === 'error') { statusKey = 'stateError'; dotClass = 'err' }

      const detail = tunnelUp
        ? '隧道 ' + tunnelIp
        : needManual ? t('needManual')
        : phase === 'error' ? error || t('failed')
        : t('subtitle')

      const stepState = function (key) {
        if (key === 'open') return phase === 'idle' ? '' : 'done'
        if (key === 'fill') return (phase === 'loading' || phase === 'submitted' || phase === 'manual' || tunnelUp) ? (phase === 'loading' ? 'active' : 'done') : ''
        if (key === 'submit') return (phase === 'submitted' || tunnelUp) ? 'done' : (phase === 'manual' ? 'active' : '')
        return tunnelUp ? 'done' : (busy ? 'active' : '')
      }

      return h('div', { className: 'vp-root' }, [
        h('div', { className: 'vp-shell', key: 'shell' }, [
          h('div', { className: 'vp-head', key: 'head' }, [
            h('div', { className: 'vp-logo', key: 'logo' }, [icon(19)]),
            h('div', { key: 'titles' }, [
              h('h1', { className: 'vp-h1', key: 'h1' }, t('title')),
              h('p', { className: 'vp-sub', key: 'sub' }, t('browserHint'))
            ]),
            h('div', { className: 'vp-spacer', key: 'sp' }),
            h('button', { className: 'vp-btn', key: 'diag', onClick: diagnose }, t('diag')),
            h('button', { className: 'vp-btn', key: 'set', onClick: function () { setSettingsOpen(true) } }, t('settings'))
          ]),

          h('div', { className: 'vp-card', key: 'card' }, [
            h('div', { className: 'vp-state', key: 'state' }, [
              h('span', { className: 'vp-dot ' + dotClass, key: 'dot' }),
              h('div', { key: 'text' }, [
                h('div', { className: 'vp-label', key: 'l' }, t(statusKey)),
                h('div', { className: 'vp-detail', key: 'd' }, detail)
              ])
            ]),
            h('div', { className: 'vp-steps', key: 'steps' }, [
              h('span', { className: 'vp-step ' + stepState('open'), key: 's1' }, '1 · ' + t('stepOpen')),
              h('span', { className: 'vp-step ' + stepState('fill'), key: 's2' }, '2 · ' + t('stepFill')),
              h('span', { className: 'vp-step ' + stepState('submit'), key: 's3' }, '3 · ' + t('stepSubmit')),
              h('span', { className: 'vp-step ' + stepState('wait'), key: 's4' }, '4 · ' + t('stepWait'))
            ]),
            h('div', { className: 'vp-actions', key: 'actions' }, [
              busy
                ? h('button', { className: 'vp-btn', key: 'busy', disabled: true }, t('connecting'))
                : h('button', { className: 'vp-btn primary', key: 'go', onClick: connect }, t('connect')),
              tunnelUp ? h('button', { className: 'vp-btn', key: 'off', onClick: disconnect }, t('disconnect')) : null,
              error ? h('span', { key: 'err', style: { color: '#c9372c', fontSize: '12px' } }, error) : null
            ]),
            h('div', { className: 'vp-meta', key: 'meta' }, [
              h('div', { className: 'vp-meta-item', key: 'server' }, [
                h('div', { className: 'vp-meta-key' }, t('server')),
                h('div', { className: 'vp-meta-val' }, (snapshot && snapshot.config && snapshot.config.server) || '—')
              ]),
              h('div', { className: 'vp-meta-item', key: 'user' }, [
                h('div', { className: 'vp-meta-key' }, t('account')),
                h('div', { className: 'vp-meta-val' }, (snapshot && snapshot.config && snapshot.config.user) || '—')
              ]),
              h('div', { className: 'vp-meta-item', key: 'ip' }, [
                h('div', { className: 'vp-meta-key' }, t('tunnel')),
                h('div', { className: 'vp-meta-val' }, tunnelIp)
              ]),
              h('div', { className: 'vp-meta-item', key: 'time' }, [
                h('div', { className: 'vp-meta-key' }, t('elapsed')),
                h('div', { className: 'vp-meta-val' }, startedAtRef.current ? fmtDuration(Date.now() - startedAtRef.current) : '—')
              ])
            ])
          ]),

          h('div', { className: 'vp-browser', key: 'browser', style: browserOpen ? {} : { display: 'none' } }, [
            h('div', { className: 'vp-browser-head', key: 'bh' }, [
              h('span', { key: 'label' }, t('loginArea')),
              h('div', { className: 'vp-spacer', key: 'sp2' }),
              h('button', { className: 'vp-btn', key: 'close', onClick: closeBrowser }, t('hide'))
            ]),
            h('div', { className: 'vp-browser-body', key: 'bb', ref: hostRef })
          ]),

          h('div', { className: 'vp-log', key: 'log' }, events.length
            ? events.map(function (event, index) {
                return h('div', { className: 'vp-row ' + (event.level || ''), key: index }, [
                  h('span', { className: 'vp-time' }, new Date(event.at).toLocaleTimeString().slice(0, 8)),
                  h('span', { className: 'vp-msg' }, event.message)
                ])
              })
            : h('div', { className: 'vp-row' }, [h('span', { className: 'vp-msg' }, t('noLogs'))]))
        ]),

        settingsOpen ? h(Settings, {
          key: 'settings',
          t: t,
          config: snapshot && snapshot.config,
          onClose: function () { setSettingsOpen(false) },
          onSaved: function () { setSettingsOpen(false); setToast(t('saved')); void load() }
        }) : null,

        toast ? h('div', { className: 'vp-toast', key: 'toast' }, toast) : null
      ])
    }

    function Settings(props) {
      const t = props.t
      const config = props.config || {}
      const [server, setServer] = React.useState(config.server || '')
      const [user, setUser] = React.useState(config.user || '')
      const [probe, setProbe] = React.useState(config.probe || '')
      const [password, setPassword] = React.useState('')
      const [saving, setSaving] = React.useState(false)
      const [error, setError] = React.useState('')

      const save = async function () {
        if (!server.trim()) { setError('先填服务器地址'); return }
        if (!user.trim()) { setError('先填账号'); return }
        if (probe.trim() && !/^[^\s:]+:\d+$/.test(probe.trim())) { setError('探针格式应为 host:port，例如 10.242.15.3:443；不需要就留空'); return }
        setSaving(true)
        setError('')
        try {
          await request('/config', {
            method: 'POST',
            body: JSON.stringify({ server: server.trim(), user: user.trim(), probe: probe.trim(), password: password })
          })
          props.onSaved()
        } catch (err) {
          setError(String(err && err.message ? err.message : err))
        } finally {
          setSaving(false)
        }
      }

      return h('div', { className: 'vp-sheet', onClick: function (event) { if (event.target === event.currentTarget) props.onClose() } }, [
        h('div', { className: 'vp-sheet-body', key: 'body' }, [
          h('div', { className: 'vp-head', style: { marginBottom: '16px' } }, [
            h('h1', { className: 'vp-h1', style: { fontSize: '16px' } }, t('settings')),
            h('div', { className: 'vp-spacer' }),
            h('button', { className: 'vp-btn', onClick: props.onClose }, t('close'))
          ]),
          h('div', { className: 'vp-field' }, [
            h('label', null, t('server')),
            h('input', { value: server, onChange: function (e) { setServer(e.target.value) }, placeholder: 'https://vpn.seeyon.com' })
          ]),
          h('div', { className: 'vp-field' }, [
            h('label', null, t('account')),
            h('input', { value: user, onChange: function (e) { setUser(e.target.value) }, placeholder: '工号 / 账号' })
          ]),
          h('div', { className: 'vp-field' }, [
            h('label', null, t('password')),
            h('input', {
              type: 'password',
              value: password,
              onChange: function (e) { setPassword(e.target.value) },
              placeholder: config.hasPassword ? t('passwordKeep') : t('passwordEmpty')
            }),
            h('div', { className: 'hint' }, config.hasPassword ? t('passwordKeep') : '')
          ]),
          h('div', { className: 'vp-field' }, [
            h('label', null, t('probe')),
            h('input', { value: probe, onChange: function (e) { setProbe(e.target.value) }, placeholder: '10.1.2.3:443' }),
            h('div', { className: 'hint' }, t('probeHint'))
          ]),
          error ? h('div', { style: { color: '#c9372c', fontSize: '12px', marginBottom: '10px' } }, error) : null,
          h('div', { className: 'vp-sheet-foot' }, [
            h('button', { className: 'vp-btn', onClick: props.onClose }, t('close')),
            h('button', { className: 'vp-btn primary', style: { height: '32px', padding: '0 15px' }, onClick: save, disabled: saving }, saving ? t('saving') : t('save'))
          ])
        ])
      ])
    }

    function apply(ctx) {
      ctx.effect(function () { return ctx.locale.register(NS, DICTS) }, NS + ': dictionaries')
      const t = ctx.locale.bind(NS)

      ctx.effect(function () {
        const style = document.createElement('style')
        style.setAttribute('data-dsh-vpn', 'styles')
        style.textContent = CSS
        document.head.appendChild(style)
        return function () { style.remove() }
      }, NS + ': styles')

      ctx.slots.inject('main', function () {
        return ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, function () {
          return h(App, { ctx: ctx, t: t })
        })
      })

      ctx.slots.inject('sidebar.panellist', function () {
        return ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 4,
          label: function () { return t('panel') },
          locale: NS
        }, function (owner) {
          return h('span', {
            style: { display: 'inline-flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
            'aria-hidden': 'true'
          }, [icon(owner && owner.size ? owner.size : 16)])
        })
      })
    }

    return { name: NS, inject: ['slots', 'locale', 'layout'], apply: apply }
  }
})
