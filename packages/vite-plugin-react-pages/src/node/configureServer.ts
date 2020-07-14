import type { Plugin } from 'vite'
import * as path from 'path'

import { CLIENT_PATH } from './constants'
import {
  renderPagesDataDynamic,
  collectPagesData,
  IPageFiles,
  defaultFindPageFiles,
} from './dynamic-modules/routes'
import onePage from './dynamic-modules/onePage'
import { analyzeSourceCode } from './dynamic-modules/analyzeSourceCode'

export const configureServer = (
  findPageFiles: string | (() => Promise<IPageFiles>)
): Plugin['configureServer'] => ({ app, resolver }) => {
  app.use(async (ctx, next) => {
    if (ctx.path === '/@generated/pages') {
      ctx.body = await renderPagesDataDynamic(
        await collectPagesData(findPageFiles, (file) =>
          resolver.fileToRequest(file)
        )
      )
      ctx.type = 'js'
      ctx.status = 200
      await next()
    } else if (ctx.path.startsWith('/@generated/pages/')) {
      const page = ctx.path.slice('/@generated/pages'.length)
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
    } else if ('analyzeSource' in ctx.query) {
      const filePath = resolver.requestToFile(ctx.path)
      const result = await analyzeSourceCode(filePath)
      ctx.body = `export default ${JSON.stringify(result)}`
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
      await ctx.read(path.join(CLIENT_PATH, 'index.html'))
      ctx.status = 200
    }
  })
}
