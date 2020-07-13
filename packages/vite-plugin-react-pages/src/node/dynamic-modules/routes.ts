import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import globby from 'globby'

import { resolvePageFile } from './utils/resolvePageFile'
import { resolvePageTheme } from './utils/resolvePageTheme'

export interface IPagesData {
  [path: string]: {
    staticData: any
    themePublicPath: string
    loadPath: string
  }
}

export async function collectPagesData(
  pagesDirPath: string,
  fileToRequest: (file: string) => string
): Promise<IPagesData> {
  const pagePaths = await findPages(pagesDirPath)
  const pageDataEntries = await Promise.all(
    pagePaths.map(
      async (
        pagePath
      ): Promise<
        [string, { staticData: any; themePublicPath: string; loadPath: string }]
      > => {
        const pageFilePath = await resolvePageFile(pagePath, pagesDirPath)

        const themeFilePath = await resolvePageTheme(pageFilePath, pagesDirPath)
        const themePublicPath = fileToRequest(themeFilePath)

        // if this is the root index page: /$.tsx or /$/index.tsx
        // give it a different loadPath
        // otherwise it will have loadPath '/@generated/pages/'
        // which will make vite confused when rewriting import
        let loadPath: string
        if (pagePath === '/') {
          loadPath = `/@generated/pages/__rootIndex__`
        } else {
          loadPath = `/@generated/pages${pagePath}`
        }

        const staticData = await (async () => {
          const pageCode = await fs.readFile(pageFilePath, 'utf-8')
          if (/\.mdx?/.test(pageFilePath)) {
            const { data: frontmatter } = grayMatter(pageCode)
            return { ...frontmatter, sourceType: 'md' }
          } else {
            return { ...parse(extract(pageCode)), sourceType: 'js' }
          }
        })()

        return [pagePath, { staticData, themePublicPath, loadPath }]
      }
    )
  )
  return Object.fromEntries(pageDataEntries)
}

export async function renderPagesDataDynamic(pagesData: IPagesData) {
  const codeLines = Object.entries(pagesData).map(
    ([pagePath, { staticData, themePublicPath, loadPath }], index) => {
      return `
import theme${index} from "${themePublicPath}";
pages["${pagePath}"] = {
    _importFn: () => import("${loadPath}"),
    staticData: ${JSON.stringify(staticData)},
    theme: theme${index},
};`
    }
  )
  return `const pages = {};
${codeLines.join('\n')}
export default pages;`
}

export async function renderSSRPagesData(pagesData: IPagesData) {
  const codeLines = Object.entries(pagesData).map(
    ([pagePath, { staticData, themePublicPath, loadPath }], index) => {
      // import page data and theme data statically
      return `
import * as page${index} from "${loadPath}";
ssrData["${pagePath}"] = page${index}.pageData;`
    }
  )
  return `
export const ssrData = {};
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
