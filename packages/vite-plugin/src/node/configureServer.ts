import type { Plugin } from 'vite'
import { cachedRead } from 'vite'
import * as fs from 'fs-extra'
import * as path from 'path'

import { findPages } from './findPages'
import { resolvePageFile } from './resolvePageFile'
import { resolvePageConfig } from './resolvePageConfig'
import { CLIENT_PATH } from './constants'

export const configureServer: (
  pagesDirPath: string
) => Plugin['configureServer'] = (pagesDirPath: string) => ({
  app,
  resolver,
}) => {
  app.use(async (ctx, next) => {
    if (ctx.path === '/@generated/pages') {
      const pages = await findPages(pagesDirPath)
      const pagesCode = pages
        .map((p, index) => {
          const path = `/${p}`
          const loadPath = `/@generated/pages/${p}`
          return `pages["${path}"] = {importFn: () => import("${loadPath}")};`
        })
        .join('\n')
      ctx.body = `const pages = {};
${pagesCode}
export default pages;`
      ctx.type = 'js'
      ctx.status = 200
      await next()
    } else if (ctx.path.startsWith('/@generated/pages/')) {
      const page = ctx.path.slice('/@generated/pages/'.length)
      const resolvedFilePath = await resolvePageFile(
        page,
        pagesDirPath
      )
      if (!resolvedFilePath || !fs.existsSync(resolvedFilePath)) {
        ctx.status = 404
        return
      }
      const actualModulePath = resolver.fileToRequest(resolvedFilePath)
      ctx.body = `export { default } from "${actualModulePath}";
export * from "${actualModulePath}";`
      ctx.type = 'js'
      await next()
    } else if (ctx.path === '/page-config' && ctx.query.path) {
      const pageConfigs = await resolvePageConfig(ctx.query.path, pagesDirPath)
      const pageConfigImportExp = pageConfigs
        .map((v) => resolver.fileToRequest(v))
        .map((publicPath, idx) => {
          const varName = `config${idx}`
          return (
            `import ${varName} from "${publicPath}";\n` +
            `configs.push(${varName});`
          )
        })
        .join('\n')
      ctx.body = `export const configs = [];\n${pageConfigImportExp}`
      ctx.type = 'js'
      await next()
    } else if (ctx.path === '/api/pages') {
      ctx.body = {
        pages: await findPages(pagesDirPath),
      }
      ctx.type = 'json'
      ctx.status = 200
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
