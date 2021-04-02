import slash from 'slash'
import type { PagesData } from './PagesData'

export async function renderPageList(pagesData: PagesData, isBuild: boolean) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { staticData }]) => {
      let subPath = pageId
      if (subPath === '/') {
        // import("/@react-pages/pages/") would make vite confused
        // so we change the sub path
        subPath = '/__index'
      }
      const dataModulePath = `/@react-pages/pages${subPath}`
      let code = `
pages["${pageId}"] = {};
pages["${pageId}"].data = () => import("${dataModulePath}");
pages["${pageId}"].staticData = ${JSON.stringify(staticData)};`
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
        subPath = '/__index'
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
