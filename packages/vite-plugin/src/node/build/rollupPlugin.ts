import type { Plugin } from 'vite'

import {
  collectPagesData,
  dynamicImportPagesData,
  staticImportPagesData,
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
        if (!pagesData) pagesData = collectPagesData(pagesDirPath)
        return dynamicImportPagesData(await pagesData)
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
        if (!pagesData) pagesData = collectPagesData(pagesDirPath)
        return staticImportPagesData(await pagesData)
      }
    },
  }
}
