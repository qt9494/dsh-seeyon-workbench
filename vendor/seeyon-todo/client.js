
window.__ModuleLoader__.load({
  id: '@local/dsh-seeyon-todo',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'seeyon-todo'
    const PANEL_ID = 'seeyon-todo'
    const API = '/seeyon-todo/api'
    let pendingOpenError = ''

    const DICTS = {
      zh: {
        panel: '致远工作台',
        title: '致远工作台',
        subtitle: '按优先级排好，点一条在内置浏览器打开表单',
        refresh: '刷新',
        refreshing: '刷新中…',
        settings: '设置',
        searchPlaceholder: '搜索标题、发起人或模板…',
        filterAll: '全部',
        filterUrgent: '需处理',
        filterOverdue: '已超期',
        countAll: '共 {n} 条',
        countUrgent: '{n} 条需处理',
        countOverdue: '{n} 条已超期',
        statTotal: '条待办',
        statUrgent: '条需处理',
        statOverdue: '条已超期',
        level3: '非常重要',
        level2: '重要',
        level1: '普通',
        level0: '未标注',
        overdue: '已超期 {n} 天',
        overdueToday: '今天已到期',
        today: '今天到期',
        tomorrow: '明天到期',
        daysLeft: '{n} 天后到期',
        noDeadline: '无期限',
        open: '内置浏览器打开',
        detail: '详情',
        close: '关闭',
        sender: '发起人',
        received: '接收',
        deadline: '期限',
        node: '当前节点',
        template: '模板',
        actions: '可用动作',
        attachments: '附件',
        opinionRequired: '意见必填',
        yes: '是',
        no: '否',
        emptyTitle: '没有符合条件的待办',
        emptyHint: '换个关键词，或点刷新再试一次。',
        errorTitle: '没能连上致远网关',
        errorHint: '检查网关地址与 MCP 授权码；本机需要连上 OA 所在网络。',
        retry: '重试',
        openSettings: '打开设置',
        demoBadge: '示例数据',
        demoHint: '当前展示的是示例数据，配置 MCP 授权码后自动切换为真实待办。',
        demoHintToken: '示例数据已开启（授权码已保存）。点「打开设置 → 测试连接」验证真实网关，关掉「使用示例数据」即可查看真实待办。',
        toastOpened: '已在右侧打开；表单右下角会出现助手按钮',
        toastNoUrl: '示例数据没有真实表单链接',
        toastAssistantReady: '表单助手已就绪（右下角紫色按钮）',
        toastNoGuest: '没找到右侧浏览器里的 OA 页面：确认是 Desktop 版并已打开浏览器 tab',
        toastInjecting: '正在向当前表单注入助手…',
        toastOpenFailed: '没能在 DSH 内置浏览器里打开：{msg}',
        toastNoBrowser: '内置浏览器 tab 未启用（Web 版默认关闭），无法在 DSH 内打开表单',
        backToList: '返回待办',
        reload: '刷新',
        openSidebar: '外置浏览器打开',
        formLoading: '正在打开表单…',
        formStuck: '仍在加载（超过 8 秒）…',
        loginRequired: '还没有登录 OA：在下方输入 OA 账号密码登录，登录成功后会自动打开这张表单（账号密码同 OA，不是 DSH 的）。',
        weeklyButton: '周计划',
        newForm: '新建表单',
        home: '主页',
        oaHome: 'OA 主页',
        templateTitle: '选择要发起的流程',
        templateSearch: '搜索模板名称…',
        templateLoading: '正在加载模板…',
        templateEmpty: '没有可发起的模板',
        templateFailed: '创建草稿失败',
        weeklyAssistant: '周计划助手',
        weeklyHint: '读取本周工时登记，按项目生成计划；确认后点“填入表单”，只写草稿不提交。',
        weeklyGenerate: '生成本周计划',
        weeklyGenerating: '生成中…',
        weeklyFill: '填入表单',
        weeklySummary: '上周总结',
        weeklyPlan: '下周计划',
        copy: '复制',
        copied: '已复制',
        copyFailed: '复制失败，请手动选择文本复制',
        meetings: '会议',
        meetingNo: '会议号',
        tabTodos: '待办',
        tabMeetings: '会议',
        meetingPassword: '密码',
        meetingRoomId: '视频房间',
        joinMeeting: '入会',
        declinedGroup: '已选不参会（单列）',
        meetingEmpty: '没有待开的会议',
        attend: '参会',
        decline: '不参会',
        meetingAttended: '已回执：参会',
        meetingDeclined: '已回执：不参会',
        meetingReceiptFailed: '回执失败',
        reportAssistant: '项目周报助手',
        reportHint: '读取上一条项目周报的完成进度与下一步要事，结合本周工时日志和其他成员日志生成，可分段复制。',
        reportGenerate: '生成周报素材',
        reportGenerating: '生成中…',
        reportFailed: '生成失败',
        weeklyFilled: '已填入表单，请检查后提交',
        weeklyWeight: '权重',
        weeklyNoRows: '本周没有工时登记',
        weeklyTitle: '周计划准备',
        weeklyPreparing: '正在读取本周工时登记并生成周计划草稿…',
        weeklyPreparingShort: '生成中…',
        weeklyReady: '周计划草稿已生成，请检查后提交',
        oaLoginTitle: 'OA 账号',
        oaUsername: 'OA 用户名',
        oaPassword: 'OA 密码',
        oaPasswordSaved: '已保存，留空不修改',
        autoLogin: '自动登录 OA',
        oaLoginHint: '密码只保存在本机 ~/.dsh/seeyon-todo/config.json，用于在内嵌浏览器里自动填登录表单；登录态按 DSH 运行期保留。',
        loginNow: '登录 OA',
        openFormAgain: '打开表单',
        iframeFallback: '当前宿主没有内嵌浏览器能力，已用普通 iframe 展示；表单助手在这种模式下不可用。',
        toastInjected: '已请求注入当前 OA 页面',
        toastSaved: '设置已保存',
        toastSavedDemo: '已切换到示例数据',
        settingsTitle: '插件设置',
        gateway: 'MCP 网关地址',
        gatewayHint: '默认是致远官方网关；自建 OA 用自建网关的同源地址。',
        token: 'MCP 授权码',
        tokenHint: '已保存 ••••{hint}；留空表示不修改。到 OA「个人应用设置 → 任务令牌 → 获取 MCP 授权码」领取。',
        tokenMissing: '尚未配置。到 OA「个人应用设置 → 任务令牌 → 获取 MCP 授权码」领取后填在这里。',
        tokenPlaceholder: '留空则不修改已保存的授权码',
        oaOrigin: 'OA 站点地址',
        oaOriginHint: '用于校验直达链接、限定注入范围，例如 https://xt.seeyon.com。',
        pageSize: '每页条数',
        maxPages: '最多拉取页数',
        attitude: '默认审批态度',
        attitudeHint: '注入表单时预选的态度，例如「同意」。',
        templatesTitle: '意见代填模板',
        templatesHint: '在表单助手面板里点一下就填进意见框。',
        templateLabel: '按钮名',
        templateText: '意见内容',
        addTemplate: '添加模板',
        fieldsTitle: '一键填入字段',
        fieldsHint: '按「字段名」匹配表单控件；匹配不到就到表单里点「拾取元素」绑定一次。',
        fieldLabel: '字段名',
        fieldValue: '填入值',
        addField: '添加字段',
        demo: '使用示例数据',
        autoInject: '打开表单时自动注入助手',
        test: '测试连接',
        testing: '测试中…',
        save: '保存',
        saving: '保存中…',
        testOk: '连接正常',
        testFail: '连接失败',
        footerHint: '数据来自致远 OA 官方 MCP 网关；插件只读取，不替你做审批。',
        loading: '正在读取待办…',
        demoOpen: '示例数据',
        injectNow: '重新注入',
        source: '来源',
        version: '版本',
      },
      en: {
        panel: 'Seeyon Workbench',
        title: 'Seeyon OA To-dos',
        subtitle: 'Sorted by priority — open a form in the right sidebar with one click',
        refresh: 'Refresh',
        refreshing: 'Refreshing…',
        settings: 'Settings',
        searchPlaceholder: 'Search subject, sender, or template…',
        filterAll: 'All',
        filterUrgent: 'Needs action',
        filterOverdue: 'Overdue',
        countAll: '{n} to-dos',
        countUrgent: '{n} need action',
        countOverdue: '{n} overdue',
        statTotal: 'to-dos',
        statUrgent: 'need action',
        statOverdue: 'overdue',
        level3: 'Critical',
        level2: 'Important',
        level1: 'Normal',
        level0: 'Unlabeled',
        overdue: 'Overdue {n}d',
        overdueToday: 'Due today (passed)',
        today: 'Due today',
        tomorrow: 'Due tomorrow',
        daysLeft: 'Due in {n}d',
        noDeadline: 'No deadline',
        open: 'Open in app',
        detail: 'Details',
        close: 'Close',
        sender: 'Sender',
        received: 'Received',
        deadline: 'Deadline',
        node: 'Node',
        template: 'Template',
        actions: 'Actions',
        attachments: 'Attachments',
        opinionRequired: 'Opinion required',
        yes: 'Yes',
        no: 'No',
        emptyTitle: 'No matching to-dos',
        emptyHint: 'Try another keyword or refresh.',
        errorTitle: 'Could not reach the Seeyon gateway',
        errorHint: 'Check the gateway URL and MCP token; the machine must reach the OA network.',
        retry: 'Retry',
        openSettings: 'Open settings',
        demoBadge: 'Sample data',
        demoHint: 'Sample data is on. Configure an MCP token to switch to real to-dos.',
        demoHintToken: 'Sample data is on (a token is already saved). Use Test connection, then turn off sample data to load real to-dos.',
        toastOpened: 'Opened on the right; the assistant sits bottom-right in the form',
        toastNoUrl: 'Sample rows have no real form link',
        toastAssistantReady: 'Assistant is ready (purple button, bottom-right)',
        toastNoGuest: 'No OA page found in the sidebar browser: use Desktop and open a browser tab',
        toastInjecting: 'Injecting the assistant into the current form…',
        toastOpenFailed: 'Could not open in the DSH browser: {msg}',
        toastNoBrowser: 'The in-app browser tab is not enabled (off by default on Web)',
        backToList: 'Back to to-dos',
        reload: 'Refresh',
        openSidebar: 'Open in browser',
        formLoading: 'Opening the form…',
        formStuck: 'Still loading (over 8s)…',
        loginRequired: 'Not signed in to OA yet: use the OA login below; the form opens automatically after signing in.',
        weeklyButton: 'Weekly plan',
        newForm: 'New form',
        home: 'Home',
        oaHome: 'OA home',
        templateTitle: 'Choose a process',
        templateSearch: 'Search templates…',
        templateLoading: 'Loading templates…',
        templateEmpty: 'No startable templates',
        templateFailed: 'Failed to create draft',
        weeklyAssistant: 'Weekly plan assistant',
        weeklyHint: 'Reads this week\'s timesheets and groups by project. “Fill form” writes the draft only.',
        weeklyGenerate: 'Generate plan',
        weeklyGenerating: 'Generating…',
        weeklyFill: 'Fill form',
        weeklySummary: 'Last week summary',
        weeklyPlan: 'Next week plan',
        copy: 'Copy',
        copied: 'Copied',
        copyFailed: 'Copy failed — select the text manually',
        meetings: 'Meetings',
        meetingNo: 'Meeting no.',
        tabTodos: 'To-dos',
        tabMeetings: 'Meetings',
        meetingPassword: 'Password',
        meetingRoomId: 'Room',
        joinMeeting: 'Join',
        declinedGroup: 'Declined',
        meetingEmpty: 'No upcoming meetings',
        attend: 'Attend',
        decline: 'Decline',
        meetingAttended: 'Receipt sent: attend',
        meetingDeclined: 'Receipt sent: decline',
        meetingReceiptFailed: 'Receipt failed',
        reportAssistant: 'Project report assistant',
        reportHint: 'Reads the previous project report and this week\'s worklogs; copy each section.',
        reportGenerate: 'Generate',
        reportGenerating: 'Generating…',
        reportFailed: 'Failed to generate',
        weeklyFilled: 'Filled — review and submit',
        weeklyWeight: 'Weight',
        weeklyNoRows: 'No timesheets this week',
        weeklyTitle: 'Prepare weekly plan',
        weeklyPreparing: 'Reading this week\'s timesheets and drafting the plan…',
        weeklyPreparingShort: 'Drafting…',
        weeklyReady: 'Weekly plan draft created — review and submit',
        oaLoginTitle: 'OA account',
        oaUsername: 'OA username',
        oaPassword: 'OA password',
        oaPasswordSaved: 'Saved — leave blank to keep',
        autoLogin: 'Sign in to OA automatically',
        oaLoginHint: 'The password is stored only in ~/.dsh/seeyon-todo/config.json and typed into the OA login form inside the embedded browser.',
        loginNow: 'Sign in to OA',
        openFormAgain: 'Open form',
        iframeFallback: 'This host has no embedded browser; the form is shown in a plain iframe without the assistant.',
        toastInjected: 'Asked the host to inject the current OA page',
        toastSaved: 'Settings saved',
        toastSavedDemo: 'Switched to sample data',
        settingsTitle: 'Settings',
        gateway: 'MCP gateway URL',
        gatewayHint: 'Defaults to the official gateway; self-hosted OA uses its own gateway URL.',
        token: 'MCP token',
        tokenHint: 'Saved ••••{hint}; leave blank to keep it. Get one in OA: Personal settings → Task token → MCP authorization code.',
        tokenMissing: 'Not configured yet. Get one in OA: Personal settings → Task token → MCP authorization code.',
        tokenPlaceholder: 'Leave blank to keep the saved token',
        oaOrigin: 'OA origin',
        oaOriginHint: 'Used to validate links and scope injection, e.g. https://xt.seeyon.com.',
        pageSize: 'Page size',
        maxPages: 'Max pages',
        attitude: 'Default attitude',
        attitudeHint: 'Preselected in the injected form, e.g. "Agree".',
        templatesTitle: 'Opinion templates',
        templatesHint: 'Click one in the form assistant to fill the opinion box.',
        templateLabel: 'Button',
        templateText: 'Opinion text',
        addTemplate: 'Add template',
        fieldsTitle: 'One-click fields',
        fieldsHint: 'Matched by field name; bind unknown controls with the picker in the form.',
        fieldLabel: 'Field name',
        fieldValue: 'Value',
        addField: 'Add field',
        demo: 'Use sample data',
        autoInject: 'Inject the assistant when a form opens',
        test: 'Test connection',
        testing: 'Testing…',
        save: 'Save',
        saving: 'Saving…',
        testOk: 'Connected',
        testFail: 'Connection failed',
        footerHint: 'Data comes from the Seeyon MCP gateway. The plugin only reads; it never approves for you.',
        loading: 'Loading to-dos…',
        demoOpen: 'Sample data',
        injectNow: 'Re-inject',
        source: 'Source',
        version: 'Version',
      },
    }

    const LEVELS = [
      { key: 3, labelKey: 'level3', color: '#e5484d', soft: 'rgba(229,72,77,.12)' },
      { key: 2, labelKey: 'level2', color: '#ef8d1f', soft: 'rgba(239,141,31,.13)' },
      { key: 1, labelKey: 'level1', color: '#7b8494', soft: 'rgba(123,132,148,.12)' },
      { key: 0, labelKey: 'level0', color: '#a7b0c0', soft: 'rgba(167,176,192,.14)' },
    ]

    const CSS = [
      '.st-root{height:100%;min-height:0;overflow:auto;background:var(--st-bg);color:var(--st-ink);font-family:var(--dsw-font-family,inherit);--st-bg:var(--dsw-alias-bg-layer-2,#f5f6f8);--st-surface:var(--dsw-alias-bg-layer-1,#fff);--st-surface-2:var(--dsw-alias-bg-layer-3,#f2f3f5);--st-border:var(--dsw-alias-border-l2,#e4e7ec);--st-border-strong:var(--dsw-alias-border-l3,#cfd4dc);--st-ink:var(--dsw-alias-label-primary,#1f2328);--st-muted:var(--dsw-alias-label-secondary,#667085);--st-faint:var(--dsw-alias-label-tertiary,#98a2b3);--st-accent:var(--dsw-alias-state-business-primary,#4f6ef7);--st-danger:var(--dsw-alias-state-error-primary,#d92d20);}',
      '.st-root,.st-root *{box-sizing:border-box}',
      '.st-root button,.st-root input,.st-root select,.st-root textarea{font:inherit}',
      '.st-shell{width:100%;max-width:1120px;margin:0 auto;padding:calc(var(--dsh-frame-top-clearance,0px) + 24px) 28px 56px}',
      '.st-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}',
      '.st-brand{display:flex;align-items:center;gap:13px;min-width:0}',
      '.st-logo{width:44px;height:44px;flex:none;border-radius:13px;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#3b5bfd 0%,#7c4dff 100%);box-shadow:0 7px 20px rgba(59,91,253,.28)}',
      '.st-title{margin:0;font-size:21px;line-height:1.25;font-weight:650;letter-spacing:-.01em}',
      '.st-subtitle{margin:4px 0 0;font-size:12.5px;line-height:1.45;color:var(--st-muted)}',
      '.st-actions{display:flex;align-items:center;gap:8px;flex:none}',
      '.st-btn{height:32px;padding:0 12px;border:1px solid var(--st-border);border-radius:9px;background:var(--st-surface);color:var(--st-ink);font-size:12.5px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;transition:border-color .15s ease,background .15s ease}',
      '.st-btn:hover{border-color:var(--st-border-strong);background:var(--st-surface-2)}',
      '.st-btn[disabled]{opacity:.55;cursor:default}',
      '.st-btn.primary{background:var(--st-accent);border-color:var(--st-accent);color:#fff;box-shadow:0 6px 16px rgba(79,110,247,.22)}',
      '.st-btn.primary:hover{filter:brightness(1.04);background:var(--st-accent)}',
      '.st-iconbtn{width:32px;padding:0;justify-content:center}',
      '.st-stats{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}',
      '.st-stat{display:inline-flex;align-items:center;gap:7px;height:30px;padding:0 11px;border-radius:9px;border:1px solid var(--st-border);background:var(--st-surface);font-size:12px;color:var(--st-muted)}',
      '.st-stat b{color:var(--st-ink);font-size:13px}',
      '.st-dot{width:7px;height:7px;border-radius:50%;flex:none}',
      '.st-stat.warn{border-color:rgba(239,141,31,.4);background:rgba(239,141,31,.07)}',
      '.st-stat.danger{border-color:rgba(229,72,77,.42);background:rgba(229,72,77,.07)}',
      '.st-stat.danger b{color:#c62b30}',
      '.st-toolbar{display:flex;align-items:center;gap:10px;margin-bottom:18px;flex-wrap:wrap}',
      '.st-search{position:relative;flex:1;min-width:200px}',
      '.st-search svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--st-faint);pointer-events:none}',
      '.st-search input{width:100%;height:34px;padding:0 12px 0 32px;border:1px solid var(--st-border);border-radius:9px;background:var(--st-surface);color:var(--st-ink);outline:none;font-size:13px}',
      '.st-search input:focus{border-color:#8ea0f2;box-shadow:0 0 0 3px rgba(79,110,247,.13)}',
      '.st-seg{display:inline-flex;padding:3px;gap:2px;border:1px solid var(--st-border);border-radius:9px;background:var(--st-surface)}',
      '.st-seg button{border:0;background:transparent;height:28px;padding:0 11px;border-radius:7px;font-size:12.5px;color:var(--st-muted);cursor:pointer;white-space:nowrap}',
      '.st-seg button[data-active="1"]{background:var(--st-surface-2);color:var(--st-ink);font-weight:600;box-shadow:inset 0 0 0 1px var(--st-border)}',
      '.st-banner{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:10px;border:1px solid rgba(79,110,247,.28);background:rgba(79,110,247,.06);color:#33427a;font-size:12.5px;margin-bottom:16px;line-height:1.5;white-space:pre-wrap}',
      '.st-banner.warn{border-color:rgba(239,141,31,.35);background:rgba(239,141,31,.08);color:#8a5410}',
      '.st-banner.error{border-color:rgba(229,72,77,.35);background:rgba(229,72,77,.07);color:#9f2b30;align-items:flex-start}',
      '.st-banner .st-banner-body{flex:1;min-width:0}',
      '.st-banner-actions{display:flex;gap:7px;flex:none}',
      '.st-section{margin-bottom:22px}',
      '.st-section-head{display:flex;align-items:center;gap:8px;margin:0 0 9px;font-size:12.5px;font-weight:650;color:var(--st-ink)}',
      '.st-section-head .st-count{font-weight:500;color:var(--st-faint);font-size:11.5px}',
      '.st-list{display:flex;flex-direction:column;gap:8px}',
      '.st-card{position:relative;display:flex;align-items:stretch;gap:0;width:100%;text-align:left;border:1px solid var(--st-border);border-radius:12px;background:var(--st-surface);cursor:pointer;overflow:hidden;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease;padding:0}',
      '.st-card:hover{border-color:var(--st-border-strong);box-shadow:0 8px 22px rgba(15,23,42,.07);transform:translateY(-1px)}',
      '.st-card:focus-visible{outline:2px solid var(--st-accent);outline-offset:2px}',
      '.st-bar{width:4px;flex:none;background:var(--st-level-color,#a7b0c0)}',
      '.st-card-main{flex:1;min-width:0;padding:11px 12px 11px 13px;display:flex;flex-direction:column;gap:5px}',
      '.st-card-top{display:flex;align-items:center;gap:8px;min-width:0}',
      '.st-subject{font-size:13.5px;font-weight:600;line-height:1.45;color:var(--st-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.st-badge{flex:none;height:20px;padding:0 7px;border-radius:6px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}',
      '.st-badge.overdue{background:rgba(229,72,77,.12);color:#c62b30}',
      '.st-badge.today{background:rgba(239,141,31,.14);color:#a7610e}',
      '.st-badge.soon{background:rgba(79,110,247,.1);color:#3f57c9}',
      '.st-badge.later{background:var(--st-surface-2);color:var(--st-muted)}',
      '.st-badge.none{display:none}',
      '.st-meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:11.5px;color:var(--st-faint);min-width:0}',
      '.st-meta span{display:inline-flex;align-items:center;gap:4px;min-width:0}',
      '.st-meta em{font-style:normal;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;color:var(--st-muted)}',
      '.st-card-side{display:flex;align-items:center;gap:2px;padding-right:8px;flex:none}',
      '.st-mini{width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--st-faint);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}',
      '.st-mini:hover{background:var(--st-surface-2);color:var(--st-ink)}',
      '.st-open{height:26px;padding:0 9px;border-radius:7px;border:1px solid var(--st-border);background:var(--st-surface);color:var(--st-muted);font-size:11.5px;cursor:pointer;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}',
      '.st-card:hover .st-open{border-color:rgba(79,110,247,.45);color:var(--st-accent)}',
      '.st-empty,.st-error{display:flex;flex-direction:column;align-items:center;text-align:center;padding:56px 20px;color:var(--st-muted)}',
      '.st-empty-icon{width:46px;height:46px;border-radius:14px;background:var(--st-surface-2);display:flex;align-items:center;justify-content:center;color:var(--st-faint);margin-bottom:14px}',
      '.st-empty h3,.st-error h3{margin:0 0 6px;font-size:15px;font-weight:650;color:var(--st-ink)}',
      '.st-empty p,.st-error p{margin:0 0 14px;font-size:12.5px;max-width:460px;line-height:1.6}',
      '.st-error-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}',
      '.st-skel{display:flex;flex-direction:column;gap:8px}',
      '.st-skel-row{height:58px;border-radius:12px;border:1px solid var(--st-border);background:linear-gradient(90deg,var(--st-surface) 0%,var(--st-surface-2) 45%,var(--st-surface) 90%);background-size:220% 100%;animation:st-shimmer 1.25s ease-in-out infinite}',
      '@keyframes st-shimmer{0%{background-position:120% 0}100%{background-position:-20% 0}}',
      '.st-overlay{position:fixed;inset:0;z-index:40;background:rgba(15,23,42,.32);backdrop-filter:blur(2px);display:flex;justify-content:flex-end}',
      '.st-drawer{width:min(520px,100%);height:100%;overflow:auto;background:var(--st-surface);border-left:1px solid var(--st-border);box-shadow:-18px 0 48px rgba(15,23,42,.16);display:flex;flex-direction:column;animation:st-slide .18s ease}',
      '@keyframes st-slide{from{transform:translateX(16px);opacity:.7}to{transform:none;opacity:1}}',
      '.st-drawer-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px;border-bottom:1px solid var(--st-border);background:var(--st-surface)}',
      '.st-drawer-head h3{margin:0;font-size:15px;font-weight:650}',
      '.st-drawer-body{padding:16px 18px 30px;display:flex;flex-direction:column;gap:14px}',
      '.st-field{display:flex;flex-direction:column;gap:5px}',
      '.st-field label{font-size:12px;font-weight:600;color:var(--st-ink)}',
      '.st-field .hint{font-size:11.5px;color:var(--st-faint);line-height:1.55}',
      '.st-input,.st-textarea,.st-select{width:100%;border:1px solid var(--st-border);border-radius:9px;background:var(--st-surface);color:var(--st-ink);padding:8px 10px;font-size:12.5px;outline:none}',
      '.st-input:focus,.st-textarea:focus,.st-select:focus{border-color:#8ea0f2;box-shadow:0 0 0 3px rgba(79,110,247,.12)}',
      '.st-textarea{resize:vertical;min-height:56px;line-height:1.55}',
      '.st-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.st-editor{display:flex;flex-direction:column;gap:8px}',
      '.st-editor-row{display:flex;gap:8px;align-items:flex-start;padding:9px;border:1px solid var(--st-border);border-radius:10px;background:var(--st-surface-2)}',
      '.st-editor-row .grow{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}',
      '.st-editor-row input,.st-editor-row textarea{width:100%;border:1px solid var(--st-border);border-radius:7px;background:var(--st-surface);color:var(--st-ink);padding:6px 8px;font-size:12px;outline:none}',
      '.st-editor-row .del{width:26px;height:26px;border:0;border-radius:7px;background:transparent;color:var(--st-faint);cursor:pointer;flex:none}',
      '.st-editor-row .del:hover{background:rgba(229,72,77,.1);color:#c62b30}',
      '.st-switch{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--st-ink);cursor:pointer;user-select:none}',
      '.st-switch input{width:15px;height:15px;accent-color:var(--st-accent)}',
      '.st-drawer-foot{position:sticky;bottom:0;display:flex;gap:8px;justify-content:flex-end;padding:12px 18px;border-top:1px solid var(--st-border);background:var(--st-surface)}',
      '.st-test{font-size:12px;line-height:1.55;padding:8px 10px;border-radius:8px;border:1px solid var(--st-border);background:var(--st-surface-2);color:var(--st-muted);white-space:pre-wrap;word-break:break-word}',
      '.st-test.ok{border-color:rgba(24,107,63,.35);background:rgba(24,107,63,.07);color:#186b3f}',
      '.st-test.bad{border-color:rgba(229,72,77,.35);background:rgba(229,72,77,.07);color:#9f2b30}',
      '.st-detail-sub{margin:0;font-size:13px;line-height:1.6;color:var(--st-ink);font-weight:600}',
      '.st-kv{display:grid;grid-template-columns:88px 1fr;gap:7px 10px;font-size:12.5px}',
      '.st-kv dt{color:var(--st-faint)}',
      '.st-kv dd{margin:0;color:var(--st-ink);word-break:break-word}',
      '.st-content{padding:11px 12px;border-radius:10px;background:var(--st-surface-2);border:1px solid var(--st-border);font-size:12.5px;line-height:1.7;color:var(--st-ink);white-space:pre-wrap;word-break:break-word;max-height:260px;overflow:auto}',
      '.st-chips{display:flex;flex-wrap:wrap;gap:6px}',
      '.st-tag{height:22px;padding:0 8px;border-radius:6px;background:var(--st-surface-2);border:1px solid var(--st-border);color:var(--st-muted);font-size:11.5px;display:inline-flex;align-items:center}',
      '.st-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;padding:9px 14px;border-radius:10px;background:#1f2937;color:#fff;font-size:12.5px;box-shadow:0 14px 34px rgba(0,0,0,.28);max-width:min(560px,80vw);text-align:center}',
      '.st-foot{margin-top:26px;font-size:11.5px;color:var(--st-faint);display:flex;gap:10px;flex-wrap:wrap;align-items:center}',
      '.st-src{display:inline-flex;align-items:center;gap:5px;padding:2px 7px;border-radius:6px;background:var(--st-surface-2);border:1px solid var(--st-border)}',
      '.st-root-form{overflow:hidden}',
      '.st-form-wrap{position:relative;height:100%;display:flex;flex-direction:column;min-height:0}',
      '.st-weekly{position:absolute;right:14px;bottom:46px;z-index:30;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;max-width:calc(100vw - 28px)}',
      '.st-weekly>*{pointer-events:auto}',
      '.st-weekly-fab{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;border:1px solid rgba(99,61,229,.35);background:var(--st-accent,#633de5);color:#fff;font-size:12px;cursor:pointer;box-shadow:0 8px 20px rgba(40,20,120,.22)}',
      '.st-weekly-panel{width:360px;max-width:calc(100vw - 28px);max-height:62vh;display:flex;flex-direction:column;padding:12px;border-radius:14px;border:1px solid var(--st-border);background:var(--st-surface);box-shadow:0 18px 44px rgba(20,12,60,.22)}',
      '.st-weekly-head{display:flex;align-items:center;justify-content:space-between;font-weight:600;font-size:13px}',
      '.st-weekly-close{display:inline-flex;align-items:center;justify-content:center;padding:2px;border:0;background:transparent;color:var(--st-faint);cursor:pointer}',
      '.st-weekly-hint{font-size:11px;color:var(--st-faint);margin:4px 0 8px;line-height:1.55}',
      '.st-weekly-body{overflow:auto;min-height:0;display:flex;flex-direction:column;gap:10px}',
      '.st-weekly-section{border-top:1px solid var(--st-border);padding-top:8px}',
      '.st-weekly-sec-head{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:600;margin-bottom:5px}',
      '.st-weekly-copy{padding:2px 8px;border-radius:6px;border:1px solid var(--st-border);background:transparent;color:var(--st-muted);font-size:11px;cursor:pointer}',
      '.st-weekly-copy:hover{color:var(--st-accent);border-color:var(--st-accent)}',
      '.st-weekly-list{display:flex;flex-direction:column;gap:8px}',
      '.st-weekly-row{border-top:1px dashed var(--st-border);padding-top:7px}',
      '.st-weekly-rowhead{display:flex;justify-content:space-between;gap:8px;font-size:12px}',
      '.st-weekly-desc{font-size:12px;color:var(--st-muted);white-space:pre-wrap;line-height:1.5;margin-top:3px}',
      '.st-weekly-rowfoot{display:flex;justify-content:flex-end;margin-top:4px}',
      '.st-weekly-summary{font-size:12px;color:var(--st-ink);white-space:pre-wrap;line-height:1.55;max-height:26vh;overflow:auto}',
      '.st-weekly-error{margin-top:8px;color:#c62b30;font-size:12px;white-space:pre-wrap}',
      '.st-meeting{padding:10px 0;border-bottom:1px solid var(--st-border)}',
      '.st-meeting-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;font-size:13px}',
      '.st-meeting-meta{margin-top:4px;font-size:11px;color:var(--st-faint);line-height:1.5}',
      '.st-meeting-actions{display:flex;gap:8px;margin-top:8px}',
      '.st-meeting-content{margin-top:5px;font-size:12px;color:var(--st-muted);line-height:1.55;white-space:pre-wrap;max-height:9.3em;overflow:hidden}',
      '.st-meeting-no{margin-top:5px;font-size:11px;color:var(--st-accent);font-weight:600}',
      '.st-meeting-group{margin-top:14px;padding-top:10px;border-top:1px dashed var(--st-border);font-size:11px;color:var(--st-faint);font-weight:600}',
      '.st-tab-meetings .st-banner,.st-tab-meetings .st-stats,.st-tab-meetings .st-toolbar,.st-tab-meetings .st-error,.st-tab-meetings .st-section,.st-tab-meetings .st-foot,.st-tab-meetings .st-skel{display:none}',
      '.st-meetings-view{padding-top:6px}',
      '.st-meetings-head{font-size:13px;font-weight:600;margin-bottom:8px}',
      '.st-tabs-inline{display:flex;gap:6px;margin-top:8px}',
      '.st-tab{padding:4px 12px;border-radius:999px;border:1px solid var(--st-border);background:transparent;color:var(--st-muted);font-size:12px;cursor:pointer}',
      '.st-tab.active{background:var(--st-accent,#633de5);border-color:var(--st-accent,#633de5);color:#fff}',
      '.st-empty{padding:18px 0;text-align:center;color:var(--st-faint);font-size:12px}',
      '.st-picker-list{display:flex;flex-direction:column;gap:4px;margin-top:10px;max-height:52vh;overflow:auto}',
      '.st-picker-item{display:block;width:100%;text-align:left;padding:8px 10px;border:1px solid transparent;border-radius:8px;background:transparent;color:var(--st-ink);font-size:13px;cursor:pointer}',
      '.st-picker-item:hover{background:rgba(99,61,229,.08);border-color:var(--st-border)}',
      '.st-picker-hint{margin-top:10px;font-size:12px;color:var(--st-faint)}',
      '.st-form{display:flex;flex-direction:column;height:100%;min-height:0;background:var(--st-bg)}',
      '.st-form-bar{display:flex;align-items:center;gap:10px;flex:none;padding:calc(var(--dsh-frame-top-clearance,0px) + 10px) 14px 10px;border-bottom:1px solid var(--st-border);background:var(--st-surface)}',
      '.st-form-title{flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--st-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.st-form-actions{display:flex;gap:6px;flex:none}',
      '.st-form-body{display:flex;flex-direction:column;flex:1;min-height:0;background:#fff}',
      '.st-form-stage{position:relative;flex:1;min-height:0;background:#fff}',
      '.st-form-status{display:flex;align-items:center;gap:8px;flex:none;height:23px;padding:0 10px;border-top:1px solid var(--st-border);background:var(--st-surface);font-size:11px;color:var(--st-faint);overflow:hidden}',
      '.st-form-dot{width:6px;height:6px;border-radius:50%;flex:none;background:#98a2b3}',
      '.st-form-dot[data-phase="ready"]{background:#22a06b}',
      '.st-form-dot[data-phase="loading"]{background:#ef8d1f}',
      '.st-form-dot[data-phase="iframe"]{background:#e5484d}',
      '.st-form-url{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--st-muted)}',
      '.st-form-fail{flex:none;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c62b30}',
      '.st-form-host{position:absolute;inset:0}',
      '.st-form-frame{position:absolute;inset:0;width:100%;height:100%;border:0}',
      '.st-form-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--st-muted);font-size:13px}',
      '.st-form-note{position:absolute;left:0;right:0;bottom:0;z-index:1;padding:8px 12px;background:rgba(239,141,31,.13);border-top:1px solid rgba(239,141,31,.32);color:#8a5410;font-size:11.5px;line-height:1.5}',
      '.st-form-error{position:absolute;left:12px;right:12px;bottom:12px;z-index:2;padding:9px 11px;border-radius:8px;background:rgba(229,72,77,.1);border:1px solid rgba(229,72,77,.35);color:#9f2b30;font-size:12px;line-height:1.5;white-space:pre-wrap}',
      '.st-form-login{position:absolute;left:0;right:0;top:0;z-index:2;padding:8px 12px;background:rgba(239,141,31,.14);border-bottom:1px solid rgba(239,141,31,.35);color:#8a5410;font-size:12px;line-height:1.55}',
      '@media (max-width:720px){.st-shell{padding:calc(var(--dsh-frame-top-clearance,0px) + 16px) 16px 40px}.st-head{flex-direction:column}.st-actions{width:100%;justify-content:flex-end}.st-row2{grid-template-columns:1fr}}',
    ].join('\n')

    // ---------------------------------------------------------------- helpers

    function interpolate(template, values) {
      return String(template || '').replace(/\{(\w+)\}/g, function (match, key) {
        return values && values[key] !== undefined ? String(values[key]) : match
      })
    }

    function parseDateTime(value) {
      if (!value) return null
      if (value instanceof Date) return value
      const text = String(value).trim()
      if (!text) return null
      if (/^\d{10,13}$/.test(text)) {
        const number = Number(text)
        return new Date(text.length === 10 ? number * 1000 : number)
      }
      const normalized = text.replace(/-/g, '/').replace(/T/, ' ').replace(/\.\d+Z?$/, '')
      const date = new Date(normalized)
      return Number.isNaN(date.getTime()) ? null : date
    }

    function openExternalUrl(url) {
      if (!url) return
      const desktop = window.dshDesktop
      try {
        if (desktop && typeof desktop.openExternal === 'function') {
          desktop.openExternal(url)
          return
        }
        if (desktop && desktop.shell && typeof desktop.shell.openExternal === 'function') {
          desktop.shell.openExternal(url)
          return
        }
      } catch (error) { /* fall through */ }
      window.open(url, '_blank', 'noopener')
    }

    function startOfDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate())
    }

    function deadlineInfo(value, t) {
      const date = parseDateTime(value)
      if (!date) return { tone: 'none', label: '', days: null }
      const now = new Date()
      const diff = Math.round((startOfDay(date) - startOfDay(now)) / 86400000)
      if (diff < 0) return { tone: 'overdue', label: interpolate(t('overdue'), { n: -diff }), days: diff }
      if (diff === 0) {
        if (date.getTime() < now.getTime()) return { tone: 'overdue', label: t('overdueToday'), days: 0 }
        return { tone: 'today', label: t('today'), days: 0 }
      }
      if (diff === 1) return { tone: 'soon', label: t('tomorrow'), days: 1 }
      return { tone: diff <= 3 ? 'soon' : 'later', label: interpolate(t('daysLeft'), { n: diff }), days: diff }
    }

    function urgencyRank(item, t) {
      const info = deadlineInfo(item.deadline, t)
      if (info.tone === 'overdue') return 0
      if (info.tone === 'today') return 1
      if (info.tone === 'soon') return 2
      if (Number(item.subState) === 11) return 3
      return 4
    }

    function sortItems(a, b, t) {
      const rank = urgencyRank(a, t) - urgencyRank(b, t)
      if (rank !== 0) return rank
      const leftDeadline = parseDateTime(a.deadline)
      const rightDeadline = parseDateTime(b.deadline)
      if (leftDeadline && rightDeadline && leftDeadline.getTime() !== rightDeadline.getTime()) {
        return leftDeadline.getTime() - rightDeadline.getTime()
      }
      if (leftDeadline && !rightDeadline) return -1
      if (!leftDeadline && rightDeadline) return 1
      const left = parseDateTime(a.receiveTime)
      const right = parseDateTime(b.receiveTime)
      return (right ? right.getTime() : 0) - (left ? left.getTime() : 0)
    }

    function levelOf(value) {
      const level = Number(value)
      return LEVELS.find(function (entry) { return entry.key === level }) || LEVELS[3]
    }

    function formatTime(value) {
      const date = parseDateTime(value)
      if (!date) return ''
      const pad = function (n) { return String(n).padStart(2, '0') }
      return pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
    }

    function stripHtml(value) {
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

    async function request(path, options) {
      const init = Object.assign({ credentials: 'same-origin' }, options || {})
      if (init.body && !init.headers) init.headers = { 'Content-Type': 'application/json' }
      const response = await fetch(API + path, init)
      let data = null
      try {
        data = await response.json()
      } catch (error) {
        data = null
      }
      if (!response.ok) {
        const message = data && (data.error && (data.error.message || data.error)) ? (data.error.message || data.error) : 'HTTP ' + response.status
        throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
      }
      return data || {}
    }

    // ---------------------------------------------------------------- guest injection

    let assistantSourcePromise = null

    function getAssistantSource() {
      if (!assistantSourcePromise) {
        assistantSourcePromise = fetch(API + '/assistant.js', { credentials: 'same-origin' })
          .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status)
            return response.text()
          })
          .catch(function (error) {
            assistantSourcePromise = null
            throw error
          })
      }
      return assistantSourcePromise
    }

    function deepQueryAll(selector, root) {
      const found = []
      const visit = function (node) {
        if (!node || typeof node.querySelectorAll !== 'function') return
        let list = []
        try { list = node.querySelectorAll(selector) } catch (error) { list = [] }
        for (let i = 0; i < list.length; i += 1) found.push(list[i])
        let all = []
        try { all = node.querySelectorAll('*') } catch (error) { all = [] }
        for (let i = 0; i < all.length; i += 1) {
          if (all[i].shadowRoot) visit(all[i].shadowRoot)
        }
      }
      visit(root || document)
      return found
    }

    function guestUrl(view) {
      try {
        return typeof view.getURL === 'function' ? view.getURL() : ''
      } catch (error) {
        return ''
      }
    }

    function isSameOrigin(a, b) {
      try {
        return Boolean(a) && Boolean(b) && new URL(a).origin === new URL(b).origin
      } catch (error) {
        return false
      }
    }

    function findGuest(url) {
      let views = []
      try {
        views = Array.from(document.querySelectorAll('webview'))
      } catch (error) {
        views = []
      }
      if (!views.length) {
        const walked = deepQueryAll('webview')
        if (walked.length) views = walked
      }
      if (!views.length) return null
      if (!url) return views[views.length - 1]
      let originMatch = null
      let blank = null
      for (let i = 0; i < views.length; i += 1) {
        const current = guestUrl(views[i])
        if (!current || current === 'about:blank') {
          if (!blank) blank = views[i]
          continue
        }
        if (current === url) return views[i]
        if (!originMatch && isSameOrigin(current, url)) originMatch = views[i]
      }
      return originMatch || blank
    }

    async function injectGuest(view, item, config) {
      try {
        const source = await getAssistantSource()
        const payload = {
          version: '1.0.0',
          affairId: item.id || '',
          subject: item.subject || '',
          attitude: config && config.attitude ? config.attitude : '',
          templates: config && config.templates ? config.templates : [],
          fields: config && config.fields ? config.fields : [],
          injectedAt: Date.now(),
        }
        await view.executeJavaScript(
          'window.__SEEYON_TODO_PAYLOAD__=' + JSON.stringify(payload) + ';\n' + source,
          true
        )
        return true
      } catch (error) {
        view.__seeyonInjected = ''
        return false
      }
    }

    function attachGuest(view, item, config, onInjected) {
      view.__seeyonItem = item
      view.__seeyonConfig = config
      if (view.__seeyonAttached !== true) {
        view.__seeyonAttached = true
        const run = function () {
          view.__seeyonInjected = ''
          if (view.__seeyonItem) {
            injectGuest(view, view.__seeyonItem, view.__seeyonConfig).then(function (ok) {
              if (ok && view.__seeyonItem === item) onInjected()
            })
          }
        }
        try {
          view.addEventListener('dom-ready', run)
          view.addEventListener('did-navigate', run)
          view.addEventListener('did-navigate-in-page', run)
        } catch (error) {
          /* older guests may not emit these; the poll below still retries */
        }
      }
      const url = guestUrl(view)
      const key = item.id + '|' + url
      if (view.__seeyonInjected === key) return
      view.__seeyonInjected = key
      injectGuest(view, item, config).then(function (ok) {
        if (ok) onInjected()
      })
    }

    // ---------------------------------------------------------------- icons

    function svg(paths, size) {
      return h('svg', {
        viewBox: '0 0 24 24',
        width: size || 16,
        height: size || 16,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      }, paths.map(function (d, index) { return h('path', { key: index, d: d }) }))
    }

    const I = {
      logo: function (size) { return svg(['M6 3.8h12a1.4 1.4 0 0 1 1.4 1.4v13.6a1.4 1.4 0 0 1-1.4 1.4H6a1.4 1.4 0 0 1-1.4-1.4V5.2A1.4 1.4 0 0 1 6 3.8z', 'M8 8.4h8', 'M8 12h8', 'M8 15.6h4.6'], size) },
      refresh: function (size) { return svg(['M20 12a8 8 0 1 1-2.34-5.66', 'M20 4v5h-5'], size) },
      settings: function (size) { return svg(['M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z', 'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.03 4.14l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z'], size) },
      search: function (size) { return svg(['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-3.5-3.5'], size) },
      close: function (size) { return svg(['M6 6l12 12M18 6L6 18'], size) },
      arrow: function (size) { return svg(['M5 12h14', 'M13 6l6 6-6 6'], size) },
      arrowBack: function (size) { return svg(['M19 12H5', 'M11 18l-6-6 6-6'], size) },
      external: function (size) { return svg(['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'], size) },
      alert: function (size) { return svg(['M12 3l9.5 17H2.5L12 3z', 'M12 9v4', 'M12 17h.01'], size) },
      inbox: function (size) { return svg(['M4 13l2.5-7h11L20 13', 'M4 13v6h16v-6', 'M4 13h4l1.5 2h5L16 13h4'], size) },
      info: function (size) { return svg(['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 11v5', 'M12 8h.01'], size) },
      spark: function (size) { return svg(['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z'], size) },
    }

    // ---------------------------------------------------------------- components

    function TodoCard(props) {
      const item = props.item
      const t = props.t
      const level = levelOf(item.level)
      const deadline = deadlineInfo(item.deadline, t)
      const open = function (event) {
        if (event) event.stopPropagation()
        props.onOpen(item)
      }
      return h('div', {
        className: 'st-card',
        role: 'button',
        tabIndex: 0,
        style: { '--st-level-color': level.color },
        onClick: function () { props.onOpen(item) },
        onKeyDown: function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            props.onOpen(item)
          }
        },
        title: item.subject,
      }, [
        h('div', { className: 'st-bar', key: 'bar' }),
        h('div', { className: 'st-card-main', key: 'main' }, [
          h('div', { className: 'st-card-top', key: 'top' }, [
            h('div', { className: 'st-subject', key: 'subject', style: { flex: '1 1 auto' } }, item.subject || '(无标题)'),
            deadline.tone !== 'none' ? h('span', { className: 'st-badge ' + deadline.tone, key: 'badge' }, deadline.label) : null,
          ]),
          h('div', { className: 'st-meta', key: 'meta' }, [
            h('span', { key: 'sender', title: item.sender }, [h('b', { style: { fontWeight: 600 } }, item.sender || '—')]),
            h('span', { key: 'time' }, formatTime(item.receiveTime) || ''),
            item.template ? h('span', { key: 'tpl' }, item.template) : null,
          ]),
        ]),
        h('div', { className: 'st-card-side', key: 'side' }, [
          h('button', {
            className: 'st-mini',
            type: 'button',
            title: t('detail'),
            onClick: function (event) {
              event.stopPropagation()
              props.onDetail(item)
            },
          }, [I.info(15)]),
          h('button', { className: 'st-open', type: 'button', onClick: open, title: t('open') }, [t('open'), I.arrow(13)]),
        ]),
      ])
    }

    function Section(props) {
      const level = props.level
      return h('section', { className: 'st-section' }, [
        h('h2', { className: 'st-section-head', key: 'head' }, [
          h('span', { className: 'st-dot', style: { background: level.color } }),
          h('span', {}, props.t(level.labelKey)),
          h('span', { className: 'st-count' }, '(' + props.items.length + ')'),
        ]),
        h('div', { className: 'st-list' }, props.items.map(function (item) {
          return h(TodoCard, {
            key: item.id,
            item: item,
            t: props.t,
            onOpen: props.onOpen,
            onDetail: props.onDetail,
          })
        })),
      ])
    }

    function Field(props) {
      return h('div', { className: 'st-field' }, [
        props.label ? h('label', { key: 'label' }, props.label) : null,
        props.children,
        props.hint ? h('div', { className: 'hint', key: 'hint' }, props.hint) : null,
      ])
    }

    function SettingsDrawer(props) {
      const t = props.t
      const config = props.config
      const [form, setForm] = React.useState(function () {
        return {
          gatewayUrl: config.gatewayUrl || '',
          token: '',
          oaOrigin: config.oaOrigin || '',
          attitude: config.attitude || '',
          demo: Boolean(config.demo),
          autoInject: config.autoInject !== false,
          autoLogin: Boolean(config.autoLogin),
          oaUsername: config.oaUsername || '',
          oaPassword: '',
          templates: (config.templates || []).map(function (item) { return { id: item.id, label: item.label, text: item.text } }),
          fields: (config.fields || []).map(function (item) { return { label: item.label, value: item.value } }),
        }
      })
      const [saving, setSaving] = React.useState(false)
      const [testing, setTesting] = React.useState(false)
      const [testResult, setTestResult] = React.useState(null)

      const patch = function (values) {
        setForm(function (previous) { return Object.assign({}, previous, values) })
      }
      const patchTemplate = function (index, key, value) {
        setForm(function (previous) {
          const templates = previous.templates.slice()
          templates[index] = Object.assign({}, templates[index], { [key]: value })
          return Object.assign({}, previous, { templates })
        })
      }
      const patchField = function (index, key, value) {
        setForm(function (previous) {
          const fields = previous.fields.slice()
          fields[index] = Object.assign({}, fields[index], { [key]: value })
          return Object.assign({}, previous, { fields })
        })
      }
      const addTemplate = function () {
        setForm(function (previous) {
          return Object.assign({}, previous, { templates: previous.templates.concat([{ id: 'tpl-' + Date.now(), label: '', text: '' }]) })
        })
      }
      const addField = function () {
        setForm(function (previous) {
          return Object.assign({}, previous, { fields: previous.fields.concat([{ label: '', value: '' }]) })
        })
      }
      const removeTemplate = function (index) {
        setForm(function (previous) {
          return Object.assign({}, previous, { templates: previous.templates.filter(function (_, i) { return i !== index }) })
        })
      }
      const removeField = function (index) {
        setForm(function (previous) {
          return Object.assign({}, previous, { fields: previous.fields.filter(function (_, i) { return i !== index }) })
        })
      }

      const save = async function () {
        setSaving(true)
        try {
          const payload = {
            gatewayUrl: form.gatewayUrl.trim(),
            oaOrigin: form.oaOrigin.trim(),
            attitude: form.attitude.trim(),
            demo: form.demo,
            autoInject: form.autoInject,
            autoLogin: form.autoLogin,
            oaUsername: form.oaUsername.trim(),
            templates: form.templates.filter(function (item) { return item.label.trim() }),
            fields: form.fields.filter(function (item) { return item.label.trim() }),
          }
          if (form.token.trim()) payload.token = form.token.trim()
          if (form.oaPassword) payload.oaPassword = form.oaPassword
          await request('/config', { method: 'POST', body: JSON.stringify({ config: payload }) })
          props.onSaved()
          props.onClose()
          props.onToast(t('toastSaved'))
        } catch (error) {
          props.onToast(error.message || String(error))
        } finally {
          setSaving(false)
        }
      }

      const test = async function () {
        setTesting(true)
        setTestResult(null)
        try {
          const result = await request('/test', { method: 'POST' })
          setTestResult(result)
        } catch (error) {
          setTestResult({ ok: false, error: { message: error.message || String(error) } })
        } finally {
          setTesting(false)
        }
      }

      return h('div', { className: 'st-overlay', onClick: props.onClose }, [
        h('aside', {
          className: 'st-drawer',
          key: 'drawer',
          onClick: function (event) { event.stopPropagation() },
          role: 'dialog',
          'aria-label': t('settingsTitle'),
        }, [
          h('div', { className: 'st-drawer-head', key: 'head' }, [
            h('h3', {}, t('settingsTitle')),
            h('button', { className: 'st-btn st-iconbtn', type: 'button', onClick: props.onClose, title: t('close') }, [I.close(16)]),
          ]),
          h('div', { className: 'st-drawer-body', key: 'body' }, [
            h(Field, { key: 'gateway', label: t('gateway'), hint: t('gatewayHint') }, h('input', {
              className: 'st-input',
              value: form.gatewayUrl,
              onChange: function (event) { patch({ gatewayUrl: event.target.value }) },
              spellCheck: false,
            })),
            h(Field, {
              key: 'token',
              label: t('token'),
              hint: config.hasToken ? interpolate(t('tokenHint'), { hint: config.tokenHint || '----' }) : t('tokenMissing'),
            }, h('input', {
              className: 'st-input',
              type: 'password',
              value: form.token,
              placeholder: t('tokenPlaceholder'),
              autoComplete: 'off',
              onChange: function (event) { patch({ token: event.target.value }) },
            })),
            h(Field, { key: 'origin', label: t('oaOrigin'), hint: t('oaOriginHint') }, h('input', {
              className: 'st-input',
              value: form.oaOrigin,
              onChange: function (event) { patch({ oaOrigin: event.target.value }) },
              spellCheck: false,
            })),
            h('div', { className: 'st-field', key: 'oalogin' }, [
              h('label', {}, t('oaLoginTitle')),
              h('div', { className: 'st-row2', style: { marginTop: '6px' } }, [
                h('input', {
                  className: 'st-input',
                  value: form.oaUsername,
                  placeholder: t('oaUsername'),
                  autoComplete: 'off',
                  onChange: function (event) { patch({ oaUsername: event.target.value }) },
                }),
                h('input', {
                  className: 'st-input',
                  type: 'password',
                  value: form.oaPassword,
                  placeholder: config.hasPassword ? t('oaPasswordSaved') : t('oaPassword'),
                  autoComplete: 'off',
                  onChange: function (event) { patch({ oaPassword: event.target.value }) },
                }),
              ]),
              h('label', { className: 'st-switch', style: { marginTop: '9px' } }, [
                h('input', { type: 'checkbox', checked: form.autoLogin, onChange: function (event) { patch({ autoLogin: event.target.checked }) } }),
                h('span', {}, t('autoLogin')),
              ]),
              h('div', { className: 'hint' }, t('oaLoginHint')),
            ]),

            h('div', { className: 'st-row2', key: 'attitude' }, [
              h(Field, { key: 'a', label: t('attitude'), hint: t('attitudeHint') }, h('input', {
                className: 'st-input',
                value: form.attitude,
                onChange: function (event) { patch({ attitude: event.target.value }) },
              })),
            ]),
            h('div', { key: 'switches', style: { display: 'flex', flexDirection: 'column', gap: '9px' } }, [
              h('label', { className: 'st-switch', key: 'demo' }, [
                h('input', { type: 'checkbox', checked: form.demo, onChange: function (event) { patch({ demo: event.target.checked }) } }),
                h('span', {}, t('demo')),
              ]),
              h('label', { className: 'st-switch', key: 'inject' }, [
                h('input', { type: 'checkbox', checked: form.autoInject, onChange: function (event) { patch({ autoInject: event.target.checked }) } }),
                h('span', {}, t('autoInject')),
              ]),
            ]),
            h('div', { className: 'st-field', key: 'templates' }, [
              h('label', {}, t('templatesTitle')),
              h('div', { className: 'hint' }, t('templatesHint')),
              h('div', { className: 'st-editor', style: { marginTop: '8px' } }, form.templates.map(function (item, index) {
                return h('div', { className: 'st-editor-row', key: 'tpl-' + index }, [
                  h('div', { className: 'grow' }, [
                    h('input', { value: item.label, placeholder: t('templateLabel'), onChange: function (event) { patchTemplate(index, 'label', event.target.value) } }),
                    h('textarea', { value: item.text, placeholder: t('templateText'), rows: 2, onChange: function (event) { patchTemplate(index, 'text', event.target.value) } }),
                  ]),
                  h('button', { className: 'del', type: 'button', title: t('close'), onClick: function () { removeTemplate(index) } }, [I.close(14)]),
                ])
              })),
              h('button', { className: 'st-btn', type: 'button', onClick: addTemplate }, t('addTemplate')),
            ]),
            h('div', { className: 'st-field', key: 'fields' }, [
              h('label', {}, t('fieldsTitle')),
              h('div', { className: 'hint' }, t('fieldsHint')),
              h('div', { className: 'st-editor', style: { marginTop: '8px' } }, form.fields.map(function (item, index) {
                return h('div', { className: 'st-editor-row', key: 'field-' + index }, [
                  h('div', { className: 'grow' }, [
                    h('input', { value: item.label, placeholder: t('fieldLabel'), onChange: function (event) { patchField(index, 'label', event.target.value) } }),
                    h('input', { value: item.value, placeholder: t('fieldValue'), onChange: function (event) { patchField(index, 'value', event.target.value) } }),
                  ]),
                  h('button', { className: 'del', type: 'button', title: t('close'), onClick: function () { removeField(index) } }, [I.close(14)]),
                ])
              })),
              h('button', { className: 'st-btn', type: 'button', onClick: addField }, t('addField')),
            ]),
            testResult ? h('div', {
              key: 'test-result',
              className: 'st-test ' + (testResult.ok ? 'ok' : 'bad'),
            }, (testResult.ok ? t('testOk') : t('testFail')) + '：' + (testResult.ok
              ? (testResult.message || '')
              : ((testResult.error && (testResult.error.message || testResult.error)) || '') + (testResult.error && testResult.error.hint ? '\n' + testResult.error.hint : ''))) : null,
          ]),
          h('div', { className: 'st-drawer-foot', key: 'foot' }, [
            h('button', { className: 'st-btn', type: 'button', onClick: test, disabled: testing }, testing ? t('testing') : t('test')),
            h('button', { className: 'st-btn primary', type: 'button', onClick: save, disabled: saving }, saving ? t('saving') : t('save')),
          ]),
        ]),
      ])
    }

    function DetailDrawer(props) {
      const t = props.t
      const item = props.item
      const [state, setState] = React.useState({ loading: true, detail: null, error: null })
      React.useEffect(function () {
        let alive = true
        request('/detail?id=' + encodeURIComponent(item.id))
          .then(function (data) {
            if (!alive) return
            setState({ loading: false, detail: data.detail, error: data.ok ? null : (data.error && (data.error.message || data.error)) })
          })
          .catch(function (error) {
            if (alive) setState({ loading: false, detail: null, error: error.message || String(error) })
          })
        return function () { alive = false }
      }, [item.id])

      const detail = state.detail
      return h('div', { className: 'st-overlay', onClick: props.onClose }, [
        h('aside', {
          className: 'st-drawer',
          key: 'drawer',
          onClick: function (event) { event.stopPropagation() },
          role: 'dialog',
          'aria-label': t('detail'),
        }, [
          h('div', { className: 'st-drawer-head', key: 'head' }, [
            h('h3', {}, t('detail')),
            h('button', { className: 'st-btn st-iconbtn', type: 'button', onClick: props.onClose, title: t('close') }, [I.close(16)]),
          ]),
          h('div', { className: 'st-drawer-body', key: 'body' }, [
            h('p', { className: 'st-detail-sub' }, item.subject || '(无标题)'),
            state.loading ? h('div', { className: 'st-skel' }, [h('div', { className: 'st-skel-row', style: { height: '90px' } })]) : null,
            state.error ? h('div', { className: 'st-banner error' }, [h('div', { className: 'st-banner-body' }, String(state.error))]) : null,
            detail ? h('dl', { className: 'st-kv' }, [
              h('dt', { key: 'sender' }, t('sender')), h('dd', { key: 'sender-v' }, detail.sender || '—'),
              h('dt', { key: 'received' }, t('received')), h('dd', { key: 'received-v' }, detail.receiveTime || '—'),
              h('dt', { key: 'deadline' }, t('deadline')), h('dd', { key: 'deadline-v' }, detail.deadline || '—'),
              h('dt', { key: 'node' }, t('node')), h('dd', { key: 'node-v' }, detail.node || '—'),
              h('dt', { key: 'tpl' }, t('template')), h('dd', { key: 'tpl-v' }, detail.template || '—'),
              h('dt', { key: 'op' }, t('opinionRequired')), h('dd', { key: 'op-v' }, detail.opinionRequired ? t('yes') : t('no')),
            ]) : null,
            detail && detail.availableActions && detail.availableActions.length ? h('div', { className: 'st-field' }, [
              h('label', {}, t('actions')),
              h('div', { className: 'st-chips' }, detail.availableActions.map(function (action, index) {
                return h('span', { className: 'st-tag', key: index }, action)
              })),
            ]) : null,
            detail && detail.content ? h('div', { className: 'st-field' }, [
              h('label', {}, '正文'),
              h('div', { className: 'st-content' }, stripHtml(detail.content)),
            ]) : null,
            detail && detail.attachmentList && detail.attachmentList.length ? h('div', { className: 'st-field' }, [
              h('label', {}, t('attachments')),
              h('div', { className: 'st-chips' }, detail.attachmentList.map(function (file, index) {
                return h('span', { className: 'st-tag', key: index }, (file.name || '附件') + (file.size ? ' · ' + Math.round(file.size / 1024) + ' KB' : ''))
              })),
            ]) : null,
          ]),
          h('div', { className: 'st-drawer-foot', key: 'foot' }, [
            h('button', { className: 'st-btn primary', type: 'button', onClick: function () { props.onOpen(item) } }, t('open')),
          ]),
        ]),
      ])
    }

    // ---------------------------------------------------------------- embedded form

    function EmbeddedForm(props) {
      const { item, config, t, notify, onBack, onOpenSidebar, fillToken } = props
      const hostRef = React.useRef(null)
      const guestRef = React.useRef({ view: null, lease: '', bridge: null })
      const injectRef = React.useRef(null)
      const [phase, setPhase] = React.useState('loading')
      const [failure, setFailure] = React.useState('')
      const [liveUrl, setLiveUrl] = React.useState('')
      const [stuck, setStuck] = React.useState(false)
      const [needLogin, setNeedLogin] = React.useState(false)
      const [generation, setGeneration] = React.useState(0)
      const formLoadedRef = React.useRef(false)
      const autoTriedRef = React.useRef(false)
      const directRef = React.useRef(false)
      const directLoadRef = React.useRef(false)
      const autoJoinRef = React.useRef(false)
      const probeStartedRef = React.useRef(false)
      const itemRef = React.useRef(item.id)

      const postDebug = React.useCallback(function (event, data) {
        try {
          void fetch('/seeyon-todo/api/log', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: event, data: data || {} }),
          }).catch(function () {})
        } catch (error) {
          /* diagnostics must never break the form */
        }
      }, [])

      const buildPayload = React.useCallback(function () {
        return {
          version: '1.0.0',
          affairId: item.id || '',
          subject: item.subject || '',
          attitude: config && config.attitude ? config.attitude : '',
          templates: config && config.templates ? config.templates : [],
          fields: config && config.fields ? config.fields : [],
          injectedAt: Date.now(),
        }
      }, [item.id, item.subject, config])

      const injectNow = React.useCallback(async function (view) {
        try {
          const source = await getAssistantSource()
          const payload = buildPayload()
          await view.executeJavaScript('window.__SEEYON_TODO_PAYLOAD__=' + JSON.stringify(payload) + ';\n' + source, true)
          postDebug('inject-ok', { affairId: item.id })
          return true
        } catch (error) {
          postDebug('inject-error', { message: error && error.message ? error.message : String(error) })
          return false
        }
      }, [buildPayload, postDebug, item.id])
      injectRef.current = injectNow

      React.useEffect(function () {
        let cancelled = false
        const host = hostRef.current
        const bridge = window.dshDesktop && window.dshDesktop.protocolVersion === 1 ? window.dshDesktop.browser : null
        postDebug('open-start', {
          id: item.id,
          url: item.url,
          bridge: Boolean(bridge),
          hasAcquire: Boolean(bridge && typeof bridge.acquire === 'function'),
        })
        if (!host) return undefined
        if (!bridge || typeof bridge.acquire !== 'function') {
          postDebug('no-bridge', {})
          setPhase('iframe')
          return undefined
        }
        setPhase('loading')
        setFailure('')
        setStuck(false)
        setLiveUrl('')
        if (itemRef.current !== item.id) {
          itemRef.current = item.id
          directRef.current = false
        }
        setNeedLogin(false)
        formLoadedRef.current = directRef.current
        autoTriedRef.current = false
        directLoadRef.current = false
        probeStartedRef.current = false
        autoJoinRef.current = false
        ;(async function () {
          try {
            const reservation = await bridge.acquire('seeyon-todo')
            if (cancelled) {
              try { await bridge.release(reservation.lease) } catch (error) { /* ignore */ }
              return
            }
            postDebug('lease', { lease: reservation.lease, partition: reservation.partition })
            const view = document.createElement('webview')
            view.setAttribute('name', reservation.lease)
            view.setAttribute('partition', reservation.partition)
            view.setAttribute('allowpopups', '')
            view.setAttribute('src', 'about:blank#' + reservation.lease)
            view.setAttribute('data-sidebar-browser-frame', 'webview')
            view.style.width = '100%'
            view.style.height = '100%'
            view.style.border = '0'
            guestRef.current = { view, lease: reservation.lease, bridge, loadTimer: null }
            const safeUrl = function () {
              try { return typeof view.getURL === 'function' ? view.getURL() : '' } catch (error) { return '' }
            }
            const probeUrl = (function () {
              try { return new URL('/seeyon/main.do', item.url).href } catch (error) { return item.url }
            })()
            const loginUrl = (function () {
              try { return new URL('/seeyon/index.jsp', item.url).href } catch (error) { return item.url }
            })()
            const openForm = function (attempt) {
              const tries = typeof attempt === 'number' ? attempt : 0
              postDebug('load-form', { url: item.url, attempt: tries })
              view.loadURL(item.url).catch(function (error) {
                const message = error && error.message ? error.message : String(error)
                postDebug('load-error', { message, attempt: tries })
                if (/ERR_ABORTED|-3/i.test(message)) {
                  if (directRef.current) {
                    setFailure(message)
                    return
                  }
                  if (tries < 1 && !cancelled) {
                    guestRef.current.formTimer = setTimeout(function () {
                      if (!cancelled) openForm(tries + 1)
                    }, 900)
                    return
                  }
                  directRef.current = true
                  postDebug('recreate-guest', {})
                  setGeneration(function (value) { return value + 1 })
                  return
                }
                setFailure(message)
              })
            }
            const autoLogin = async function () {
              if (!config || !config.autoLogin || !config.oaUsername || !config.hasPassword) return false
              if (autoTriedRef.current) return false
              autoTriedRef.current = true
              let credentials = null
              try {
                credentials = await request('/login')
              } catch (error) {
                credentials = null
              }
              if (!credentials || !credentials.ok || !credentials.username || !credentials.password) {
                postDebug('auto-login', { result: 'no-credentials' })
                return false
              }
              const script = '(function(){try{'
                + 'var u=document.querySelector("#login_username");'
                + 'var p=document.querySelector("#login_password1");'
                + 'if(!u||!p) return "no-form";'
                + 'var verify=document.querySelector("#VerifyCode");'
                + 'if(verify && verify.offsetParent) return "captcha";'
                + 'var privacy=document.querySelector("#privacyCheck");'
                + 'if(privacy && !privacy.checked) privacy.click();'
                + 'u.value=' + JSON.stringify(String(credentials.username)) + ';'
                + 'p.value=' + JSON.stringify(String(credentials.password)) + ';'
                + 'try{u.dispatchEvent(new Event("input",{bubbles:true}));p.dispatchEvent(new Event("input",{bubbles:true}));}catch(e){}'
                + 'var btn=document.querySelector("#login_button");'
                + 'if(!btn) return "no-button";'
                + 'btn.click();'
                + 'return "clicked";'
                + '}catch(e){return "error:"+e.message}})()'
              let result = ''
              try {
                result = await view.executeJavaScript(script, true)
              } catch (error) {
                result = 'exec-error'
              }
              postDebug('auto-login', { result: String(result) })
              return result === 'clicked'
            }
            const checkSession = async function () {
              if (cancelled) return
              let href = ''
              let hasLoginForm = false
              try { href = await view.executeJavaScript('String(location.href)', true) } catch (error) { href = '' }
              try { hasLoginForm = await view.executeJavaScript("Boolean(document.querySelector('#login_username'))", true) } catch (error) { hasLoginForm = false }
              if (!/^https?:/i.test(href)) return
              const onLogin = hasLoginForm || /\/seeyon\/index\.jsp/i.test(href) || /method=login/i.test(href)
              if (onLogin) {
                setNeedLogin(true)
                postDebug('session-login', { href })
                void autoLogin()
                return
              }
              setNeedLogin(false)
              if (!formLoadedRef.current) {
                formLoadedRef.current = true
                postDebug('session-ok', { href })
                guestRef.current.formTimer = setTimeout(function () {
                  if (!cancelled) openForm(0)
                }, 700)
              }
            }
            guestRef.current.checkSession = checkSession
            guestRef.current.loginUrl = loginUrl
            view.addEventListener('dom-ready', function () {
              setPhase('ready')
              const current = safeUrl()
              postDebug('dom-ready', { url: current })
              setLiveUrl(current)
              if (directRef.current) {
                formLoadedRef.current = true
                if (directLoadRef.current) return
                directLoadRef.current = true
                guestRef.current.loadTimer = setTimeout(function () {
                  if (cancelled) return
                  postDebug('load-form', { url: item.url, attempt: 'direct' })
                  view.loadURL(item.url).catch(function (error) {
                    const message = error && error.message ? error.message : String(error)
                    postDebug('load-error', { message, attempt: 'direct' })
                    setFailure(message)
                  })
                }, 80)
                return
              }
              if (!current || /^about:blank/i.test(current)) {
                if (probeStartedRef.current) return
                probeStartedRef.current = true
                guestRef.current.loadTimer = setTimeout(function () {
                  if (cancelled) return
                  postDebug('load-probe', { url: probeUrl })
                  view.loadURL(probeUrl).catch(function (error) {
                    const message = error && error.message ? error.message : String(error)
                    postDebug('probe-error', { message })
                    if (!/ERR_ABORTED/i.test(message)) setFailure(message)
                  })
                }, 80)
                guestRef.current.loginTimer = setInterval(function () {
                  if (cancelled || formLoadedRef.current) return
                  const current = safeUrl()
                  if (!current || current === 'about:blank') return
                  void checkSession()
                }, 2500)
              }
            })
            view.addEventListener('did-finish-load', function () {
              setLiveUrl(safeUrl())
              setStuck(false)
              postDebug('did-finish-load', { url: safeUrl() })
              void checkSession()
              void injectRef.current(view)
              if (item.autoJoin && !autoJoinRef.current && /meeting\.do|meetingDetail/i.test(safeUrl())) {
                autoJoinRef.current = true
                const extractScript = '(function(){try{var texts=[document.body?document.body.innerText:""];var fr=document.querySelectorAll("iframe");for(var i=0;i<fr.length;i++){try{texts.push(fr[i].contentDocument.body.innerText)}catch(e){}}var text=texts.join("\\n");var m=text.match(/(?:会议室号|会议号)[：:]?\\s*(\\d{5,})/);var p=text.match(/密码[：:]?\\s*(\\d{3,})/);var link="";var anchors=[].slice.call(document.querySelectorAll("a"));for(var i=0;i<anchors.length;i++){var h=anchors[i].href||"";if(/meeting\\.tencent\\.com|wemeet|tencentmeeting/i.test(h)){link=h;break}}if(!link){var html=document.documentElement.innerHTML;var mm=html.match(/https:\\/\\/meeting\\.tencent\\.com\\/dm\\/[A-Za-z0-9]+/);if(mm)link=mm[0]}return JSON.stringify({number:m?m[1]:"",password:p?p[1]:"",link:link,text:text.slice(0,1500)})}catch(e){return ""}})()'
                const tryExtract = function (attempt) {
                  view.executeJavaScript(extractScript, true).then(function (raw) {
                    let info = {}
                    try { info = JSON.parse(raw) } catch (error) { info = {} }
                    postDebug('meeting-extract', { attempt: attempt, number: info.number, link: info.link, text: info.text })
                    if ((info.number || info.link) && item.meetingId) {
                      try {
                        void fetch('/seeyon-todo/api/meeting-info', {
                          method: 'POST',
                          credentials: 'same-origin',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ meetingId: item.meetingId, number: info.number, joinUrl: info.link }),
                        })
                      } catch (error) { /* ignore */ }
                    }
                    const joinScript = '(function(){try{var all=[].slice.call(document.querySelectorAll("a,button,span"));var hit=all.filter(function(n){var t=(n.textContent||"").replace(/\\s+/g,"");return t==="一键入会"||t==="入会"||t.indexOf("视频入会")>=0});if(!hit.length)return "not-found";var el=hit[0];if(el.tagName==="SPAN"){var p=el.closest("a,button")||el.parentElement;if(p)el=p;}el.click();return "clicked"}catch(e){return "error"}})()'
                    view.executeJavaScript(joinScript, true).then(function (result) {
                      postDebug('meeting-join', { result: String(result) })
                    }).catch(function () { /* ignore */ })
                  }).catch(function () {
                    if (attempt < 3) setTimeout(function () { tryExtract(attempt + 1) }, 1500)
                  })
                }
                setTimeout(function () { tryExtract(0) }, 1200)
              }
            })
            view.addEventListener('did-navigate', function () {
              setLiveUrl(safeUrl())
              postDebug('did-navigate', { url: safeUrl() })
              void checkSession()
              void injectRef.current(view)
            })
            view.addEventListener('did-navigate-in-page', function () { setLiveUrl(safeUrl()) })
            view.addEventListener('did-fail-load', function (event) {
              if (event && event.isMainFrame && event.errorCode !== -3) {
                postDebug('did-fail-load', { code: event.errorCode, description: event.errorDescription })
                setFailure((event.errorDescription || 'load failed') + ' (' + event.errorCode + ')')
              }
            })
            view.addEventListener('destroyed', function () {
              postDebug('guest-destroyed', {})
              if (!cancelled) {
                setPhase('iframe')
                setFailure('内嵌浏览器进程被关闭')
              }
            })
            host.appendChild(view)
          } catch (error) {
            const message = error && error.message ? error.message : String(error)
            postDebug('lease-error', { message })
            if (!cancelled) {
              setPhase('iframe')
              setFailure(message)
            }
          }
        })()
        return function () {
          cancelled = true
          const guest = guestRef.current
          guestRef.current = { view: null, lease: '', bridge: null }
          if (guest.loadTimer) clearTimeout(guest.loadTimer)
          if (guest.loginTimer) clearInterval(guest.loginTimer)
          if (guest.formTimer) clearTimeout(guest.formTimer)
          postDebug('close', {})
          if (guest.view) {
            try { guest.view.remove() } catch (error) { /* ignore */ }
          }
          if (guest.lease && guest.bridge) {
            try { void guest.bridge.release(guest.lease) } catch (error) { /* ignore */ }
          }
        }
      }, [item.id, item.url, generation])

      React.useEffect(function () {
        if (phase !== 'ready') return undefined
        const timer = setInterval(function () {
          const view = guestRef.current.view
          if (!view) return
          try { setLiveUrl(view.getURL() || '') } catch (error) { /* ignore */ }
        }, 1200)
        return function () { clearInterval(timer) }
      }, [phase])

      React.useEffect(function () {
        if (phase !== 'loading') return undefined
        const timer = setTimeout(function () { setStuck(true) }, 8000)
        return function () { clearTimeout(timer) }
      }, [phase])

      React.useEffect(function () {
        if (!fillToken) return
        const view = guestRef.current.view
        if (!view) return
        try { view.reload() } catch (error) { /* ignore */ }
      }, [fillToken])

      const reload = function () {
        const view = guestRef.current.view
        if (view) {
          try { view.reload() } catch (error) { /* ignore */ }
        }
      }

      const reInject = async function () {
        const view = guestRef.current.view
        if (!view) {
          notify(t('toastNoGuest'))
          return
        }
        const ok = await injectNow(view)
        notify(ok ? t('toastAssistantReady') : t('toastNoGuest'))
      }

      return h('div', { className: 'st-form', key: 'form' }, [
        h('div', { className: 'st-form-bar', key: 'bar' }, [
          h('button', { className: 'st-btn', type: 'button', onClick: onBack, key: 'back' }, [I.arrowBack(15), t('backToList')]),
          h('div', { className: 'st-form-title', key: 'title', title: item.subject }, item.subject || ''),
          h('div', { className: 'st-form-actions', key: 'actions' }, [
            phase === 'ready' ? h('button', { className: 'st-btn st-iconbtn', type: 'button', title: t('reload'), onClick: reload }, [I.refresh(15)]) : null,
            needLogin ? h('button', {
              className: 'st-btn primary',
              type: 'button',
              onClick: function () {
                const view = guestRef.current.view
                const url = guestRef.current.loginUrl
                formLoadedRef.current = false
                autoTriedRef.current = false
                if (view && url) {
                  try { view.loadURL(url) } catch (error) { /* ignore */ }
                }
              },
            }, t('loginNow')) : null,
            h('button', {
              className: 'st-btn',
              type: 'button',
              title: t('openFormAgain'),
              onClick: function () {
                const view = guestRef.current.view
                if (!view) return
                formLoadedRef.current = true
                setNeedLogin(false)
                try { view.loadURL(item.url) } catch (error) { /* ignore */ }
              },
            }, t('openFormAgain')),
            h('button', { className: 'st-btn st-iconbtn', type: 'button', title: t('injectNow'), onClick: reInject }, [I.spark(15)]),
            h('button', { className: 'st-btn', type: 'button', title: t('openSidebar'), onClick: onOpenSidebar }, [I.external(14), t('openSidebar')]),
          ]),
        ]),
        h('div', { className: 'st-form-body', key: 'body' }, [
          h('div', { className: 'st-form-stage', key: 'stage' }, [
            phase === 'loading' ? h('div', { className: 'st-form-loading', key: 'loading' }, [stuck ? t('formStuck') : t('formLoading')]) : null,
            phase === 'iframe' ? h('iframe', {
              key: 'iframe',
              className: 'st-form-frame',
              src: item.url,
              title: item.subject || 'form',
              sandbox: 'allow-scripts allow-forms allow-same-origin allow-popups allow-downloads',
            }) : null,
            h('div', { className: 'st-form-host', key: 'host', ref: hostRef }),
            phase === 'iframe' ? h('div', { className: 'st-form-note', key: 'note' }, t('iframeFallback')) : null,
            needLogin ? h('div', { className: 'st-form-login', key: 'login' }, t('loginRequired')) : null,
            failure ? h('div', { className: 'st-form-error', key: 'error' }, failure) : null,
          ]),
          h('div', { className: 'st-form-status', key: 'status' }, [
            h('span', { className: 'st-form-dot', key: 'dot', 'data-phase': phase }),
            h('span', { className: 'st-form-url', key: 'url', title: liveUrl }, liveUrl || (phase === 'iframe' ? 'iframe fallback' : 'about:blank')),
            failure ? h('span', { className: 'st-form-fail', key: 'fail', title: failure }, failure) : null,
          ]),
        ]),
      ])
    }

    function WeeklyAssistant(props) {
      const { t, notify } = props
      const [open, setOpen] = React.useState(true)
      const [busy, setBusy] = React.useState(false)
      const [preview, setPreview] = React.useState(null)
      const [error, setError] = React.useState('')
      const [copied, setCopied] = React.useState('')

      const generate = async function () {
        if (busy) return
        setBusy(true)
        setError('')
        try {
          const result = await request('/weekly/preview', { method: 'POST' })
          if (!result || !result.ok) throw new Error(result && result.error ? (result.error.message || String(result.error)) : t('weeklyNoRows'))
          setPreview(result)
        } catch (err) {
          setError(err && err.message ? err.message : String(err))
        } finally {
          setBusy(false)
        }
      }

      const copyText = async function (text, label) {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
          } else {
            const area = document.createElement('textarea')
            area.value = text
            area.style.position = 'fixed'
            area.style.opacity = '0'
            document.body.appendChild(area)
            area.select()
            document.execCommand('copy')
            area.remove()
          }
          setCopied(label)
          setTimeout(function () { setCopied('') }, 1600)
        } catch (err) {
          notify(t('copyFailed'))
        }
      }

      const rowText = function (row) {
        return row.project + '（' + t('weeklyWeight') + ' ' + row.weight + '%）\n' + String((row.contents || []).join('\n'))
      }
      const planText = function (rows) {
        return (rows || []).map(rowText).join('\n\n')
      }
      const copyButton = function (text, label, key) {
        return h('button', {
          className: 'st-weekly-copy',
          type: 'button',
          key: key,
          onClick: function () { void copyText(text, label) },
        }, copied === label ? t('copied') : t('copy'))
      }

      return h('div', { className: 'st-weekly' }, [
        h('button', { className: 'st-weekly-fab', type: 'button', key: 'fab', onClick: function () { setOpen(function (value) { return !value }) } }, [I.spark(14), t('weeklyAssistant')]),
        open ? h('div', { className: 'st-weekly-panel', key: 'panel' }, [
          h('div', { className: 'st-weekly-head', key: 'head' }, [
            h('span', {}, t('weeklyAssistant')),
            h('button', { className: 'st-weekly-close', type: 'button', onClick: function () { setOpen(false) }, title: t('close') }, [I.close(14)]),
          ]),
          h('div', { className: 'st-weekly-hint', key: 'hint' }, t('weeklyHint')),
          h('div', { className: 'st-weekly-actions', key: 'actions' }, [
            h('button', { className: 'st-btn primary', type: 'button', onClick: generate, disabled: busy, key: 'gen' }, busy ? t('weeklyGenerating') : t('weeklyGenerate')),
          ]),
          error ? h('div', { className: 'st-weekly-error', key: 'error' }, error) : null,
          preview ? h('div', { className: 'st-weekly-body', key: 'body' }, [
            preview.summary ? h('section', { className: 'st-weekly-section', key: 'summary' }, [
              h('div', { className: 'st-weekly-sec-head', key: 'head' }, [
                h('span', {}, t('weeklySummary')),
                copyButton(preview.summary, 'summary', 'copy-summary'),
              ]),
              h('div', { className: 'st-weekly-summary', key: 'text' }, preview.summary),
            ]) : null,
            preview.rows && preview.rows.length ? h('section', { className: 'st-weekly-section', key: 'plan' }, [
              h('div', { className: 'st-weekly-sec-head', key: 'head' }, [
                h('span', {}, t('weeklyPlan')),
                copyButton(planText(preview.rows), 'all', 'copy-all'),
              ]),
              h('div', { className: 'st-weekly-list', key: 'list' }, preview.rows.map(function (row, index) {
                return h('div', { className: 'st-weekly-row', key: 'row-' + index }, [
                  h('div', { className: 'st-weekly-rowhead' }, [
                    h('b', {}, row.project),
                    h('span', {}, t('weeklyWeight') + ' ' + row.weight + '%'),
                  ]),
                  h('div', { className: 'st-weekly-desc' }, String((row.contents || []).join('\n'))),
                  h('div', { className: 'st-weekly-rowfoot', key: 'foot' }, [
                    copyButton(rowText(row), 'row-' + index, 'copy-row-' + index),
                  ]),
                ])
              })),
            ]) : null,
          ]) : null,
        ]) : null,
      ])
    }

    // ---------------------------------------------------------------- app

    function ReportAssistant(props) {
      const { t, notify } = props
      const [open, setOpen] = React.useState(true)
      const [busy, setBusy] = React.useState(false)
      const [data, setData] = React.useState(null)
      const [error, setError] = React.useState('')
      const [copied, setCopied] = React.useState('')

      const generate = async function () {
        if (busy) return
        setBusy(true)
        setError('')
        try {
          const result = await request('/report/preview', { method: 'POST' })
          if (!result || !result.ok) throw new Error(result && result.error ? (result.error.message || String(result.error)) : t('reportFailed'))
          setData(result)
        } catch (err) {
          setError(err && err.message ? err.message : String(err))
        } finally {
          setBusy(false)
        }
      }

      const copyText = async function (text, label) {
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text)
          } else {
            const area = document.createElement('textarea')
            area.value = text
            area.style.position = 'fixed'
            area.style.opacity = '0'
            document.body.appendChild(area)
            area.select()
            document.execCommand('copy')
            area.remove()
          }
          setCopied(label)
          setTimeout(function () { setCopied('') }, 1600)
        } catch (err) {
          notify(t('copyFailed'))
        }
      }

      const copyButton = function (text, label, key) {
        return h('button', {
          className: 'st-weekly-copy',
          type: 'button',
          key: key,
          onClick: function () { void copyText(text, label) },
        }, copied === label ? t('copied') : t('copy'))
      }

      return h('div', { className: 'st-weekly' }, [
        h('button', { className: 'st-weekly-fab', type: 'button', key: 'fab', onClick: function () { setOpen(function (value) { return !value }) } }, [I.spark(14), t('reportAssistant')]),
        open ? h('div', { className: 'st-weekly-panel', key: 'panel' }, [
          h('div', { className: 'st-weekly-head', key: 'head' }, [
            h('span', {}, t('reportAssistant')),
            h('button', { className: 'st-weekly-close', type: 'button', onClick: function () { setOpen(false) }, title: t('close') }, [I.close(14)]),
          ]),
          h('div', { className: 'st-weekly-hint', key: 'hint' }, t('reportHint')),
          h('div', { className: 'st-weekly-actions', key: 'actions' }, [
            h('button', { className: 'st-btn primary', type: 'button', onClick: generate, disabled: busy }, busy ? t('reportGenerating') : t('reportGenerate')),
          ]),
          error ? h('div', { className: 'st-weekly-error', key: 'error' }, error) : null,
          data ? h('div', { className: 'st-weekly-body', key: 'body' }, (data.sections || []).map(function (section, index) {
            return h('section', { className: 'st-weekly-section', key: 'sec-' + index }, [
              h('div', { className: 'st-weekly-sec-head', key: 'head' }, [
                h('span', {}, section.title),
                copyButton(section.text, 'sec-' + index, 'copy-' + index),
              ]),
              h('div', { className: 'st-weekly-summary', key: 'text' }, section.text),
            ])
          })) : null,
        ]) : null,
      ])
    }

    function App(props) {
      const t = props.t
      const ctx = props.ctx
      const [boot, setBoot] = React.useState(null)
      const [items, setItems] = React.useState([])
      const [loading, setLoading] = React.useState(true)
      const [refreshing, setRefreshing] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [query, setQuery] = React.useState('')
      const [filter, setFilter] = React.useState('all')
      const [settingsOpen, setSettingsOpen] = React.useState(false)
      const [formItem, setFormItem] = React.useState(null)
      const [weeklyBusy, setWeeklyBusy] = React.useState(false)
      const [pickerOpen, setPickerOpen] = React.useState(false)
      const [templates, setTemplates] = React.useState([])
      const [templateQuery, setTemplateQuery] = React.useState('')
      const [templateBusy, setTemplateBusy] = React.useState(false)
      const [fillToken, setFillToken] = React.useState(0)
      const [formNonce, setFormNonce] = React.useState(0)
      const [meetingsOpen, setMeetingsOpen] = React.useState(false)
      const [tab, setTab] = React.useState('todos')
      const [meetings, setMeetings] = React.useState([])
      const [meetingsBusy, setMeetingsBusy] = React.useState(false)
      const [meetingBusy, setMeetingBusy] = React.useState('')
      const [detailItem, setDetailItem] = React.useState(null)
      const [toast, setToast] = React.useState('')
      const toastTimer = React.useRef(null)
      const watchToken = React.useRef(0)
      const lastItem = React.useRef(null)
      const injectedNotice = React.useRef('')

      const notify = React.useCallback(function (message) {
        setToast(message)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(function () { setToast('') }, 3200)
      }, [])

      const openWeekly = async function () {
        if (weeklyBusy) return
        setWeeklyBusy(true)
        try {
          notify(t('weeklyPreparing'))
          const result = await request('/weekly', { method: 'POST' })
          if (!result || !result.ok || !result.url) {
            const message = result && result.error ? (result.error.message || String(result.error)) : '生成周计划草稿失败'
            throw new Error(message)
          }
          setFormItem({ id: 'weekly-draft-' + Date.now(), subject: result.title || t('weeklyTitle'), url: result.url, weekly: true })
          notify(t('weeklyReady'))
        } catch (error) {
          notify(error && error.message ? error.message : String(error))
        } finally {
          setWeeklyBusy(false)
        }
      }

      const openTemplates = async function () {
        setPickerOpen(true)
        if (templates.length || templateBusy) return
        setTemplateBusy(true)
        try {
          const result = await request('/templates')
          if (result && result.ok) setTemplates(Array.isArray(result.items) ? result.items : [])
        } catch (error) {
          notify(error && error.message ? error.message : String(error))
        } finally {
          setTemplateBusy(false)
        }
      }

      const pickTemplate = async function (tpl) {
        if (!tpl || templateBusy) return
        setTemplateBusy(true)
        try {
          const result = await request('/draft', { method: 'POST', body: JSON.stringify({ templateId: tpl.id, templateName: tpl.name }) })
          if (!result || !result.ok || !result.url) {
            throw new Error(result && result.error ? (result.error.message || String(result.error)) : t('templateFailed'))
          }
          setFormItem({
            id: 'draft-' + result.masterId,
            subject: tpl.name,
            url: result.url,
            draft: { masterId: result.masterId, templateId: String(tpl.id), templateName: tpl.name },
          })
          setPickerOpen(false)
          setTemplateQuery('')
        } catch (error) {
          notify(error && error.message ? error.message : String(error))
        } finally {
          setTemplateBusy(false)
        }
      }

      const openHome = function () {
        const origin = config && config.oaOrigin ? config.oaOrigin : 'https://xt.seeyon.com'
        setFormItem({ id: 'oa-home', subject: t('oaHome'), url: origin + '/seeyon/main.do?method=main', home: true })
      }

      const openMeetings = async function () {
        setMeetingsOpen(false)
        setMeetingsBusy(true)
        try {
          const result = await request('/meetings')
          if (result && result.ok) setMeetings(Array.isArray(result.items) ? result.items : [])
        } catch (error) {
          notify(error && error.message ? error.message : String(error))
        } finally {
          setMeetingsBusy(false)
        }
      }

      const respondMeeting = async function (meeting, receiptType) {
        if (!meeting || meetingBusy) return
        setMeetingBusy(meeting.id)
        try {
          const result = await request('/meeting-receipt', { method: 'POST', body: JSON.stringify({ meetingId: meeting.id, receiptType: receiptType }) })
          if (!result || !result.ok) throw new Error(result && result.error ? (result.error.message || String(result.error)) : t('meetingReceiptFailed'))
          notify(receiptType === 1 ? t('meetingAttended') : t('meetingDeclined'))
          const refreshed = await request('/meetings')
          if (refreshed && refreshed.ok) setMeetings(Array.isArray(refreshed.items) ? refreshed.items : [])
        } catch (error) {
          notify(error && error.message ? error.message : String(error))
        } finally {
          setMeetingBusy('')
        }
      }

      const load = React.useCallback(async function (isRefresh) {
        if (isRefresh) setRefreshing(true)
        else setLoading(true)
        try {
          const data = await request('/todos' + (isRefresh ? '?refresh=1' : ''))
          if (data && data.ok) {
            const nextItems = Array.isArray(data.items) ? data.items : []
            panelCount = nextItems.length
            setItems(nextItems)
            setError(null)
          } else {
            setItems([])
            setError((data && data.error) || { message: t('errorHint') })
          }
        } catch (loadError) {
          setItems([])
          setError({ message: loadError.message || String(loadError) })
        } finally {
          setLoading(false)
          setRefreshing(false)
        }
      }, [t])

      React.useEffect(function () {
        if (pendingOpenError) {
          notify(pendingOpenError)
          pendingOpenError = ''
        }
      }, [notify])

      React.useEffect(function () {
        let alive = true
        request('/bootstrap')
          .then(function (data) {
            if (!alive) return
            setBoot(data)
            if (data && data.config && data.config.demo) {
              setItems([])
              setLoading(true)
            }
          })
          .catch(function () {
            if (alive) setBoot(null)
          })
          .finally(function () {
            if (alive) load(false)
          })
        return function () { alive = false }
      }, [load])

      const watchGuest = React.useCallback(function (item, config, options) {
        lastItem.current = item
        const token = ++watchToken.current
        const startedAt = Date.now()
        const silent = options && options.silent
        const tick = function () {
          if (watchToken.current !== token) return
          const view = findGuest(item.url)
          if (view) {
            attachGuest(view, item, config, function () {
              if (silent) return
              if (injectedNotice.current === item.id) return
              injectedNotice.current = item.id
              notify(t('toastAssistantReady'))
            })
          }
          if (Date.now() - startedAt < 45000) setTimeout(tick, 700)
          else if (!view && !silent) notify(t('toastNoGuest'))
        }
        tick()
      }, [notify, t])

      const openInSidebar = React.useCallback(async function (item) {
        if (!item || !item.url) {
          notify(t('toastNoUrl'))
          return
        }
        const config = boot && boot.config ? boot.config : null
        lastItem.current = item
        try {
          await request('/open', { method: 'POST', body: JSON.stringify({ url: item.url, id: item.id, subject: item.subject }) })
        } catch (openError) {
          /* the tab still opens; the guest watcher can retry */
        }
        watchGuest(item, config)
        let opened = false
        let failure = ''
        const sidebar = (typeof ctx.get === 'function' && ctx.get('sidebarRight')) || ctx.sidebarRight
        const layout = (typeof ctx.get === 'function' && ctx.get('layout')) || ctx.layout
        if (!sidebar || typeof sidebar.openTab !== 'function') {
          failure = t('toastNoBrowser')
        } else {
          const attempt = function () {
            sidebar.openTab('browser', { params: { url: item.url }, revealIfOpened: true })
          }
          try {
            attempt()
            opened = true
          } catch (firstError) {
            failure = firstError && firstError.message ? firstError.message : String(firstError)
            // The right Sidebar is session-scoped. Our panel is a global panel, so
            // the session surface is unmounted while it is shown: return to the
            // Conversation (same session) and retry until its surface mounts.
            if (/no session surface/i.test(failure) && layout && typeof layout.selectPanel === 'function') {
              try {
                layout.selectPanel(null)
              } catch (switchError) {
                failure = switchError && switchError.message ? switchError.message : String(switchError)
              }
              for (let attemptIndex = 0; attemptIndex < 20 && !opened; attemptIndex += 1) {
                await new Promise(function (resolve) { setTimeout(resolve, 120) })
                try {
                  attempt()
                  opened = true
                } catch (retryError) {
                  failure = retryError && retryError.message ? retryError.message : String(retryError)
                }
              }
              if (!opened) {
                try {
                  layout.selectPanel(PANEL_ID)
                } catch {
                  /* keep the conversation visible */
                }
              }
            }
          }
        }
        if (opened) {
          notify(t('toastOpened'))
        } else {
          pendingOpenError = interpolate(t('toastOpenFailed'), { msg: failure || 'unknown' })
          notify(pendingOpenError)
        }
      }, [boot, ctx, notify, t, watchGuest])

      const openTodo = React.useCallback(async function (item) {
        if (!item || !item.url) {
          notify(t('toastNoUrl'))
          return
        }
        const bridge = window.dshDesktop && window.dshDesktop.protocolVersion === 1 ? window.dshDesktop.browser : null
        if (bridge && typeof bridge.acquire === 'function') {
          lastItem.current = item
          setFormItem(item)
          return
        }
        await openInSidebar(item)
      }, [notify, openInSidebar, t])

      const filtered = React.useMemo(function () {
        const needle = query.trim().toLowerCase()
        return items.filter(function (item) {
          if (filter === 'urgent') {
            const tone = deadlineInfo(item.deadline, t).tone
            if (tone !== 'overdue' && tone !== 'today') return false
          } else if (filter === 'overdue') {
            if (deadlineInfo(item.deadline, t).tone !== 'overdue') return false
          }
          if (!needle) return true
          return [item.subject, item.sender, item.template].join(' ').toLowerCase().indexOf(needle) >= 0
        }).sort(function (a, b) { return sortItems(a, b, t) })
      }, [items, query, filter, t])

      const groups = React.useMemo(function () {
        const map = {}
        LEVELS.forEach(function (level) { map[level.key] = [] })
        filtered.forEach(function (item) {
          const key = LEVELS.some(function (entry) { return entry.key === Number(item.level) }) ? Number(item.level) : 0
          map[key].push(item)
        })
        return LEVELS.map(function (level) { return { level, items: map[level.key] } }).filter(function (entry) { return entry.items.length > 0 })
      }, [filtered])

      const stats = React.useMemo(function () {
        let urgent = 0
        let overdue = 0
        const per = { 3: 0, 2: 0, 1: 0, 0: 0 }
        items.forEach(function (item) {
          const tone = deadlineInfo(item.deadline, t).tone
          if (tone === 'overdue') overdue += 1
          if (tone === 'overdue' || tone === 'today') urgent += 1
          const level = LEVELS.some(function (entry) { return entry.key === Number(item.level) }) ? Number(item.level) : 0
          per[level] += 1
        })
        return { urgent, overdue, per, total: items.length }
      }, [items, t])

      const config = boot && boot.config ? boot.config : null

      const renderMeeting = function (meeting) {
        return h('div', { className: 'st-meeting', key: meeting.id }, [
          h('div', { className: 'st-meeting-head', key: 'head' }, [
            h('b', {}, meeting.name),
            h('span', { className: 'st-tag' }, meeting.feedback || meeting.status),
          ]),
          h('div', { className: 'st-meeting-meta', key: 'meta' }, [meeting.time, meeting.location, meeting.creator].filter(Boolean).join(' · ')),
          meeting.content ? h('div', { className: 'st-meeting-content', key: 'content' }, meeting.content.length > 180 ? meeting.content.slice(0, 180) + '…' : meeting.content) : null,
          meeting.meetingNumber || meeting.meetingNo || meeting.roomName ? h('div', { className: 'st-meeting-no', key: 'no' }, [
            meeting.roomName,
            meeting.meetingNumber ? t('meetingNo') + ' ' + meeting.meetingNumber : '',
            meeting.meetingNo ? t('meetingPassword') + ' ' + meeting.meetingNo : '',
          ].filter(Boolean).join(' · ')) : null,
          h('div', { className: 'st-meeting-actions', key: 'actions' }, [
            meeting.meetingNumber || meeting.meetingNo ? h('button', {
              className: 'st-btn',
              type: 'button',
              onClick: function () {
                const text = [meeting.meetingNumber, meeting.meetingNo].filter(Boolean).join(' / ')
                if (navigator.clipboard && window.isSecureContext) void navigator.clipboard.writeText(text)
              },
            }, t('copy')) : null,
            (meeting.meetingNumber || meeting.joinUrl || meeting.detailUrl) ? h('button', {
              className: 'st-btn',
              type: 'button',
              onClick: function () {
                openExternalUrl(meeting.joinUrl || meeting.detailUrl)
              },
            }, t('joinMeeting')) : null,
            h('button', { className: 'st-btn primary', type: 'button', disabled: meetingBusy === meeting.id, onClick: function () { void respondMeeting(meeting, 1) } }, t('attend')),
            h('button', { className: 'st-btn', type: 'button', disabled: meetingBusy === meeting.id, onClick: function () { void respondMeeting(meeting, 0) } }, t('decline')),
          ]),
        ])
      }

      return h('div', { className: 'st-root' + (formItem ? ' st-root-form' : '') + (tab === 'meetings' && !formItem ? ' st-tab-meetings' : '') }, [
        formItem ? h('div', { className: 'st-form-wrap', key: 'form-wrap' }, [
          h(EmbeddedForm, {
            key: 'embedded-form-' + formNonce,
            item: formItem,
            config: config,
            t: t,
            notify: notify,
            fillToken: fillToken,
            onBack: function () { setFormItem(null) },
            onOpenSidebar: function () {
              openExternalUrl(formItem.url)
            },
          }),
          formItem.draft && /周报/.test(String(formItem.draft.templateName || '')) ? h(ReportAssistant, {
            key: 'report-assistant',
            t: t,
            notify: notify,
          }) : null,
          formItem.draft && formItem.draft.templateId === '6405666956814665521' ? h(WeeklyAssistant, {
            key: 'weekly-assistant',
            masterId: formItem.draft.masterId,
            t: t,
            notify: notify,
            onFilled: function (url) {
              if (url) {
                const fresh = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_dsh=' + Date.now()
                setFormItem(function (previous) { return previous ? Object.assign({}, previous, { url: fresh }) : previous })
                setFormNonce(function (value) { return value + 1 })
              }
            },
          }) : null,
        ]) : h('div', { className: 'st-shell', key: 'shell' }, [
          h('header', { className: 'st-head', key: 'head' }, [
            h('div', { className: 'st-brand', key: 'brand' }, [
              h('div', { className: 'st-logo', key: 'logo' }, [I.logo(24)]),
              h('div', { key: 'text' }, [
                h('h1', { className: 'st-title', key: 'title' }, t('title') + (items.length ? ' · ' + items.length : '')),
                h('p', { className: 'st-subtitle', key: 'sub' }, t('subtitle')),
                h('div', { className: 'st-tabs-inline', key: 'tabs' }, [
                  h('button', {
                    className: 'st-tab' + (tab === 'todos' ? ' active' : ''),
                    type: 'button',
                    onClick: function () { setTab('todos'); setMeetingsOpen(false) },
                  }, t('tabTodos') + ' ' + items.length),
                  h('button', {
                    className: 'st-tab' + (tab === 'meetings' ? ' active' : ''),
                    type: 'button',
                    onClick: function () { setTab('meetings'); void openMeetings() },
                  }, t('tabMeetings') + (meetings.length ? ' ' + meetings.length : '')),
                ]),
              ]),
            ]),
            h('div', { className: 'st-actions', key: 'actions' }, [
              h('button', {
                className: 'st-btn',
                type: 'button',
                onClick: openTemplates,
                title: t('newForm'),
              }, [I.spark(15), t('newForm')]),
              h('button', {
                className: 'st-btn',
                type: 'button',
                onClick: openHome,
                title: t('home'),
              }, [I.external(14), t('home')]),

              h('button', {
                className: 'st-btn',
                type: 'button',
                onClick: function () { load(true) },
                disabled: refreshing,
                title: t('refresh'),
              }, [I.refresh(15), refreshing ? t('refreshing') : t('refresh')]),
              h('button', {
                className: 'st-btn st-iconbtn',
                type: 'button',
                onClick: function () {
                  if (!lastItem.current) {
                    notify(t('toastNoGuest'))
                    return
                  }
                  watchGuest(lastItem.current, config, { silent: true })
                  notify(t('toastInjecting'))
                },
                title: t('injectNow'),
                'aria-label': t('injectNow'),
              }, [I.spark(16)]),
              h('button', {
                className: 'st-btn st-iconbtn',
                type: 'button',
                onClick: function () { setSettingsOpen(true) },
                title: t('settings'),
                'aria-label': t('settings'),
              }, [I.settings(16)]),
            ]),
          ]),

          tab === 'meetings' && !formItem ? h('div', { className: 'st-meetings-view', key: 'meetings-view' }, [
            h('div', { className: 'st-meetings-head', key: 'head' }, t('meetings') + (meetings.length ? ' (' + meetings.length + ')' : '')),
            meetingsBusy ? h('div', { className: 'st-skel', key: 'loading' }, [h('div', { className: 'st-skel-row', style: { height: '70px' } })]) : null,
            !meetingsBusy && !meetings.length ? h('div', { className: 'st-empty', key: 'empty' }, t('meetingEmpty')) : null,
            meetings.filter(function (meeting) { return !meeting.declined }).map(function (meeting) { return h('div', { key: 'm-' + meeting.id }, [renderMeeting(meeting)]) }),
            meetings.filter(function (meeting) { return meeting.declined }).length ? h('div', { className: 'st-meeting-group', key: 'declined' }, t('declinedGroup')) : null,
            meetings.filter(function (meeting) { return meeting.declined }).map(function (meeting) { return h('div', { key: 'd-' + meeting.id }, [renderMeeting(meeting)]) }),
          ]) : null,

          config && config.demo ? h('div', { className: 'st-banner', key: 'demo' }, [
            h('span', { key: 'icon' }, [I.spark(15)]),
            h('div', { className: 'st-banner-body', key: 'body' }, config.hasToken ? t('demoHintToken') : t('demoHint')),
            h('div', { className: 'st-banner-actions', key: 'actions' }, [
              h('button', { className: 'st-btn', type: 'button', onClick: function () { setSettingsOpen(true) } }, t('openSettings')),
            ]),
          ]) : null,

          h('div', { className: 'st-stats', key: 'stats' }, [
            h('span', { className: 'st-stat', key: 'all' }, [h('b', {}, String(stats.total)), t('statTotal')]),
            h('span', { className: 'st-stat warn', key: 'urgent' }, [h('span', { className: 'st-dot', style: { background: '#ef8d1f' } }), h('b', {}, String(stats.urgent)), t('statUrgent')]),
            h('span', { className: 'st-stat danger', key: 'overdue' }, [h('span', { className: 'st-dot', style: { background: '#e5484d' } }), h('b', {}, String(stats.overdue)), t('statOverdue')]),
          ]),

          h('div', { className: 'st-toolbar', key: 'toolbar' }, [
            h('div', { className: 'st-search', key: 'search' }, [
              I.search(15),
              h('input', {
                value: query,
                placeholder: t('searchPlaceholder'),
                onChange: function (event) { setQuery(event.target.value) },
                'aria-label': t('searchPlaceholder'),
              }),
            ]),
            h('div', { className: 'st-seg', key: 'seg' }, [
              h('button', { type: 'button', 'data-active': filter === 'all' ? '1' : '0', onClick: function () { setFilter('all') } }, t('filterAll')),
              h('button', { type: 'button', 'data-active': filter === 'urgent' ? '1' : '0', onClick: function () { setFilter('urgent') } }, t('filterUrgent')),
              h('button', { type: 'button', 'data-active': filter === 'overdue' ? '1' : '0', onClick: function () { setFilter('overdue') } }, t('filterOverdue')),
            ]),
          ]),

          error ? h('div', { className: 'st-error', key: 'error' }, [
            h('div', { className: 'st-empty-icon' }, [I.alert(22)]),
            h('h3', {}, t('errorTitle')),
            h('p', {}, (error.message || t('errorHint')) + (error.hint ? '\n' + error.hint : '')),
            h('div', { className: 'st-error-actions' }, [
              h('button', { className: 'st-btn primary', type: 'button', onClick: function () { load(true) } }, t('retry')),
              h('button', { className: 'st-btn', type: 'button', onClick: function () { setSettingsOpen(true) } }, t('openSettings')),
            ]),
          ]) : null,

          !error && loading ? h('div', { className: 'st-skel', key: 'skel' }, [0, 1, 2, 3, 4].map(function (index) {
            return h('div', { className: 'st-skel-row', key: index })
          })) : null,

          !error && !loading && groups.length === 0 ? h('div', { className: 'st-empty', key: 'empty' }, [
            h('div', { className: 'st-empty-icon' }, [I.inbox(22)]),
            h('h3', {}, t('emptyTitle')),
            h('p', {}, t('emptyHint')),
            h('button', { className: 'st-btn', type: 'button', onClick: function () { load(true) } }, t('refresh')),
          ]) : null,

          !error && !loading ? groups.map(function (group) {
            return h(Section, {
              key: 'level-' + group.level.key,
              level: group.level,
              items: group.items,
              t: t,
              onOpen: openTodo,
              onDetail: function (item) { setDetailItem(item) },
            })
          }) : null,

          h('div', { className: 'st-foot', key: 'foot' }, [
            h('span', { className: 'st-src', key: 'src' }, [I.info(13), config && config.demo ? t('demoOpen') : 'MCP · Seeyon OA']),
            h('span', { key: 'hint' }, t('footerHint')),
          ]),
        ]),

        settingsOpen && config ? h(SettingsDrawer, {
          key: 'settings',
          t: t,
          config: config,
          onClose: function () { setSettingsOpen(false) },
          onToast: notify,
          onSaved: async function () {
            try {
              const data = await request('/bootstrap')
              setBoot(data)
              await load(true)
            } catch (savedError) {
              notify(savedError.message || String(savedError))
            }
          },
        }) : null,

        detailItem ? h(DetailDrawer, {
          key: 'detail',
          t: t,
          item: detailItem,
          onClose: function () { setDetailItem(null) },
          onOpen: function (item) { setDetailItem(null); openTodo(item) },
        }) : null,

        pickerOpen ? h('div', { className: 'st-overlay', key: 'picker', onClick: function () { setPickerOpen(false) } }, [
          h('aside', {
            className: 'st-drawer',
            key: 'drawer',
            onClick: function (event) { event.stopPropagation() },
            role: 'dialog',
            'aria-label': t('templateTitle'),
          }, [
            h('div', { className: 'st-drawer-head', key: 'head' }, [
              h('h3', {}, t('templateTitle')),
              h('button', { className: 'st-btn st-iconbtn', type: 'button', onClick: function () { setPickerOpen(false) }, title: t('close') }, [I.close(16)]),
            ]),
            h('div', { className: 'st-drawer-body', key: 'body' }, [
              h('input', {
                className: 'st-input',
                placeholder: t('templateSearch'),
                value: templateQuery,
                autoFocus: true,
                onChange: function (event) { setTemplateQuery(event.target.value) },
              }),
              templateBusy ? h('div', { className: 'st-picker-hint', key: 'loading' }, t('templateLoading')) : null,
              h('div', { className: 'st-picker-list', key: 'list' }, templates.filter(function (tpl) {
                const needle = templateQuery.trim()
                return !needle || tpl.name.indexOf(needle) >= 0
              }).slice(0, 200).map(function (tpl) {
                return h('button', {
                  className: 'st-picker-item',
                  type: 'button',
                  key: tpl.id,
                  onClick: function () { void pickTemplate(tpl) },
                }, tpl.name)
              })),
              !templateBusy && !templates.length ? h('div', { className: 'st-picker-hint', key: 'empty' }, t('templateEmpty')) : null,
            ]),
          ]),
        ]) : null,

        meetingsOpen ? h('div', { className: 'st-overlay', key: 'meetings', onClick: function () { setMeetingsOpen(false); setTab('todos') } }, [
          h('aside', {
            className: 'st-drawer',
            key: 'drawer',
            onClick: function (event) { event.stopPropagation() },
            role: 'dialog',
            'aria-label': t('meetings'),
          }, [
            h('div', { className: 'st-drawer-head', key: 'head' }, [
              h('h3', {}, t('meetings') + (meetings.length ? ' (' + meetings.length + ')' : '')),
              h('button', { className: 'st-btn st-iconbtn', type: 'button', onClick: function () { setMeetingsOpen(false) }, title: t('close') }, [I.close(16)]),
            ]),
            h('div', { className: 'st-drawer-body', key: 'body' }, [
              meetingsBusy ? h('div', { className: 'st-skel', key: 'loading' }, [h('div', { className: 'st-skel-row', style: { height: '70px' } })]) : null,
              !meetingsBusy && !meetings.length ? h('div', { className: 'st-empty', key: 'empty' }, t('meetingEmpty')) : null,
              meetings.filter(function (meeting) { return !meeting.declined }).map(renderMeeting),
              meetings.filter(function (meeting) { return meeting.declined }).length ? h('div', { className: 'st-meeting-group', key: 'declined' }, t('declinedGroup')) : null,
              meetings.filter(function (meeting) { return meeting.declined }).map(renderMeeting),
            ]),
          ]),
        ]) : null,

        toast ? h('div', { className: 'st-toast', key: 'toast' }, toast) : null,
      ])
    }

    // ---------------------------------------------------------------- apply

    let panelCount = 0

    function apply(ctx) {
      ctx.effect(function () {
        return ctx.locale.register(NS, DICTS)
      }, NS + ': dictionaries')

      const t = ctx.locale.bind(NS)

      ctx.effect(function () {
        const style = document.createElement('style')
        style.setAttribute('data-dsh-seeyon-todo', 'styles')
        style.textContent = CSS
        document.head.appendChild(style)
        return function () { style.remove() }
      }, NS + ': styles')

      ctx.slots.inject('main', function () {
        return ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, function () {
          return h(App, { ctx: ctx, t: t })
        })
      })

      ctx.slots.inject('sidebar.panellist', function () {
        return ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 3,
          label: function () { return panelCount > 0 ? t('panel') + ' (' + panelCount + ')' : t('panel') },
          locale: NS,
        }, function (owner) {
          return h('span', {
            style: { display: 'inline-flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
            'aria-hidden': 'true',
          }, [I.logo(owner && owner.size ? owner.size : 16)])
        })
      })
    }

    return {
      name: NS,
      inject: ['slots', 'locale', 'sidebarRight', 'layout'],
      apply: apply,
    }
  },
})
