import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'

import { findPages } from './utils/findPages'
import { resolvePageFile } from './utils/resolvePageFile'

export interface IPagesData {
  [path: string]: {
    staticData: any
  }
}

export async function collectPagesData(
  pagesDirPath: string
): Promise<IPagesData> {
  const pagePaths = await findPages(pagesDirPath)
  const pageDataEntries = await Promise.all(
    pagePaths.map(
      async (pagePath): Promise<[string, { staticData: any }]> => {
        const pageFilePath = await resolvePageFile(pagePath, pagesDirPath)
        if (!pageFilePath) throw new Error(`can't resolve page. "${pagePath}"`)
        const pageCode = await fs.readFile(pageFilePath, 'utf-8')
        let staticData
        if (/\.mdx?/.test(pageFilePath)) {
          const { data: frontmatter } = grayMatter(pageCode)
          staticData = { ...frontmatter, sourceType: 'md' }
        } else {
          staticData = { ...parse(extract(pageCode)), sourceType: 'js' }
        }
        return [`/${pagePath}`, { staticData }]
      }
    )
  )
  return Object.fromEntries(pageDataEntries)
}

export async function renderPagesData(pagesData: IPagesData) {
  const codeLines = Object.entries(pagesData).map(
    ([pagePath, { staticData }]) => {
      // if this is the root index page: /$.tsx or /$/index.tsx
      // give it a different loadPath
      // otherwise it will have loadPath '/@generated/pages/'
      // which will make vite confused when rewriting import
      const loadPath = `/@generated/pages${
        pagePath === '/' ? '/__rootIndex__' : pagePath
      }`
      return `pages["${pagePath}"] = {
             _importFn: () => import(${JSON.stringify(loadPath)}),
             staticData: ${JSON.stringify(staticData)},
         };`
    }
  )
  return `const pages = {};
${codeLines.join('\n')}
export default pages;`
}

export default async function pages(pagesDirPath: string) {
  return renderPagesData(await collectPagesData(pagesDirPath))
}
