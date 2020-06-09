import type { Plugin } from 'vite'
import { cachedRead } from 'vite'
import * as fs from 'fs-extra'
import * as path from 'path'
import { extract, parse } from 'jest-docblock'

import { findPages } from './findPages'
import { resolvePageFile } from './resolvePageFile'
import { resolvePageLayout } from './resolvePageLayout'
import { CLIENT_PATH } from './constants'

export const configureServer = (
  _pagesDirPath?: string
): Plugin['configureServer'] => ({ app, resolver, root }) => {
  const pagesDirPath = (() => {
    if (_pagesDirPath) return _pagesDirPath
    const pagesPath = path.join(root, 'pages')
    if (fs.existsSync(pagesPath) && fs.statSync(pagesPath).isDirectory())
      return pagesPath
    return root
  })()

  app.use(async (ctx, next) => {
    if (ctx.path === '/@generated/pages') {
      const pages = await findPages(pagesDirPath)
      const pagesCode = await Promise.all(
        pages.map(async (p) => {
          const pageFilePath = await resolvePageFile(p, pagesDirPath)
          if (!pageFilePath) throw new Error(`can't resolve page. "${p}"`)
          const pageCode = await fs.readFile(pageFilePath, 'utf-8')
          const docCode = extract(pageCode)
          const pageMeta = parse(docCode)
          const path = `/${p}`
          const loadPath = `/@generated/pages/${p}`
          return `pages["${path}"] = {
              importFn: () => import(${JSON.stringify(loadPath)}),
              staticData: ${JSON.stringify(pageMeta)},
          };`
        })
      )
      ctx.body = `const pages = {};
${pagesCode.join('\n')}
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

      ctx.body = `
import * as pageData from "${pageFilePublicPath}";
import renderPage from "${layoutPublicPath}";
export {
  pageData,
  renderPage,
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
