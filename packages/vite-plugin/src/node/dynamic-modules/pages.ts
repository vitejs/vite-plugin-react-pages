import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import globby from 'globby'

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
        const pageCode = await fs.readFile(pageFilePath, 'utf-8')
        let staticData
        if (/\.mdx?/.test(pageFilePath)) {
          const { data: frontmatter } = grayMatter(pageCode)
          staticData = { ...frontmatter, sourceType: 'md' }
        } else {
          staticData = { ...parse(extract(pageCode)), sourceType: 'js' }
        }
        return [pagePath, { staticData }]
      }
    )
  )
  return Object.fromEntries(pageDataEntries)
}

export async function dynamicImportPagesData(pagesData: IPagesData) {
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
             _importFn: () => import("${loadPath}"),
             staticData: ${JSON.stringify(staticData)},
         };`
    }
  )
  return `const pages = {};
${codeLines.join('\n')}
export default pages;`
}

export async function staticImportPagesData(pagesData: IPagesData) {
  const codeLines = Object.keys(pagesData).map((pagePath, index) => {
    const loadPath = `/@generated/pages${
      pagePath === '/' ? '/__rootIndex__' : pagePath
    }`
    return `
import * as page${index} from "${loadPath}";
pages["${pagePath}"] = page${index};`
  })
  return `
export const ssrData = {};
const pages = ssrData.pages = {};
${codeLines.join('\n')}
`
}

async function findPages(root: string) {
  const pageFiles: string[] = await globby('**/*$.{md,mdx,js,jsx,ts,tsx}', {
    cwd: root,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })
  const pages = pageFiles.map((pageFile) => {
    let pagePath = pageFile.replace(/\$\.(md|mdx|js|jsx|ts|tsx)$/, '')
    pagePath = pagePath.replace(/index$/, '')
    pagePath = pagePath.replace(/\/$/, '')
    // ensure starting slash
    return `/${pagePath}`
  })
  return pages
}
