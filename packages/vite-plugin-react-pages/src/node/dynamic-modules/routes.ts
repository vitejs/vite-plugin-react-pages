import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import globby from 'globby'

import { resolvePageTheme } from './utils/resolvePageTheme'

export interface IDynamicRoutes {}

export type IPageFiles = {
  publicPath: string
  filePath: string
  themeFilePath: string
}[]

export interface IPagesData {
  [publicPath: string]: {
    staticData: any
    themePublicPath: string
    loadPath: string
  }
}

export async function collectPagesData(
  findPageFiles: string | (() => Promise<IPageFiles>),
  fileToRequest: (file: string) => string
): Promise<IPagesData> {
  let pageFiles: IPageFiles
  if (typeof findPageFiles === 'function') {
    pageFiles = await findPageFiles()
  } else if (typeof findPageFiles === 'string') {
    pageFiles = await defaultFindPageFiles(findPageFiles)
  } else {
    throw new Error('invalid findPageFiles')
  }
  const pageDataEntries = await Promise.all(
    pageFiles.map(
      async ({
        publicPath,
        filePath,
        themeFilePath,
      }): Promise<
        [string, { staticData: any; themePublicPath: string; loadPath: string }]
      > => {
        const staticData = await getStaticDataFromPageFile(filePath)
        const themePublicPath = fileToRequest(themeFilePath)
        // if this is the root index page: /$.tsx or /$/index.tsx
        // give it a different loadPath
        // otherwise it will have loadPath '/@generated/pages/'
        // which will make vite confused when rewriting import
        let loadPath: string
        if (publicPath === '/') {
          loadPath = `/@generated/pages/__rootIndex__`
        } else {
          loadPath = `/@generated/pages${publicPath}`
        }
        return [publicPath, { staticData, themePublicPath, loadPath }]
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

export async function defaultFindPageFiles(
  pagesDirPath: string
): Promise<IPageFiles> {
  const pageFiles: string[] = await globby('**/*$.{md,mdx,js,jsx,ts,tsx}', {
    cwd: pagesDirPath,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })
  return Promise.all(
    pageFiles.map(async (filePath) => {
      const publicPath = getPagePublicPath(filePath)
      const themeFilePath = await resolvePageTheme(filePath, pagesDirPath)
      return {
        publicPath,
        filePath,
        themeFilePath,
      }
    })
  )
}

function getPagePublicPath(pageFilePath: string) {
  let pagePublicPath = pageFilePath.replace(/\$\.(md|mdx|js|jsx|ts|tsx)$/, '')
  pagePublicPath = pagePublicPath.replace(/index$/, '')
  // ensure starting slash
  pagePublicPath = pagePublicPath.replace(/\/$/, '')
  pagePublicPath = `/${pagePublicPath}`
  return pagePublicPath
}

async function getStaticDataFromPageFile(pageFilePath: string) {
  const pageCode = await fs.readFile(pageFilePath, 'utf-8')
  if (/\.mdx?/.test(pageFilePath)) {
    const { data: frontmatter } = grayMatter(pageCode)
    return { ...frontmatter, sourceType: 'md' }
  } else {
    return { ...parse(extract(pageCode)), sourceType: 'js' }
  }
}
