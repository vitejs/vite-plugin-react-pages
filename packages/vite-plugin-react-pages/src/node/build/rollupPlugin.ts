import type { Plugin } from 'vite'
import { parseUrl, stringifyUrl } from 'query-string'

import {
  collectPagesData,
  renderPagesDataDynamic,
  renderSSRPagesData,
} from '../dynamic-modules/pages'
import type { IPagesData, IPageFiles } from '../dynamic-modules/pages'
import { analyzeSourceCode } from '../dynamic-modules/analyzeSourceCode'
import { resolveTheme } from '../dynamic-modules/resolveTheme'
import { mergeModules } from '../dynamic-modules/mergeModules'

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
  const composedPages: { [pagePublicPath: string]: string[] } = {}
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
      const parsed = parseUrl(importee)
      if (parsed.query.isPageEntry) {
        const path = parsed.url
        const pagePath = parsed.query.isPageEntry as string
        // this page is composed by multiple files
        if (path === '/@generated/mergeModules') {
          // generate a module id for this composed page entry
          const moduleId = `/@composedPage${pagePath}`
          // record page entry file
          pageFiles[pagePath] = moduleId
          composedPages[pagePath] = parsed.query.modules as string[]
          return moduleId
        }
        const absPath = await this.resolve(path, importer)
        if (!absPath?.id) {
          throw new Error(`can not resolve importee: "${importee}"`)
        }
        // record page entry file
        pageFiles[pagePath] = absPath.id
        return absPath.id
      }
      if ('analyzeSource' in parsed.query) {
        const path = parsed.url
        const absPath = await this.resolve(path, importer)
        if (!absPath?.id) {
          throw new Error(`can not resolve importee: "${importee}"`)
        }
        return stringifyUrl({ url: absPath.id, query: { analyzeSource: null } })
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
      const parsed = parseUrl(id)
      if ('analyzeSource' in parsed.query) {
        const filePath = parsed.url
        const result = await analyzeSourceCode(filePath)
        return `export default ${JSON.stringify(result)}`
      }
      if (id.startsWith('/@composedPage')) {
        const pagePath = id.slice('/@composedPage'.length)
        const modules = composedPages[pagePath]
        return mergeModules(modules)
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
