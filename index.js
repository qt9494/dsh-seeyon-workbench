/**
 * 致远工作台 — Host 半。
 *
 * 不自建接口：把三个插件（待办台 / skillhub / VPN）的 Host 模块原样 vendor 进来，
 * 在这里统一 apply，路由、配置目录、凭据全部沿用原实现。
 */

import * as todo from './vendor/seeyon-todo/index.js'
import * as skillhub from './vendor/dsh-skillhub/index.js'
import * as vpn from './vendor/dsh-vpn/index.js'

export const name = 'dsh-seeyon-workbench'
export const inject = ['webServer']

export function apply(ctx) {
  const parts = [todo, skillhub, vpn]
  for (const part of parts) {
    if (!part || typeof part.apply !== 'function') continue
    try {
      part.apply(ctx)
    } catch (error) {
      // 单个模块起不来不能拖垮整个工作台
      ctx.logger?.warn?.('[workbench] ' + (part.name || 'module') + ' failed: ' + error)
    }
  }
}
