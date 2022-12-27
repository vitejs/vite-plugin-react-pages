import slash from 'slash'
import type { PagesData } from './PagesDataKeeper'

export async function renderPageList(pagesData: PagesData, isBuild: boolean) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { staticData }]) => {
      let subPath = pageId
      if (subPath === '/') {
        // import("/@react-pages/pages/") would make vite confused
        // so we change the sub path
        subPath = '/index__'
      }
      const dataModulePath = `/@react-pages/pages${subPath}`
      let code = `
pages["${pageId}"] = {};
pages["${pageId}"].data = () => import("${dataModulePath}");
pages["${pageId}"].staticData = ${JSON.stringify(cleanStaticData(staticData))};`
      return code
    }
  )
  return `
const pages = {};
${addPagesData.join('\n')}
export default pages;
`
}

export async function renderPageListInSSR(pagesData: PagesData) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { staticData }], index) => {
      let subPath = pageId
      if (subPath === '/') {
        // import("/@react-pages/pages/") would make vite confused
        // so we change the sub path
        subPath = '/index__'
      }
      const code = `
pages["${pageId}"] = {};
import page${index} from "/@react-pages/pages${subPath}";
pages["${pageId}"] = page${index};`
      return code
    }
  )
  return `
const pages = {};
${addPagesData.join('\n')}
export default pages;
`
}

export function renderOnePageData(onePageData: { [dataKey: string]: string }) {
  const importModule = Object.entries(onePageData).map(
    ([dataKey, path], idx) => `
import * as m${idx} from "${slash(path)}";
modules["${dataKey}"] = m${idx};`
  )
  return `
  const modules = {};
  ${importModule.join('\n')}
  export default modules;`
}

export function renderAllPagesOutlines(pagesData: PagesData) {
  const res = [] as string[]
  Object.entries(pagesData).map(([pageId, { staticData }], index1) => {
    const outlinesForThisPage = [] as any[]
    // check all data pieces (identified by key within a page) of all pages
    Object.entries(staticData).forEach(([key, dataPiece], index2) => {
      if (dataPiece?.sourceType === 'md' && dataPiece.__sourceFilePath) {
        // collect outline info of markdown pages
        const varName = `pageOutline_${index1}_${index2}`
        outlinesForThisPage.push({
          key,
          varName,
          importOutlineInfo: `import * as ${varName} from ${JSON.stringify(
            dataPiece.__sourceFilePath + '?outlineInfo'
          )}`,
        })
      }
    })
    if (outlinesForThisPage.length === 0) return
    res.push(`allPagesOutlines["${pageId}"] = {};`)
    outlinesForThisPage.forEach(({ key, varName, importOutlineInfo }) => {
      res.push(importOutlineInfo)
      res.push(`allPagesOutlines["${pageId}"]["${key}"] = ${varName};`)
    })
  })
  return `
export const allPagesOutlines = {};
${res.join('\n')}
`
}

// filter out internal data field in staticData
// don't leak them into build output assets
function cleanStaticData(staticData: any) {
  if (!staticData || typeof staticData !== 'object') return staticData
  return Object.fromEntries(
    Object.entries(staticData).map(([key, value]: [string, any]) => {
      if (value?.__sourceFilePath)
        return [
          key,
          {
            ...value,
            __sourceFilePath: undefined,
          },
        ]
      return [key, value]
    })
  )
}
