import type { Plugin } from 'vite'

import {
  collectPagesData,
  renderPagesDataDynamic,
} from '../dynamic-modules/pages'
import type { IPagesData } from '../dynamic-modules/pages'
import onePage from '../dynamic-modules/onePage'

type RollupPlugin = ArrayItemType<
  NonNullable<NonNullable<Plugin['rollupInputOptions']>['plugins']>
>

type ArrayItemType<Arr extends Array<any>> = Arr extends Array<infer R>
  ? R
  : never

export default (pagesDirPath: string): RollupPlugin => {
  let pagesData: Promise<IPagesData>
  return {
    name: 'vite-pages-dynamic-modules',
    resolveId(importee) {
      if (importee === '/@generated/pages') {
        return importee
      }
      if (importee.startsWith('/@generated/pages/')) {
        return importee
      }
      if (importee.startsWith('/@generated/ssrData')) {
        return importee
      }
    },
    async load(id) {
      if (id === '/@generated/pages') {
        if (!pagesData)
          pagesData = collectPagesData(pagesDirPath, (file) => file)
        return renderPagesDataDynamic(await pagesData)
      }
      if (id.startsWith('/@generated/pages/')) {
        const pagePublicPath = id.slice('/@generated/pages'.length)
        const code = await onePage(pagePublicPath, pagesDirPath, (file) => file)
        if (!code) {
          throw new Error(`can't load "${id}"`)
        }
        return code
      }
      if (id === '/@generated/ssrData') {
        if (!pagesData)
          pagesData = collectPagesData(pagesDirPath, (file) => file)
        return renderSSRPagesData(await pagesData)
      }
    },
  }
}

async function renderSSRPagesData(pagesData: IPagesData) {
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
