import type { Plugin } from 'vite'
import { cachedRead } from 'vite'
import * as path from 'path'

import { CLIENT_PATH } from './constants'
import pages from './dynamic-modules/pages'
import onePage from './dynamic-modules/onePage'

export const configureServer = (
  pagesDirPath: string
): Plugin['configureServer'] => ({ app, resolver }) => {
  app.use(async (ctx, next) => {
    if (ctx.path === '/@generated/pages') {
      ctx.body = await pages(pagesDirPath)
      ctx.type = 'js'
      ctx.status = 200
      await next()
    } else if (ctx.path.startsWith('/@generated/pages/')) {
      let page = ctx.path.slice('/@generated/pages/'.length)
      const code = await onePage(page, pagesDirPath, (file) =>
        resolver.fileToRequest(file)
      )
      if (!code) {
        ctx.status = 404
        return
      }
      ctx.body = code
      ctx.type = 'js'
      await next()
    } else {
      await next()
    }
  })

  app.use(async (ctx, next) => {
    await next()
    // serve our index.html after vite history fallback
    if (ctx.url.endsWith('.html')) {
      await cachedRead(ctx, path.join(CLIENT_PATH, 'index.html'))
      ctx.status = 200
    }
  })
}
