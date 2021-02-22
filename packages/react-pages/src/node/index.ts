import * as path from 'path'
import type { Plugin } from 'vite'
import {
  FindPagesHelpers,
  FindPagesResult,
  renderPageListInSSR,
} from './dynamic-modules/pages'
import {
  collectPagesData,
  renderPageList,
  renderOnePageData,
} from './dynamic-modules/pages'
import { resolveTheme } from './dynamic-modules/resolveTheme'

export default function pluginFactory(
  opts: {
    pagesDir?: string
    findPages?: (helpers: FindPagesHelpers) => Promise<void>
    useHashRouter?: boolean
    staticSiteGeneration?: {}
  } = {}
): Plugin {
  const { findPages, useHashRouter = false, staticSiteGeneration } = opts
  let pagesDir: string = opts.pagesDir ?? ''

  let pagesData: Promise<FindPagesResult>
  return {
    name: 'vite-plugin-react-pages',
    config: () => ({
      resolve: {
        alias: {
          '/@pages-infra': path.join(__dirname, '../client/'),
        },
      },
      define: {
        __HASH_ROUTER__: !!useHashRouter,
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: undefined,
          },
        },
      },
    }),
    configResolved: (config) => {
      if (!pagesDir) {
        pagesDir = path.resolve(config.root, 'pages')
      }
    },
    resolveId(importee, importer) {
      if (importee === '@!virtual-modules/pages') {
        // page list
        return importee
      }
      if (importee.startsWith('@!virtual-modules/pages/')) {
        // one page data
        return importee
      }
      if (importee === '@!virtual-modules/theme') {
        return importee
      }
      if (importee.startsWith('@!virtual-modules/ssrData')) {
        return importee
      }
    },
    async load(id) {
      if (id === '@!virtual-modules/pages') {
        // page list
        if (!pagesData) pagesData = collectPagesData(pagesDir, findPages)
        return renderPageList(await pagesData)
      }
      if (id.startsWith('@!virtual-modules/pages/')) {
        // one page data
        let pageId = id.slice('@!virtual-modules/pages'.length)
        if (pageId === '/__index') pageId = '/'
        if (!pagesData) pagesData = collectPagesData(pagesDir, findPages)
        const pagesDataAwaited = await pagesData
        const page = pagesDataAwaited?.[pageId]
        if (!page) {
          throw new Error(`Page not exist: ${pageId}`)
        }
        return renderOnePageData(page.data)
      }
      if (id === '@!virtual-modules/theme') {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
      if (id === '@!virtual-modules/ssrData') {
        if (!pagesData) pagesData = collectPagesData(pagesDir, findPages)
        return renderPageListInSSR(await pagesData)
      }
    },
    // @ts-expect-error
    vitePagesStaticSiteGeneration: staticSiteGeneration,
  }
}

export type {
  Theme as Theme,
  PagesStaticData as PagesStaticData,
  PagesLoaded as PagesLoaded,
} from './types/client'
