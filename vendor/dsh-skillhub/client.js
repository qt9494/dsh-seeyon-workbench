
window.__ModuleLoader__.load({
  id: '@local/dsh-skillhub',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement

    const NS = 'dsh-skillhub'
    const PANEL_ID = 'dsh-skillhub'
    const STORAGE_KEY = 'dsh-skillhub:name-language'
    const CSS = "\n.dsh-skillhub-root, .sh-overlay {\n  --dsh-skillhub-bg: var(--dsw-alias-bg-layer-2, #f5f6f8);\n  --dsh-skillhub-surface: var(--dsw-alias-bg-layer-1, #ffffff);\n  --dsh-skillhub-surface-2: var(--dsw-alias-bg-layer-3, #f2f3f5);\n  --dsh-skillhub-border: var(--dsw-alias-border-l2, #e4e7ec);\n  --dsh-skillhub-border-strong: var(--dsw-alias-border-l3, #cfd4dc);\n  --dsh-skillhub-ink: var(--dsw-alias-label-primary, #1f2328);\n  --dsh-skillhub-muted: var(--dsw-alias-label-secondary, #667085);\n  --dsh-skillhub-faint: var(--dsw-alias-label-tertiary, #98a2b3);\n  --dsh-skillhub-accent: var(--dsw-alias-state-business-primary, #4f6ef7);\n  --dsh-skillhub-danger: var(--dsw-alias-state-error-primary, #d92d20);\n}\n.dsh-skillhub-root {\n  height: 100%;\n  min-height: 0;\n  overflow-y: auto;\n  background: var(--dsh-skillhub-bg);\n  color: var(--dsh-skillhub-ink);\n  font-family: var(--dsw-font-family, inherit);\n}\n.dsh-skillhub-root, .dsh-skillhub-root * { box-sizing: border-box; }\n.dsh-skillhub-root button, .dsh-skillhub-root input, .dsh-skillhub-root select { font: inherit; }\n.sh-shell { width: 100%; max-width: 1240px; margin: 0 auto; padding: calc(var(--dsh-frame-top-clearance, 0px) + 26px) 28px 48px; }\n.sh-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 18px; }\n.sh-brand { display: flex; align-items: center; gap: 14px; min-width: 0; }\n.sh-logo { width: 46px; height: 46px; flex: none; border-radius: 13px; display: flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, #4f6ef7 0%, #8b5cf6 100%); box-shadow: 0 7px 20px rgba(79, 110, 247, .28); }\n.sh-brand-text { min-width: 0; }\n.sh-title { margin: 0; font-size: 22px; line-height: 1.25; font-weight: 650; letter-spacing: -.01em; }\n.sh-subtitle { margin: 5px 0 0; font-size: 13px; line-height: 1.45; color: var(--dsh-skillhub-muted); }\n.sh-actions { display: flex; align-items: center; gap: 8px; flex: none; padding-top: 4px; }\n.sh-seg { display: inline-flex; align-items: center; padding: 3px; gap: 2px; border: 1px solid var(--dsh-skillhub-border); border-radius: 9px; background: var(--dsh-skillhub-surface); }\n.sh-seg button { border: 0; background: transparent; color: var(--dsh-skillhub-muted); height: 26px; padding: 0 10px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; }\n.sh-seg button:hover { color: var(--dsh-skillhub-ink); }\n.sh-seg button[data-active=\"true\"] { background: var(--dsh-skillhub-accent); color: #fff; box-shadow: 0 2px 6px rgba(79, 110, 247, .25); }\n.sh-icon-btn { width: 34px; height: 34px; flex: none; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--dsh-skillhub-border); border-radius: 9px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-muted); cursor: pointer; transition: background .15s ease, color .15s ease, border-color .15s ease; }\n.sh-icon-btn:hover { color: var(--dsh-skillhub-ink); border-color: var(--dsh-skillhub-border-strong); background: var(--dsh-skillhub-surface-2); }\n.sh-icon-btn:disabled { opacity: .55; cursor: default; }\n.sh-search { position: relative; display: flex; align-items: center; margin-bottom: 4px; }\n.sh-search > svg { position: absolute; left: 13px; color: var(--dsh-skillhub-faint); pointer-events: none; }\n.sh-search input { width: 100%; height: 43px; padding: 0 42px 0 40px; border: 1px solid var(--dsh-skillhub-border); border-radius: 11px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-ink); font-size: 14px; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }\n.sh-search input::placeholder { color: var(--dsh-skillhub-faint); }\n.sh-search input::-webkit-search-cancel-button { display: none; }\n.sh-search input:focus { border-color: var(--dsh-skillhub-accent); box-shadow: 0 0 0 3px rgba(79, 110, 247, .13); }\n.sh-search-clear { position: absolute; right: 7px; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 6px; background: transparent; color: var(--dsh-skillhub-muted); cursor: pointer; }\n.sh-search-clear:hover { background: var(--dsh-skillhub-surface-2); color: var(--dsh-skillhub-ink); }\n.sh-toolbar { display: flex; align-items: flex-start; gap: 10px; margin: 14px 0 10px; flex-wrap: wrap; }\n.sh-chips { display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; flex-wrap: wrap; overflow: visible; padding: 1px 0 3px; }\n.sh-chips::-webkit-scrollbar { display: none; }\n.sh-chip { height: 30px; flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 0 11px; border: 1px solid var(--dsh-skillhub-border); border-radius: 999px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-muted); font-size: 12px; white-space: nowrap; cursor: pointer; transition: background .15s ease, color .15s ease, border-color .15s ease; }\n.sh-chip:hover { color: var(--dsh-skillhub-ink); border-color: var(--dsh-skillhub-border-strong); }\n.sh-chip[data-active=\"true\"] { background: var(--dsh-skillhub-accent); border-color: var(--dsh-skillhub-accent); color: #fff; }\n.sh-chip-count { font-size: 10px; opacity: .67; }\n.sh-sort { display: inline-flex; align-items: center; gap: 6px; flex: none; color: var(--dsh-skillhub-muted); font-size: 12px; }\n.sh-sort select { height: 32px; padding: 0 26px 0 9px; border: 1px solid var(--dsh-skillhub-border); border-radius: 8px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-ink); font-size: 12px; cursor: pointer; }\n.sh-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 2px 0 12px; color: var(--dsh-skillhub-muted); font-size: 12px; }\n.sh-meta-right { display: inline-flex; align-items: center; gap: 6px; text-align: right; }\n.sh-banner { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; padding: 9px 12px; border: 1px solid var(--dsh-skillhub-border); border-left: 3px solid var(--dsh-skillhub-accent); border-radius: 8px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-muted); font-size: 12px; }\n.sh-banner button { margin-left: auto; border: 0; background: transparent; color: var(--dsh-skillhub-accent); font-size: 12px; font-weight: 600; cursor: pointer; }\n.sh-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }\n.sh-card { position: relative; display: flex; flex-direction: column; gap: 10px; min-height: 226px; padding: 16px; border: 1px solid var(--dsh-skillhub-border); border-radius: 13px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-ink); text-align: left; cursor: pointer; transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease; }\n.sh-card:hover { transform: translateY(-2px); border-color: var(--dsh-skillhub-border-strong); box-shadow: 0 12px 28px rgba(15, 23, 42, .09); }\n.sh-card:active { transform: translateY(0); }\n.sh-card-top { display: flex; align-items: flex-start; gap: 10px; }\n.sh-avatar { width: 35px; height: 35px; flex: none; display: flex; align-items: center; justify-content: center; border-radius: 9px; color: #fff; font-size: 13px; font-weight: 700; letter-spacing: .02em; }\n.sh-card-title { min-width: 0; flex: 1; }\n.sh-card-name { font-size: 15px; line-height: 1.35; font-weight: 600; overflow-wrap: anywhere; }\n.sh-card-name-en { margin-top: 3px; font-size: 11.5px; line-height: 1.35; color: var(--dsh-skillhub-muted); overflow-wrap: anywhere; }\n.sh-ns { flex: none; max-width: 118px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 3px 7px; border: 1px solid var(--dsh-skillhub-border); border-radius: 999px; background: var(--dsh-skillhub-surface-2); color: var(--dsh-skillhub-muted); font-size: 10px; }\n.sh-summary { margin: 0; min-height: 59px; font-size: 13px; line-height: 1.55; color: var(--dsh-skillhub-muted); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }\n.sh-labels { display: flex; flex-wrap: wrap; gap: 5px; }\n.sh-label { padding: 2px 6px; border: 1px solid var(--dsh-skillhub-border); border-radius: 5px; background: var(--dsh-skillhub-surface-2); color: var(--dsh-skillhub-muted); font-size: 10px; line-height: 1.4; }\n.sh-card-foot { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 9px; border-top: 1px solid var(--dsh-skillhub-border); color: var(--dsh-skillhub-muted); font-size: 11px; }\n.sh-stat { display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }\n.sh-version { padding: 2px 5px; border: 1px solid var(--dsh-skillhub-border); border-radius: 4px; background: var(--dsh-skillhub-surface-2); color: var(--dsh-skillhub-muted); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 10px; }\n.sh-updated { margin-left: auto; white-space: nowrap; }\n.sh-mark { padding: 0 1px; border-radius: 2px; background: rgba(79, 110, 247, .18); color: inherit; }\n.sh-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 64px 20px; border: 1px dashed var(--dsh-skillhub-border-strong); border-radius: 14px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-muted); text-align: center; }\n.sh-state-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: var(--dsh-skillhub-surface-2); color: var(--dsh-skillhub-muted); }\n.sh-state h3 { margin: 2px 0 0; color: var(--dsh-skillhub-ink); font-size: 16px; font-weight: 600; }\n.sh-state p { margin: 0; max-width: 540px; font-size: 13px; line-height: 1.6; }\n.sh-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 34px; padding: 0 14px; border: 1px solid var(--dsh-skillhub-border); border-radius: 8px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-ink); font-size: 12px; font-weight: 500; cursor: pointer; }\n.sh-btn:hover { border-color: var(--dsh-skillhub-border-strong); background: var(--dsh-skillhub-surface-2); }\n.sh-btn-primary { border-color: var(--dsh-skillhub-accent); background: var(--dsh-skillhub-accent); color: #fff; }\n.sh-btn-primary:hover { border-color: var(--dsh-skillhub-accent); background: var(--dsh-skillhub-accent); opacity: .9; }\n.sh-skeleton { cursor: default; pointer-events: none; }\n.sh-skeleton:hover { transform: none; box-shadow: none; border-color: var(--dsh-skillhub-border); }\n.sh-sk-line { height: 10px; border-radius: 5px; background: linear-gradient(90deg, var(--dsh-skillhub-surface-2) 25%, var(--dsh-skillhub-border) 50%, var(--dsh-skillhub-surface-2) 75%); background-size: 200% 100%; animation: sh-shimmer 1.4s ease-in-out infinite; }\n.sh-sk-top { display: flex; align-items: center; gap: 10px; }\n.sh-sk-avatar { width: 35px; height: 35px; flex: none; border-radius: 9px; background: var(--dsh-skillhub-surface-2); }\n.sh-sk-title { flex: 1; display: flex; flex-direction: column; gap: 7px; }\n.sh-sk-title .sh-sk-line:first-child { width: 70%; }\n.sh-sk-title .sh-sk-line:last-child { width: 45%; height: 8px; }\n.sh-sk-line.wide { width: 100%; }\n.sh-sk-line.medium { width: 82%; }\n.sh-sk-line.short { width: 58%; }\n.sh-sk-foot { display: flex; gap: 10px; margin-top: auto; padding-top: 9px; border-top: 1px solid var(--dsh-skillhub-border); }\n.sh-sk-foot .sh-sk-line { width: 42px; height: 9px; }\n@keyframes sh-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }\n.sh-pager { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; flex-wrap: wrap; color: var(--dsh-skillhub-muted); font-size: 12px; }\n.sh-pager-pages { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }\n.sh-page-btn { min-width: 30px; height: 30px; padding: 0 8px; border: 1px solid var(--dsh-skillhub-border); border-radius: 7px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-muted); font-size: 12px; cursor: pointer; }\n.sh-page-btn:hover:not(:disabled) { border-color: var(--dsh-skillhub-border-strong); color: var(--dsh-skillhub-ink); }\n.sh-page-btn[data-active=\"true\"] { border-color: var(--dsh-skillhub-accent); background: var(--dsh-skillhub-accent); color: #fff; }\n.sh-page-btn:disabled { opacity: .42; cursor: not-allowed; }\n.sh-ellipsis { padding: 0 2px; color: var(--dsh-skillhub-faint); }\n.sh-per-page { display: inline-flex; align-items: center; gap: 6px; }\n.sh-per-page select { height: 28px; padding: 0 4px; border: 1px solid var(--dsh-skillhub-border); border-radius: 6px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-ink); font-size: 12px; }\n.sh-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(15, 23, 42, .48); backdrop-filter: blur(3px); }\n.sh-dialog { width: min(760px, 100%); max-height: calc(100vh - 48px); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--dsh-skillhub-border); border-radius: 16px; background: var(--dsh-skillhub-surface); color: var(--dsh-skillhub-ink); box-shadow: 0 28px 80px rgba(15, 23, 42, .3); }\n.sh-dialog-head { display: flex; align-items: flex-start; gap: 12px; padding: 20px 22px 16px; border-bottom: 1px solid var(--dsh-skillhub-border); }\n.sh-dialog-head-text { flex: 1; min-width: 0; }\n.sh-dialog-title { margin: 0; font-size: 20px; line-height: 1.3; font-weight: 650; overflow-wrap: anywhere; }\n.sh-dialog-sub { margin: 4px 0 0; color: var(--dsh-skillhub-muted); font-size: 12px; line-height: 1.4; overflow-wrap: anywhere; }\n.sh-dialog-body { padding: 18px 22px 24px; overflow-y: auto; }\n.sh-detail-names { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 18px; }\n.sh-detail-name { padding: 10px 12px; border: 1px solid var(--dsh-skillhub-border); border-radius: 9px; background: var(--dsh-skillhub-surface-2); }\n.sh-detail-name small { display: block; margin-bottom: 4px; color: var(--dsh-skillhub-faint); font-size: 10px; letter-spacing: .06em; text-transform: uppercase; }\n.sh-detail-name strong { display: block; font-size: 13.5px; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }\n.sh-detail-section { margin-top: 18px; }\n.sh-detail-section h4 { margin: 0 0 8px; color: var(--dsh-skillhub-faint); font-size: 10.5px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }\n.sh-detail-summary { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; color: var(--dsh-skillhub-ink); font-size: 13px; line-height: 1.7; }\n.sh-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }\n.sh-stat-card { padding: 10px 11px; border: 1px solid var(--dsh-skillhub-border); border-radius: 9px; background: var(--dsh-skillhub-surface-2); }\n.sh-stat-card strong { display: block; font-size: 16px; line-height: 1.2; font-weight: 650; }\n.sh-stat-card span { display: block; margin-top: 3px; color: var(--dsh-skillhub-muted); font-size: 11px; }\n.sh-kv { display: grid; grid-template-columns: 112px 1fr; gap: 6px 12px; margin: 0; font-size: 12px; }\n.sh-kv dt { color: var(--dsh-skillhub-faint); }\n.sh-kv dd { margin: 0; color: var(--dsh-skillhub-ink); overflow-wrap: anywhere; }\n.sh-dialog-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--dsh-skillhub-border); }\n.sh-link-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 35px; padding: 0 13px; border-radius: 8px; background: var(--dsh-skillhub-accent); color: #fff; font-size: 12px; font-weight: 600; text-decoration: none; }\n.sh-link-btn:hover { opacity: .9; }\n.sh-empty-labels { color: var(--dsh-skillhub-faint); font-size: 12px; }\n.sh-spin { animation: sh-spin .9s linear infinite; }\n@keyframes sh-spin { to { transform: rotate(360deg); } }\n.dsh-skillhub-root :focus-visible { outline: 2px solid var(--dsh-skillhub-accent); outline-offset: 2px; }\n.sh-search input:focus-visible { outline: none; }\n@media (max-width: 760px) {\n  .sh-shell { padding-left: 16px; padding-right: 16px; padding-bottom: 36px; }\n  .sh-header { flex-direction: column; gap: 12px; }\n  .sh-actions { width: 100%; justify-content: space-between; padding-top: 0; }\n  .sh-grid { grid-template-columns: 1fr; }\n  .sh-detail-names { grid-template-columns: 1fr; }\n  .sh-stats { grid-template-columns: repeat(2, 1fr); }\n  .sh-kv { grid-template-columns: 1fr; }\n  .sh-overlay { padding: 0; align-items: stretch; }\n  .sh-dialog { width: 100%; max-height: 100vh; border-radius: 0; }\n}\n";
    const DICTS = {"zh":{"panel":"SkillHub","title":"SkillHub 技能市场","subtitle":"浏览致远 SkillHub 中的全部技能，支持搜索与技能名称中英文切换","searchPlaceholder":"搜索技能名称、描述、标签或命名空间…","searchLabel":"搜索技能","all":"全部","sortLabel":"排序","sortRecommended":"推荐","sortDownloads":"下载最多","sortNewest":"最近更新","sortName":"名称","nameLanguage":"技能名称语言","nameZh":"中文","nameEn":"EN","refresh":"刷新","refreshing":"正在刷新","totalCount":"共 {n} 个技能","filteredCount":"筛选出 {n} / {total} 个技能","loading":"正在加载 SkillHub 技能…","errorTitle":"无法加载技能列表","errorHint":"请检查网络或 SkillHub 服务是否可访问，然后重试。","retry":"重试","emptyTitle":"没有匹配的技能","emptyHint":"试试其他关键词，或清除筛选条件。","emptySourceTitle":"SkillHub 暂无可展示的技能","emptySourceHint":"稍后刷新再试。","clearFilters":"清除筛选","downloads":"下载","stars":"收藏","version":"版本","updated":"更新于","namespace":"命名空间","labels":"标签","details":"技能详情","openInSkillHub":"在 SkillHub 中打开","close":"关闭","previous":"上一页","next":"下一页","pageOf":"第 {page} / {total} 页","perPage":"每页","stale":"刷新失败，当前显示缓存数据。","noSummary":"暂无简介","nameZhLabel":"中文名","nameEnLabel":"English name","overview":"技能简介","meta":"基本信息","stats":"数据","openSkill":"查看技能","rating":"评分","noLabels":"无标签","source":"数据来源","fetchedAt":"数据更新于","clearSearch":"清除搜索"},"en":{"panel":"SkillHub","title":"SkillHub Skills","subtitle":"Browse every skill published on Seeyon SkillHub, with search and a Chinese/English name switch","searchPlaceholder":"Search names, descriptions, labels, or namespaces…","searchLabel":"Search skills","all":"All","sortLabel":"Sort","sortRecommended":"Recommended","sortDownloads":"Most downloaded","sortNewest":"Recently updated","sortName":"Name","nameLanguage":"Skill name language","nameZh":"中文","nameEn":"EN","refresh":"Refresh","refreshing":"Refreshing","totalCount":"{n} skills","filteredCount":"{n} of {total} skills","loading":"Loading SkillHub skills…","errorTitle":"Could not load the skill catalog","errorHint":"Check the network or SkillHub availability, then try again.","retry":"Retry","emptyTitle":"No matching skills","emptyHint":"Try another keyword or clear the filters.","emptySourceTitle":"SkillHub has no skills to show","emptySourceHint":"Refresh again in a moment.","clearFilters":"Clear filters","downloads":"Downloads","stars":"Stars","version":"Version","updated":"Updated","namespace":"Namespace","labels":"Labels","details":"Skill details","openInSkillHub":"Open in SkillHub","close":"Close","previous":"Previous","next":"Next","pageOf":"Page {page} of {total}","perPage":"Per page","stale":"Refresh failed; showing cached data.","noSummary":"No description","nameZhLabel":"中文名","nameEnLabel":"English name","overview":"Overview","meta":"Details","stats":"Stats","openSkill":"View skill","rating":"Rating","noLabels":"No labels","source":"Source","fetchedAt":"Data updated","clearSearch":"Clear search"}};

    const INSTALL_DICTS = {"zh":{"installSection":"安装技能","installHint":"安装到当前用户的技能目录（~/.agents/skills）。安装后新会话可用；技能是第三方指令，请确认来源。","installButton":"安装技能","installConfirm":"确认安装","installCancel":"取消","installing":"正在安装…","installed":"已安装","alreadyInstalled":"技能已存在","installSuccess":"安装完成，新会话中可用。","installFailed":"安装失败","installNoVersion":"该技能没有已发布版本，暂时无法安装。","installPath":"安装位置","installRetry":"重试"},"en":{"installSection":"Install skill","installHint":"Installs into the current user's skill directory (~/.agents/skills). The skill is available in a new session. It contains third-party instructions; confirm the source first.","installButton":"Install skill","installConfirm":"Confirm install","installCancel":"Cancel","installing":"Installing…","installed":"Installed","alreadyInstalled":"Already installed","installSuccess":"Installed. It will be available in a new session.","installFailed":"Install failed","installNoVersion":"This skill has no published version yet.","installPath":"Location","installRetry":"Retry"}};
    const INSTALL_CSS = ".sh-install { margin-top: 18px; padding: 13px 14px; border: 1px solid var(--dsh-skillhub-border); border-radius: 10px; background: var(--dsh-skillhub-surface-2); }\n.sh-install-head { display: flex; align-items: center; gap: 7px; color: var(--dsh-skillhub-ink); font-size: 13px; }\n.sh-install-head svg { color: var(--dsh-skillhub-accent); }\n.sh-install-hint { margin: 6px 0 10px; color: var(--dsh-skillhub-muted); font-size: 12px; line-height: 1.55; }\n.sh-install-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }\n.sh-install-success { color: var(--dsh-skillhub-ink); font-size: 12px; line-height: 1.55; }\n.sh-install-success strong { color: var(--dsh-skillhub-accent); }\n.sh-install-path { margin-top: 4px; color: var(--dsh-skillhub-muted); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; overflow-wrap: anywhere; }\n.sh-install-error { color: var(--dsh-skillhub-danger); font-size: 12px; line-height: 1.55; }\n.sh-install-error strong { display: block; margin-bottom: 3px; }\n.sh-install-error .sh-btn { margin-top: 8px; }";
    let cachedCatalog = null

    function cx() {
      const out = []
      for (let index = 0; index < arguments.length; index += 1) {
        if (arguments[index]) out.push(arguments[index])
      }
      return out.join(' ')
    }

    function interpolate(template, values) {
      return String(template || '').replace(/\{(\w+)\}/g, function (match, key) {
        return values && values[key] !== undefined ? String(values[key]) : match
      })
    }

    function api(path) {
      const relative = String(path || '').replace(/^\/+/, '')
      if (typeof document === 'undefined') return '/' + relative
      try {
        return new URL(relative, document.baseURI).pathname
      } catch (error) {
        return '/' + relative
      }
    }

    function readNameLanguage(hostLanguage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY)
        if (saved === 'zh' || saved === 'en') return saved
      } catch (error) {
        // Storage can be unavailable; the host language is a fine default.
      }
      return hostLanguage === 'zh' ? 'zh' : 'en'
    }

    function writeNameLanguage(value) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value)
      } catch (error) {
        // A blocked store only loses the preference, never the page.
      }
    }

    function formatCompact(value) {
      const number = Number(value || 0)
      if (!Number.isFinite(number)) return '0'
      if (number >= 1000000) return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'm'
      if (number >= 1000) return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
      return String(Math.round(number))
    }

    function formatDate(value, lang) {
      if (!value) return ''
      try {
        return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date(value))
      } catch (error) {
        return String(value).slice(0, 10)
      }
    }

    function formatDateTime(value, lang) {
      if (!value) return ''
      try {
        return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(value))
      } catch (error) {
        return String(value).replace('T', ' ').slice(0, 16)
      }
    }

    function initials(skill) {
      const source = String(skill.nameEn || skill.nameZh || skill.slug || '?').trim()
      const first = Array.from(source)[0] || '?'
      return first.toUpperCase()
    }

    const AVATAR_PALETTES = [
      ['#4f6ef7', '#8b5cf6'],
      ['#0ea5e9', '#2563eb'],
      ['#10b981', '#0d9488'],
      ['#f59e0b', '#ea580c'],
      ['#ec4899', '#8b5cf6'],
      ['#14b8a6', '#0ea5e9'],
    ]

    function avatarStyle(namespace) {
      const value = String(namespace || 'global')
      let hash = 0
      for (let index = 0; index < value.length; index += 1) {
        hash = (hash * 31 + value.charCodeAt(index)) >>> 0
      }
      const palette = AVATAR_PALETTES[hash % AVATAR_PALETTES.length]
      return { background: 'linear-gradient(135deg,' + palette[0] + ' 0%,' + palette[1] + ' 100%)' }
    }

    function pageList(total, current) {
      if (total <= 7) {
        const pages = []
        for (let index = 0; index < total; index += 1) pages.push(index)
        return pages
      }
      const pages = [0]
      const start = Math.max(1, current - 1)
      const end = Math.min(total - 2, current + 1)
      if (start > 1) pages.push('gap-start')
      for (let index = start; index <= end; index += 1) pages.push(index)
      if (end < total - 2) pages.push('gap-end')
      pages.push(total - 1)
      return pages
    }

    function Icon(props) {
      const size = props.size || 16
      const children = props.children
      const rest = Object.assign({}, props)
      delete rest.size
      delete rest.children
      return h('svg', Object.assign({
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
      }, rest), children)
    }

    function LogoMark(props) {
      const size = props.size || 20
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 32 32',
        fill: 'none',
        'aria-hidden': 'true',
      },
        h('path', { d: 'M7.5 11.2 16 6.3l8.5 4.9v9.4L16 25.5l-8.5-4.9v-9.4Z', stroke: 'currentColor', strokeWidth: 1.9, strokeLinejoin: 'round' }),
        h('path', { d: 'M7.5 11.2 16 16l8.5-4.8M16 16v9.5', stroke: 'currentColor', strokeWidth: 1.9, strokeLinejoin: 'round' }),
        h('circle', { cx: 25.2, cy: 7.4, r: 2.4, fill: 'currentColor' })
      )
    }

    function SearchIcon(props) {
      return h(Icon, props, h('circle', { cx: 11, cy: 11, r: 7 }), h('path', { d: 'm20 20-3.2-3.2' }))
    }
    function CloseIcon(props) {
      return h(Icon, props, h('path', { d: 'M6 6l12 12M18 6 6 18' }))
    }
    function RefreshIcon(props) {
      return h(Icon, props, h('path', { d: 'M20 11a8 8 0 1 0-2.3 6.3' }), h('path', { d: 'M20 5v6h-6' }))
    }
    function DownloadIcon(props) {
      return h(Icon, props, h('path', { d: 'M12 4v10' }), h('path', { d: 'm8 10 4 4 4-4' }), h('path', { d: 'M5 19h14' }))
    }
    function StarIcon(props) {
      return h(Icon, props, h('path', { d: 'm12 3.8 2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8 2.5-5Z' }))
    }
    function ExternalIcon(props) {
      return h(Icon, props, h('path', { d: 'M14 4h6v6' }), h('path', { d: 'M20 4 11 13' }), h('path', { d: 'M20 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4' }))
    }
    function TagIcon(props) {
      return h(Icon, props, h('path', { d: 'M4 11V5a1 1 0 0 1 1-1h6l9 9-7 7-9-9Z' }), h('circle', { cx: 8, cy: 8, r: 1.3 }))
    }
    function AlertIcon(props) {
      return h(Icon, props, h('path', { d: 'M12 4 3.5 20h17L12 4Z' }), h('path', { d: 'M12 9v5' }), h('path', { d: 'M12 17.2v.1' }))
    }
    function ChevronIcon(props) {
      const direction = props.direction || 'right'
      const rest = Object.assign({}, props)
      delete rest.direction
      if (direction === 'left') {
        return h(Icon, rest, h('path', { d: 'm15 5-7 7 7 7' }))
      }
      return h(Icon, rest, h('path', { d: 'm9 5 7 7-7 7' }))
    }
    function SortIcon(props) {
      return h(Icon, props, h('path', { d: 'M8 5v14' }), h('path', { d: 'm4 9 4-4 4 4' }), h('path', { d: 'M16 19V5' }), h('path', { d: 'm12 15 4 4 4-4' }))
    }
    function EmptyIcon(props) {
      return h(Icon, props, h('circle', { cx: 11, cy: 11, r: 7 }), h('path', { d: 'm20 20-3.2-3.2' }), h('path', { d: 'M8.5 11h5' }))
    }

    function useDebounced(value, delay) {
      const [debounced, setDebounced] = React.useState(value)
      React.useEffect(function () {
        const timer = window.setTimeout(function () { setDebounced(value) }, delay)
        return function () { window.clearTimeout(timer) }
      }, [value, delay])
      return debounced
    }

    function Highlight(props) {
      const text = String(props.text || '')
      const query = String(props.query || '').trim()
      if (!query) return text
      const lower = text.toLowerCase()
      const needle = query.toLowerCase()
      const at = lower.indexOf(needle)
      if (at < 0) return text
      return [
        text.slice(0, at),
        h('mark', { className: 'sh-mark', key: 'match' }, text.slice(at, at + needle.length)),
        text.slice(at + needle.length),
      ]
    }

    function SkillCard(props) {
      const skill = props.skill
      const t = props.t
      const query = props.query
      const nameLang = props.nameLang
      const lang = props.lang
      const primary = nameLang === 'zh' ? skill.nameZh : skill.nameEn
      const secondary = nameLang === 'zh' ? skill.nameEn : skill.nameZh
      const labels = Array.isArray(skill.labels) ? skill.labels : []
      const showSecondary = secondary && secondary !== primary
      const open = function () { props.onOpen(skill) }
      return h('article', {
        className: 'sh-card',
        role: 'button',
        tabIndex: 0,
        'aria-label': t('openSkill') + ': ' + primary,
        onClick: open,
        onKeyDown: function (event) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            open()
          }
        },
      },
        h('div', { className: 'sh-card-top' },
          h('div', { className: 'sh-avatar', style: avatarStyle(skill.namespace), 'aria-hidden': 'true' }, initials(skill)),
          h('div', { className: 'sh-card-title' },
            h('div', { className: 'sh-card-name', lang: nameLang === 'zh' ? 'zh-CN' : 'en' }, h(Highlight, { text: primary, query: query })),
            showSecondary ? h('div', { className: 'sh-card-name-en', lang: nameLang === 'zh' ? 'en' : 'zh-CN' }, h(Highlight, { text: secondary, query: query })) : null
          ),
          h('span', { className: 'sh-ns', title: skill.namespace }, '@' + skill.namespace)
        ),
        h('p', { className: 'sh-summary' }, skill.summary ? h(Highlight, { text: skill.summary, query: query }) : t('noSummary')),
        labels.length ? h('div', { className: 'sh-labels' }, labels.slice(0, 3).map(function (label) {
          return h('span', { className: 'sh-label', key: label.slug }, label.displayName)
        })) : null,
        h('div', { className: 'sh-card-foot' },
          skill.version ? h('span', { className: 'sh-version' }, 'v' + String(skill.version).replace(/^v/i, '')) : null,
          h('span', { className: 'sh-stat', title: t('downloads') }, h(DownloadIcon, { size: 12 }), formatCompact(skill.downloadCount)),
          h('span', { className: 'sh-stat', title: t('stars') }, h(StarIcon, { size: 12 }), formatCompact(skill.starCount)),
          h('span', { className: 'sh-updated' }, formatDate(skill.updatedAt, lang))
        )
      )
    }

    function SkillDetail(props) {
      const skill = props.skill
      const t = props.t
      const lang = props.lang
      const onClose = props.onClose
      const titleId = React.useId()
      const closeRef = React.useRef(null)
      const dialogRef = React.useRef(null)
      const [installState, setInstallState] = React.useState('idle')
      const [installInfo, setInstallInfo] = React.useState(null)
      const [installError, setInstallError] = React.useState('')
      const canInstall = Boolean(skill.version)

      async function installSkill() {
        setInstallState('installing')
        setInstallError('')
        try {
          const response = await fetch(api('/dsh-skillhub/api/install'), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ namespace: skill.namespace, slug: skill.slug }),
          })
          const body = await response.json().catch(function () { return null })
          if (!response.ok || !body || body.ok !== true) {
            throw new Error(body && body.error ? body.error : 'HTTP ' + response.status)
          }
          setInstallInfo(body)
          setInstallState('installed')
        } catch (cause) {
          setInstallError(cause && cause.message ? cause.message : String(cause))
          setInstallState('error')
        }
      }

      React.useEffect(function () {
        const previous = document.activeElement
        if (closeRef.current) closeRef.current.focus()
        return function () {
          if (previous && typeof previous.focus === 'function') previous.focus()
        }
      }, [])

      React.useEffect(function () {
        const onKeyDown = function (event) {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            onClose()
          }
        }
        document.addEventListener('keydown', onKeyDown, true)
        return function () { document.removeEventListener('keydown', onKeyDown, true) }
      }, [onClose])

      function trapFocus(event) {
        if (event.key !== 'Tab' || !dialogRef.current) return
        const nodes = dialogRef.current.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')
        if (!nodes.length) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }

      const dialog = h('div', {
        className: 'sh-overlay',
        role: 'presentation',
        onMouseDown: function (event) {
          if (event.target === event.currentTarget) onClose()
        },
        onKeyDown: trapFocus,
      },
        h('div', {
          className: 'sh-dialog',
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': titleId,
          ref: dialogRef,
        },
          h('div', { className: 'sh-dialog-head' },
            h('div', { className: 'sh-avatar', style: avatarStyle(skill.namespace), 'aria-hidden': 'true' }, initials(skill)),
            h('div', { className: 'sh-dialog-head-text' },
              h('h2', { className: 'sh-dialog-title', id: titleId, lang: props.nameLang === 'zh' ? 'zh-CN' : 'en' }, props.nameLang === 'zh' ? skill.nameZh : skill.nameEn),
              h('p', { className: 'sh-dialog-sub' }, '@' + skill.namespace + ' · ' + (skill.version ? 'v' + String(skill.version).replace(/^v/i, '') : t('noSummary')))
            ),
            h('button', { type: 'button', className: 'sh-icon-btn', ref: closeRef, onClick: onClose, 'aria-label': t('close'), title: t('close') }, h(CloseIcon, { size: 16 }))
          ),
          h('div', { className: 'sh-dialog-body' },
            h('div', { className: 'sh-detail-names' },
              h('div', { className: 'sh-detail-name' },
                h('small', {}, t('nameZhLabel')),
                h('strong', { lang: 'zh-CN' }, skill.nameZh)
              ),
              h('div', { className: 'sh-detail-name' },
                h('small', {}, t('nameEnLabel')),
                h('strong', { lang: 'en' }, skill.nameEn)
              )
            ),
            h('div', { className: 'sh-detail-section' },
              h('h4', {}, t('overview')),
              h('p', { className: 'sh-detail-summary' }, skill.summary || t('noSummary'))
            ),
            h('div', { className: 'sh-detail-section' },
              h('h4', {}, t('stats')),
              h('div', { className: 'sh-stats' },
                h('div', { className: 'sh-stat-card' }, h('strong', {}, formatCompact(skill.downloadCount)), h('span', {}, t('downloads'))),
                h('div', { className: 'sh-stat-card' }, h('strong', {}, formatCompact(skill.starCount)), h('span', {}, t('stars'))),
                h('div', { className: 'sh-stat-card' }, h('strong', {}, skill.ratingCount ? Number(skill.ratingAvg || 0).toFixed(1) : '—'), h('span', {}, t('rating'))),
                h('div', { className: 'sh-stat-card' }, h('strong', {}, skill.version ? 'v' + String(skill.version).replace(/^v/i, '') : '—'), h('span', {}, t('version')))
              )
            ),
            h('div', { className: 'sh-install' },
              h('div', { className: 'sh-install-head' },
                h(DownloadIcon, { size: 16 }),
                h('strong', {}, t('installSection'))
              ),
              h('p', { className: 'sh-install-hint' }, t('installHint')),
              installState === 'confirm'
                ? h('div', { className: 'sh-install-actions' },
                    h('button', { type: 'button', className: 'sh-btn', onClick: function () { setInstallState('idle') } }, t('installCancel')),
                    h('button', { type: 'button', className: 'sh-btn sh-btn-primary', onClick: installSkill }, t('installConfirm'))
                  )
                : installState === 'installing'
                  ? h('div', { className: 'sh-install-actions' },
                      h('button', { type: 'button', className: 'sh-btn sh-btn-primary', disabled: true },
                        h(RefreshIcon, { size: 14, className: 'sh-spin' }),
                        t('installing')
                      )
                    )
                  : installState === 'installed'
                    ? h('div', { className: 'sh-install-success' },
                        h('strong', {}, installInfo && installInfo.alreadyInstalled ? t('alreadyInstalled') : t('installed')),
                        h('div', {}, t('installSuccess')),
                        installInfo && installInfo.path ? h('div', { className: 'sh-install-path' }, t('installPath') + ': ' + installInfo.path) : null
                      )
                    : installState === 'error'
                      ? h('div', { className: 'sh-install-error' },
                          h('strong', {}, t('installFailed')),
                          h('div', {}, installError),
                          h('button', { type: 'button', className: 'sh-btn', onClick: installSkill }, t('installRetry'))
                        )
                      : h('div', { className: 'sh-install-actions' },
                          canInstall
                            ? h('button', { type: 'button', className: 'sh-btn sh-btn-primary', onClick: function () { setInstallState('confirm') } },
                                h(DownloadIcon, { size: 14 }),
                                t('installButton')
                              )
                            : h('span', { className: 'sh-empty-labels' }, t('installNoVersion'))
                        )
            ),
            h('div', { className: 'sh-detail-section' },
              h('h4', {}, t('meta')),
              h('dl', { className: 'sh-kv' },
                h('dt', {}, t('namespace')), h('dd', {}, '@' + skill.namespace),
                h('dt', {}, 'Slug'), h('dd', {}, skill.slug),
                h('dt', {}, t('updated')), h('dd', {}, formatDate(skill.updatedAt, lang)),
                h('dt', {}, t('source')), h('dd', {}, 'skillhub.seeyon.com')
              )
            ),
            h('div', { className: 'sh-dialog-foot' },
              h('span', { className: 'sh-empty-labels' }, t('details')),
              h('a', { className: 'sh-link-btn', href: skill.url, target: '_blank', rel: 'noreferrer noopener' },
                t('openInSkillHub'),
                h(ExternalIcon, { size: 14 })
              )
            )
          )
        )
      )

      if (typeof document === 'undefined' || !document.body) return dialog
      return ReactDOM.createPortal(dialog, document.body)
    }

    function SkillHubPage(props) {
      const t = props.t
      const locale = props.locale
      const localeSnapshot = React.useSyncExternalStore(
        function (callback) { return locale.subscribe(callback) },
        function () { return locale.getSnapshot() },
        function () { return locale.getSnapshot() }
      )
      const lang = String(localeSnapshot && localeSnapshot.active || '').toLowerCase().startsWith('zh') ? 'zh' : 'en'

      const [data, setData] = React.useState(cachedCatalog)
      const [status, setStatus] = React.useState(cachedCatalog ? 'ready' : 'loading')
      const [error, setError] = React.useState(null)
      const [reloadKey, setReloadKey] = React.useState(0)
      const [query, setQuery] = React.useState('')
      const debouncedQuery = useDebounced(query, 160)
      const [label, setLabel] = React.useState('all')
      const [sort, setSort] = React.useState('recommended')
      const [page, setPage] = React.useState(0)
      const [pageSize, setPageSize] = React.useState(24)
      const [nameLang, setNameLangState] = React.useState(function () { return readNameLanguage(lang) })
      const [selected, setSelected] = React.useState(null)
      const rootRef = React.useRef(null)
      const searchRef = React.useRef(null)

      function setNameLang(value) {
        setNameLangState(value)
        writeNameLanguage(value)
      }

      React.useEffect(function () {
        const controller = new AbortController()
        let alive = true
        setError(null)
        setStatus(cachedCatalog ? 'refreshing' : 'loading')
        const params = new URLSearchParams()
        if (label !== 'all') params.set('label', label)
        if (reloadKey > 0) params.set('refresh', '1')
        const search = params.toString()
        const url = api('/dsh-skillhub/api/catalog') + (search ? '?' + search : '')
        fetch(url, { signal: controller.signal, cache: 'no-store', headers: { accept: 'application/json' } })
          .then(function (response) {
            return response.json().catch(function () { return null }).then(function (body) {
              if (!response.ok || !body || body.ok !== true) {
                throw new Error(body && body.error ? body.error : 'HTTP ' + response.status)
              }
              return body
            })
          })
          .then(function (body) {
            if (!alive) return
            cachedCatalog = body
            setData(body)
            setStatus('ready')
            setError(null)
          })
          .catch(function (cause) {
            if (!alive || (cause && cause.name === 'AbortError')) return
            setError(cause && cause.message ? cause.message : String(cause))
            const cachedLabel = cachedCatalog ? (cachedCatalog.label || 'all') : null
            setStatus(cachedLabel === label ? 'ready' : 'error')
          })
        return function () {
          alive = false
          controller.abort()
        }
      }, [reloadKey, label])

      React.useEffect(function () { setPage(0) }, [debouncedQuery, label, sort, pageSize])

      const items = data && Array.isArray(data.items) ? data.items : []
      const labels = data && Array.isArray(data.labels) ? data.labels : []

      const visibleLabels = labels

      const filtered = React.useMemo(function () {
        const needle = debouncedQuery.trim().toLowerCase().replace(/^@/, '')
        let next = items
        if (needle) {
          next = next.filter(function (skill) {
            const haystack = [
              skill.nameZh,
              skill.nameEn,
              skill.displayName,
              skill.slug,
              skill.summary,
              skill.namespace,
              (Array.isArray(skill.labels) ? skill.labels : []).map(function (entry) { return entry.displayName }).join(' '),
            ].join(' ').toLowerCase()
            return haystack.indexOf(needle) >= 0
          })
        }
        if (sort === 'downloads') {
          next = next.slice().sort(function (left, right) { return Number(right.downloadCount || 0) - Number(left.downloadCount || 0) })
        } else if (sort === 'newest') {
          next = next.slice().sort(function (left, right) { return Date.parse(right.updatedAt || 0) - Date.parse(left.updatedAt || 0) })
        } else if (sort === 'name') {
          const key = nameLang === 'zh' ? 'nameZh' : 'nameEn'
          next = next.slice().sort(function (left, right) {
            return String(left[key] || '').localeCompare(String(right[key] || ''), nameLang === 'zh' ? 'zh-CN' : 'en', { numeric: true, sensitivity: 'base' })
          })
        }
        return next
      }, [items, debouncedQuery, label, sort, nameLang])

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
      const safePage = Math.min(page, totalPages - 1)
      const pageItems = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize)
      const pages = pageList(totalPages, safePage)

      function goPage(nextPage) {
        setPage(Math.max(0, Math.min(nextPage, totalPages - 1)))
        if (rootRef.current && typeof rootRef.current.scrollTo === 'function') {
          rootRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }

      function refresh() {
        setReloadKey(function (value) { return value + 1 })
      }

      function clearFilters() {
        setQuery('')
        setLabel('all')
        setSort('recommended')
        setPage(0)
        if (searchRef.current) searchRef.current.focus()
      }

      const hasFilters = query.trim().length > 0 || label !== 'all'
      const categoryLoading = Boolean(data) && (data.label || 'all') !== label
      const countText = categoryLoading
        ? t('loading')
        : hasFilters
          ? interpolate(t('filteredCount'), { n: filtered.length, total: items.length })
          : interpolate(t('totalCount'), { n: items.length })
      const loading = (status === 'loading' && !data) || (categoryLoading && status !== 'error')
      const refreshing = status === 'refreshing'

      return h('div', { className: 'dsh-skillhub-root', ref: rootRef },
        h('div', { className: 'sh-shell' },
          h('header', { className: 'sh-header' },
            h('div', { className: 'sh-brand' },
              h('div', { className: 'sh-logo' }, h(LogoMark, { size: 26 })),
              h('div', { className: 'sh-brand-text' },
                h('h1', { className: 'sh-title' }, t('title')),
                h('p', { className: 'sh-subtitle' }, t('subtitle'))
              )
            ),
            h('div', { className: 'sh-actions' },
              h('div', { className: 'sh-seg', role: 'group', 'aria-label': t('nameLanguage') },
                h('button', { type: 'button', 'data-active': nameLang === 'zh', 'aria-pressed': nameLang === 'zh', onClick: function () { setNameLang('zh') } }, t('nameZh')),
                h('button', { type: 'button', 'data-active': nameLang === 'en', 'aria-pressed': nameLang === 'en', onClick: function () { setNameLang('en') } }, t('nameEn'))
              ),
              h('button', {
                type: 'button',
                className: 'sh-icon-btn',
                onClick: refresh,
                disabled: refreshing,
                title: refreshing ? t('refreshing') : t('refresh'),
                'aria-label': refreshing ? t('refreshing') : t('refresh'),
              }, h(RefreshIcon, { size: 16, className: refreshing ? 'sh-spin' : undefined }))
            )
          ),
          h('div', { className: 'sh-search' },
            h(SearchIcon, { size: 17 }),
            h('input', {
              ref: searchRef,
              type: 'search',
              value: query,
              placeholder: t('searchPlaceholder'),
              'aria-label': t('searchLabel'),
              spellCheck: false,
              autoComplete: 'off',
              onChange: function (event) { setQuery(event.target.value) },
            }),
            query ? h('button', {
              type: 'button',
              className: 'sh-search-clear',
              onClick: function () { setQuery(''); if (searchRef.current) searchRef.current.focus() },
              title: t('clearSearch'),
              'aria-label': t('clearSearch'),
            }, h(CloseIcon, { size: 14 })) : null
          ),
          h('div', { className: 'sh-toolbar' },
            h('div', { className: 'sh-chips', role: 'group', 'aria-label': t('labels') },
              h('button', {
                type: 'button',
                className: 'sh-chip',
                'data-active': label === 'all',
                'aria-pressed': label === 'all',
                onClick: function () { setLabel('all') },
              }, t('all')),
              visibleLabels.map(function (entry) {
                return h('button', {
                  type: 'button',
                  className: 'sh-chip',
                  key: entry.slug,
                  'data-active': label === entry.slug,
                  'aria-pressed': label === entry.slug,
                  onClick: function () { setLabel(entry.slug) },
                }, entry.displayName, h('span', { className: 'sh-chip-count' }, String(entry.count || 0)))
              })
            ),
            h('label', { className: 'sh-sort' },
              h(SortIcon, { size: 14 }),
              h('span', {}, t('sortLabel')),
              h('select', {
                value: sort,
                'aria-label': t('sortLabel'),
                onChange: function (event) { setSort(event.target.value) },
              },
                h('option', { value: 'recommended' }, t('sortRecommended')),
                h('option', { value: 'downloads' }, t('sortDownloads')),
                h('option', { value: 'newest' }, t('sortNewest')),
                h('option', { value: 'name' }, t('sortName'))
              )
            )
          ),
          h('div', { className: 'sh-meta' },
            h('span', {}, countText),
            data && data.fetchedAt ? h('span', { className: 'sh-meta-right' },
              h('span', {}, t('fetchedAt') + ' ' + formatDateTime(data.fetchedAt, lang))
            ) : null
          ),
          data && data.stale && !error ? h('div', { className: 'sh-banner' },
            h(AlertIcon, { size: 15 }),
            h('span', {}, t('stale')),
            h('button', { type: 'button', onClick: refresh }, t('retry'))
          ) : null,
          error && data && status !== 'error' ? h('div', { className: 'sh-banner' },
            h(AlertIcon, { size: 15 }),
            h('span', {}, t('stale')),
            h('button', { type: 'button', onClick: refresh }, t('retry'))
          ) : null,
          loading ? h('div', { className: 'sh-grid' }, Array.from({ length: 8 }, function (_, index) {
            return h('div', { className: 'sh-card sh-skeleton', key: index, 'aria-hidden': 'true' },
              h('div', { className: 'sh-sk-top' },
                h('div', { className: 'sh-sk-avatar' }),
                h('div', { className: 'sh-sk-title' }, h('div', { className: 'sh-sk-line' }), h('div', { className: 'sh-sk-line' }))
              ),
              h('div', { className: 'sh-sk-line wide' }),
              h('div', { className: 'sh-sk-line medium' }),
              h('div', { className: 'sh-sk-line short' }),
              h('div', { className: 'sh-sk-foot' }, h('div', { className: 'sh-sk-line' }), h('div', { className: 'sh-sk-line' }))
            )
          })) : null,
          !loading && status === 'error' ? h('div', { className: 'sh-state' },
            h('div', { className: 'sh-state-icon' }, h(AlertIcon, { size: 22 })),
            h('h3', {}, t('errorTitle')),
            h('p', {}, error || t('errorHint')),
            h('button', { type: 'button', className: 'sh-btn sh-btn-primary', onClick: refresh }, t('retry'))
          ) : null,
          !loading && status !== 'error' && filtered.length === 0 ? h('div', { className: 'sh-state' },
            h('div', { className: 'sh-state-icon' }, h(EmptyIcon, { size: 22 })),
            h('h3', {}, hasFilters ? t('emptyTitle') : t('emptySourceTitle')),
            h('p', {}, hasFilters ? t('emptyHint') : t('emptySourceHint')),
            hasFilters ? h('button', { type: 'button', className: 'sh-btn', onClick: clearFilters }, t('clearFilters')) : null
          ) : null,
          !loading && status !== 'error' && filtered.length > 0 ? h('div', { className: 'sh-grid' },
            pageItems.map(function (skill) {
              return h(SkillCard, {
                key: String(skill.id || skill.slug),
                skill: skill,
                t: t,
                lang: lang,
                nameLang: nameLang,
                query: debouncedQuery,
                onOpen: setSelected,
              })
            })
          ) : null,
          !loading && status !== 'error' && filtered.length > 0 ? h('div', { className: 'sh-pager' },
            h('span', {}, interpolate(t('pageOf'), { page: safePage + 1, total: totalPages })),
            h('div', { className: 'sh-pager-pages' },
              h('button', { type: 'button', className: 'sh-page-btn', disabled: safePage === 0, onClick: function () { goPage(safePage - 1) }, 'aria-label': t('previous') }, h(ChevronIcon, { size: 14, direction: 'left' })),
              pages.map(function (entry) {
                if (entry === 'gap-start' || entry === 'gap-end') {
                  return h('span', { className: 'sh-ellipsis', key: entry }, '…')
                }
                return h('button', {
                  type: 'button',
                  className: 'sh-page-btn',
                  key: entry,
                  'data-active': entry === safePage,
                  'aria-current': entry === safePage ? 'page' : undefined,
                  onClick: function () { goPage(entry) },
                }, String(entry + 1))
              }),
              h('button', { type: 'button', className: 'sh-page-btn', disabled: safePage >= totalPages - 1, onClick: function () { goPage(safePage + 1) }, 'aria-label': t('next') }, h(ChevronIcon, { size: 14, direction: 'right' }))
            ),
            h('label', { className: 'sh-per-page' },
              h('span', {}, t('perPage')),
              h('select', { value: pageSize, onChange: function (event) { setPageSize(Number(event.target.value)) }, 'aria-label': t('perPage') },
                h('option', { value: 12 }, '12'),
                h('option', { value: 24 }, '24'),
                h('option', { value: 48 }, '48')
              )
            )
          ) : null
        ),
        selected ? h(SkillDetail, { skill: selected, t: t, lang: lang, nameLang: nameLang, onClose: function () { setSelected(null) } }) : null
      )
    }

    function apply(ctx) {
      ctx.effect(function () {
        return ctx.locale.register(NS, { zh: Object.assign({}, DICTS.zh, INSTALL_DICTS.zh), en: Object.assign({}, DICTS.en, INSTALL_DICTS.en) })
      }, NS + ': dictionaries')

      const t = ctx.locale.bind(NS)

      ctx.effect(function () {
        const style = document.createElement('style')
        style.setAttribute('data-dsh-skillhub', 'styles')
        style.textContent = CSS + INSTALL_CSS
        document.head.appendChild(style)
        return function () { style.remove() }
      }, NS + ': styles')

      ctx.slots.inject('main', function () {
        return ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
        }, function () {
          return h(SkillHubPage, { t: t, locale: ctx.locale })
        })
      })

      ctx.slots.inject('sidebar.panellist', function () {
        return ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 2,
          label: function () { return t('panel') },
          locale: NS,
        }, function (owner) {
          return h(LogoMark, { size: owner && owner.size ? owner.size : 16 })
        })
      })
    }

    return {
      name: NS,
      inject: ['slots', 'locale'],
      apply: apply,
    }
  },
});
