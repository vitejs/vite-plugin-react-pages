import { Plugin } from 'vite'
import * as fs from 'fs-extra'

import { findPages } from './findPages'
import { resolvePageFile } from './resolvePageFile'
import { resolvePageConfig } from './resolvePageConfig'

export const configureServer: (
  pagesDirPath: string
) => Plugin['configureServer'] = (pagesDirPath: string) => ({
  app,
  resolver,
}) => {
  app.use(async (ctx, next) => {
    if (ctx.path === '/proxy-module' && ctx.query.path) {
      const resolvedFilePath = await resolvePageFile(
        ctx.query.path,
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
}
