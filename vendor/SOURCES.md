# vendor/ 说明（来源与许可）

`vendor/` 下的三份插件代码均为本项目作者自研，**此前未单独公开发布**；除此之外仅内含一个第三方库 `fflate`（见下方「第三方代码」）。
三者本来就以 `@local/dsh-*` 私有包形式存在于作者本机，本仓库是它们唯一的公开发布形态，整体以 MIT 分发（见根目录 LICENSE）。

| 目录 | 原始包名 | 作用 | 作者 | 许可 |
| --- | --- | --- | --- | --- |
| `seeyon-todo/` | `@local/dsh-seeyon-todo` | 致远 OA 待办 / 会议台：待办列表、按优先级分组、在 DSH 内置浏览器打开表单、表单助手注入 | 本项目作者 | MIT（随本仓库） |
| `dsh-skillhub/` | `@local/dsh-skillhub` | 致远 SkillHub 技能市场面板：目录浏览、搜索、安装 | 本项目作者 | MIT（随本仓库） |
| `dsh-vpn/` | `@local/dsh-vpn` | 深信服 aTrust VPN 一键登录：内置浏览器登录页、自动填表、隧道状态判定 | 本项目作者 | MIT（随本仓库） |

## 第三方代码

| 路径 | 项目 | 许可 | 许可原文 |
| --- | --- | --- | --- |
| `dsh-skillhub/vendor/fflate.mjs` | [fflate](https://github.com/101arrowz/fflate) | MIT，© 2023 Arjun Barrett | `dsh-skillhub/vendor/fflate-LICENSE` |

该文件仅用于 SkillHub 面板的 zip 解包，未做修改。

## 与独立安装的关系

三份代码的 Host 半会注册 `/seeyon-todo/api`、`/dsh-skillhub/api`、`/vpn/api` 三组路由。
如果同时把这三个插件作为独立 bundle 安装，会与本仓库重复注册同一批路由，因此：

**本仓库内含的这三块实现与独立安装的三个插件二选一，不可同装。**

## 为什么是拷贝而不是依赖

这三个包从未发布到 npm（私有 `@local` 作用域），无法作为 npm 依赖引用。
客户端部分还涉及一处跨插件的挂载适配（接手其它插件 Client 的 `main` 槽），把宿主代码固定在仓库内更可复现。
