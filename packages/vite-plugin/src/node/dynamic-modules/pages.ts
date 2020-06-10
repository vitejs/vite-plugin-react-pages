import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'

import { findPages } from './utils/findPages'
import { resolvePageFile } from './utils/resolvePageFile'

export default async function pages(pagesDirPath: string) {
  const pages = await findPages(pagesDirPath)
  const codeLines = await Promise.all(
    pages.map(async (p) => {
      const pageFilePath = await resolvePageFile(p, pagesDirPath)
      if (!pageFilePath) throw new Error(`can't resolve page. "${p}"`)
      const pageCode = await fs.readFile(pageFilePath, 'utf-8')
      let pageMeta
      if (/\.mdx?/.test(pageFilePath)) {
        const { data: frontmatter } = grayMatter(pageCode)
        pageMeta = frontmatter
      } else {
        pageMeta = parse(extract(pageCode))
      }
      const path = `/${p}`
      // if this is the root index page: /$.tsx or /$/index.tsx
      // give it a different loadPath
      // otherwise it will have loadPath '/@generated/pages/'
      // which will make vite confused when rewriting import
      const loadPath = `/@generated/pages/${p ? p : '__rootIndex__'}`
      return `pages["${path}"] = {
              _importFn: () => import(${JSON.stringify(loadPath)}),
              staticData: ${JSON.stringify(pageMeta)},
          };`
    })
  )
  return `const pages = {};
${codeLines.join('\n')}
export default pages;`
}
