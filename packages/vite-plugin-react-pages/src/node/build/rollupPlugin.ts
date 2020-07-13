import type { Plugin } from 'vite'

import {
  collectPagesData,
  renderPagesDataDynamic,
  renderSSRPagesData
} from '../dynamic-modules/routes'
import type { IPagesData } from '../dynamic-modules/routes'
import onePage from '../dynamic-modules/onePage'
import { analyzeSourceCode } from '../dynamic-modules/analyzeSourceCode'

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
    async resolveId(importee, importer) {
      if (importee === '/@generated/pages') {
        return importee
      }
      if (importee.startsWith('/@generated/pages/')) {
        return importee
      }
      if (importee.startsWith('/@generated/ssrData')) {
        return importee
      }
      if (importee.endsWith('?analyzeSource')) {
        const path = importee.replace(/\?analyzeSource$/, '')
        const absPath = await this.resolve(path, importer)
        if (!absPath?.id) {
          throw new Error(`can not resolve importee: "${importee}"`)
        }
        return `${absPath.id}?analyzeSource`
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
      if (id.endsWith('?analyzeSource')) {
        const filePath = id.replace(/\?analyzeSource$/, '')
        const result = await analyzeSourceCode(filePath)
        return `export default ${JSON.stringify(result)}`
      }
    },
  }
}
