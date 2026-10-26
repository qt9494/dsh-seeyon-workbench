# dsh-seeyon-workbench

一个面板装下致远的三件事：**OA 待办 / 会议**、**SkillHub 技能市场**、**VPN 一键穿透**。

One panel for Seeyon work: OA to-dos & meetings, the SkillHub skill catalog, and one-click aTrust VPN.

## 界面

    ┌──────────────────────────────────────────────┐
    │ 致远工作台                              [• VPN] │
    ├──────────────────────────────────────────────┤
    │ 待办   会议   skillhub   ··· 新建协同 主页 刷新 设置 │
    ├──────────────────────────────────────────────┤
    │ 内容                                          │
    └──────────────────────────────────────────────┘

- **待办 / 会议**：待办台整块挂进来，右侧那组小字转发的就是它自带的操作（新建表单 / 主页 / 刷新 / 设置）
- **skillhub**：技能面板保持自身布局，只隐藏品牌块
- **VPN**：右上角按钮进入 VPN 视图，内置浏览器打开 aTrust 登录页、自动填表并点击登录，以隧道拿到内网地址为成功判据
## 原理

**Host**：`vendor/` 里是三份宿主模块的原样拷贝，`index.js` 依次 `apply(ctx)`；路由与配置目录（`~/.dsh/seeyon-todo`、`~/.dsh/vpn`）保持不变。

**Client**：`client.js` 由 `build.mjs` 拼装。头部接管 `window.__ModuleLoader__.load`，只截获这三个插件的 Client 注册（其它插件原样放行），再用一套只接管 `main` 槽的假 `ctx` 把旧面板实例化，渲染进工作台内容区。

## 安装

    dsh plugin --profile web add github:OWNER/dsh-seeyon-workbench

或在 DSH 的 设置 → 插件 里安装本地包，重启 DSH。

> 工作台接管了 `@local/dsh-seeyon-todo` / `@local/dsh-skillhub` / `@local/dsh-vpn` 的全部接口；如果这三个仍作为 bundle 加载，路由会重复注册，需要先移除。

## 构建

    node build.mjs

改了 `src/ui.js` 或 `vendor/*/client.js` 之后重跑即可。

## 配置

| 项 | 位置 |
| --- | --- |
| OA 网关、MCP 授权码 | OA 二级条「设置」 |
| VPN 服务器 / 账号 / 密码 / 成功判定探针 | VPN 视图「设置」 |

VPN 密码用 Windows DPAPI 加密后存 `~/.dsh/vpn/config.json`，只有当前 Windows 用户能解。

## 排障

| 现象 | 处理 |
| --- | --- |
| 面板空白「没加载出来」 | 被挂载插件的 Client 没进 bundle，检查 `vendor/` 与 `build.mjs` |
| OA 按钮点不动 | 面板 `.st-actions .st-btn` 顺序变了，按新顺序改 `clickAction(n)` |
| VPN 登录页白屏 | webview 不能放进带 filter/transform/滚动裁剪的容器，VPN 视图固定 `overflow:hidden` |
| VPN 已连但显示未连接 | 探针必须是 `host:port`，脏值会让判定失败 |

## 来源与许可

`vendor/` 下三份代码（OA 待办台、SkillHub 面板、aTrust VPN）均为本项目作者自研，此前未单独公开发布，
未包含任何第三方代码，随本仓库以 MIT 分发。逐项说明见 [`vendor/SOURCES.md`](vendor/SOURCES.md)。

> 这三块实现与独立安装的同名插件**二选一，不可同装** —— Host 半会注册同一批路由，重复安装会冲突。

## 许可

本项目以 **MIT** 发布，完整条款见 [LICENSE](LICENSE)。

`vendor/` 下的三份代码（OA 待办台、SkillHub 面板、aTrust VPN）均为本项目作者自研，以同一 MIT 条款随本仓库分发；
其中 `vendor/dsh-skillhub/vendor/fflate.mjs` 为第三方库 [fflate](https://github.com/101arrowz/fflate)（MIT，© 2023 Arjun Barrett），
许可原文见同目录 `fflate-LICENSE`。逐项说明见 [`vendor/SOURCES.md`](vendor/SOURCES.md)。
