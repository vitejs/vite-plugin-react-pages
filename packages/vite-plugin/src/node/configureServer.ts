import type { Plugin } from 'vite'
import { cachedRead } from 'vite'
import * as fs from 'fs-extra'
import * as path from 'path'

import { findPages } from './findPages'
import { resolvePageFile } from './resolvePageFile'
import { resolvePageLayout } from './resolvePageLayout'
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
        .map((p) => {
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
      const pageFilePath = await resolvePageFile(page, pagesDirPath)
      if (!pageFilePath || !fs.existsSync(pageFilePath)) {
        ctx.status = 404
        return
      }
      const layoutFilePath = await resolvePageLayout(pageFilePath, pagesDirPath)
      const layoutPublicPath = resolver.fileToRequest(layoutFilePath)
      const pageFilePublicPath = resolver.fileToRequest(pageFilePath)

      ctx.body = `import PageComponent from "${pageFilePublicPath}";
import * as pageData from "${pageFilePublicPath}";
import getLayout from "${layoutPublicPath}";
export {
  PageComponent,
  pageData,
  getLayout,
};
`
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
