import type { Plugin } from 'vite'
import * as fs from 'fs-extra'

import {
  collectPagesData,
  renderPagesDataDynamic,
  renderSSRPagesData,
} from '../dynamic-modules/pages'
import type { IPagesData, IPageFiles } from '../dynamic-modules/pages'
import { analyzeSourceCode } from '../dynamic-modules/analyzeSourceCode'
import { resolveTheme } from '../dynamic-modules/resolveTheme'

type RollupPlugin = ArrayItemType<
  NonNullable<NonNullable<Plugin['rollupInputOptions']>['plugins']>
>

type ArrayItemType<Arr extends Array<any>> = Arr extends Array<infer R>
  ? R
  : never

export default (
  pagesDir: string,
  findPageFiles?: () => Promise<IPageFiles>
): RollupPlugin => {
  let pagesData: Promise<IPagesData>
  const pageFiles: { [pagePublicPath: string]: string } = {}
  return {
    name: 'vite-pages-dynamic-modules',
    async resolveId(importee, importer) {
      if (importee === '/@generated/pages') {
        return importee
      }
      if (importee === '/@generated/theme') {
        return importee
      }
      if (importee.startsWith('/@generated/ssrData')) {
        return importee
      }
      const matchPageEntry = importee.match(/\?isPageEntry=(.*)$/)
      if (matchPageEntry) {
        const path = importee.replace(/\?isPageEntry=(.*)$/, '')
        const absPath = await this.resolve(path, importer)
        if (!absPath?.id) {
          throw new Error(`can not resolve importee: "${importee}"`)
        }
        // record page entry file
        const pagePath = matchPageEntry[1]
        pageFiles[pagePath] = absPath.id
        return absPath.id
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
          pagesData = collectPagesData(pagesDir, (file) => file, findPageFiles)
        return renderPagesDataDynamic(await pagesData)
      }
      if (id === '/@generated/theme') {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
      if (id === '/@generated/ssrData') {
        if (!pagesData)
          pagesData = collectPagesData(pagesDir, (file) => file, findPageFiles)
        return renderSSRPagesData(await pagesData)
      }
      if (id.endsWith('?analyzeSource')) {
        const filePath = id.replace(/\?analyzeSource$/, '')
        const result = await analyzeSourceCode(filePath)
        return `export default ${JSON.stringify(result)}`
      }
    },
    async generateBundle(options, bundle) {
      this.emitFile({
        type: 'asset',
        source: JSON.stringify(pageFiles),
        fileName: 'pages-meta.json',
      })
    },
  }
}
