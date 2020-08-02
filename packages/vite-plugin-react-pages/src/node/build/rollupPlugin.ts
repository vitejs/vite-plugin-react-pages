import type { Plugin } from 'vite'
import { parseUrl, stringifyUrl } from 'query-string'

import {
  collectPagesData,
  renderPagesDataDynamic,
  renderSSRPagesData,
  IFindPagesHelpers,
} from '../dynamic-modules/pages'
import type { IFindPagesResult } from '../dynamic-modules/pages'
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
  findPages?: (helpers: IFindPagesHelpers) => Promise<void>
): RollupPlugin => {
  let pagesData: Promise<IFindPagesResult>
  // for each page, record its page data entry module reference
  // const pageEntryRefId: { [pagePublicPath: string]: string } = {}
  // For each composed page, record its data source files
  // const composedPages: { [pagePublicPath: string]: string[] } = {}
  return {
    name: 'vite-pages-dynamic-modules',
    outputOptions(opts) {
      opts.chunkFileNames = '[hash].js'
      return opts
    },
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
      // if (importee.startsWith('/@composedPage')) return importee
      const parsed = parseUrl(importee)
      if (parsed.url === '/@generated/mergeModules') return importee
      // if (parsed.query.isPageEntry) {
      //   const path = parsed.url
      //   const pagePath = parsed.query.isPageEntry as string
      //   if (path === '/@generated/mergeModules') {
      //     // this page is composed by multiple files
      //     const moduleId = `/@composedPage${pagePath}`
      //     composedPages[pagePath] = parsed.query.modules as string[]
      //     pageEntryRefId[pagePath] = this.emitFile({
      //       type: 'chunk',
      //       id: moduleId,
      //     })
      //     return moduleId
      //   }
      //   const resolved = await this.resolve(path, importer)
      //   if (!resolved?.id) {
      //     throw new Error(`can not resolve page entry: "${importee}"`)
      //   }
      //   pageEntryRefId[pagePath] = this.emitFile({
      //     type: 'chunk',
      //     id: resolved.id,
      //   })
      //   return resolved.id
      // }
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
          pagesData = collectPagesData(pagesDir, (file) => file, findPages)
        return renderPagesDataDynamic(await pagesData)
      }
      if (id === '/@generated/theme') {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
      if (id === '/@generated/ssrData') {
        if (!pagesData)
          pagesData = collectPagesData(pagesDir, (file) => file, findPages)
        return renderSSRPagesData(await pagesData)
      }
      const parsed = parseUrl(id)
      if ('analyzeSource' in parsed.query) {
        const filePath = parsed.url
        const result = await analyzeSourceCode(filePath)
        return `export default ${JSON.stringify(result)}`
      }
      if (parsed.url === '/@generated/mergeModules') {
        // const pagePath = id.slice('/@composedPage'.length)
        // const modules = composedPages[pagePath]
        const modules = parsed.query as { [key: string]: string }
        return mergeModules(modules)
      }
    },
    // async generateBundle(options, bundle) {
    //   const mapPagePathToEmittedFile = Object.fromEntries(
    //     Object.entries(pageEntryRefId).map(([pagePublicPath, refId]) => {
    //       return [pagePublicPath, this.getFileName(refId)]
    //     })
    //   )
    //   this.emitFile({
    //     type: 'asset',
    //     source: JSON.stringify(mapPagePathToEmittedFile),
    //     fileName: 'mapPagePathToEmittedFile.json',
    //   })
    // },
  }
}
