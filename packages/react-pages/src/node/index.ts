import * as path from 'path'
import type { Plugin } from 'vite'
import {
  PageFinder,
  getPageFinder,
  renderPageList,
  renderPageListInSSR,
  renderOnePageData,
  PageStrategy,
} from './dynamic-modules/pages'
import { resolveTheme } from './dynamic-modules/resolveTheme'

export default function pluginFactory(
  opts: {
    pagesDir?: string
    findPages?: PageStrategy['findPages']
    loadPageData?: PageStrategy['loadPageData']
    useHashRouter?: boolean
    staticSiteGeneration?: {}
  } = {}
): Plugin {
  const {
    findPages,
    loadPageData,
    useHashRouter = false,
    staticSiteGeneration,
  } = opts
  let pagesDir: string = opts.pagesDir ?? ''
  let pagesFinder: PageFinder

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
      if (importee === '@!virtual-modules/ssrData') {
        return importee
      }
    },
    async load(id) {
      if (id === '@!virtual-modules/pages') {
        // page list
        pagesFinder ??= getPageFinder(pagesDir, { findPages, loadPageData })
        return renderPageList(await pagesFinder.results)
      }
      if (id.startsWith('@!virtual-modules/pages/')) {
        // one page data
        let pageId = id.slice('@!virtual-modules/pages'.length)
        if (pageId === '/__index') pageId = '/'
        pagesFinder ??= getPageFinder(pagesDir, { findPages, loadPageData })
        const pagesData = await pagesFinder.results
        const page = pagesData?.[pageId]
        if (!page) {
          throw new Error(`Page not exist: ${pageId}`)
        }
        return renderOnePageData(page.data)
      }
      if (id === '@!virtual-modules/theme') {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
      if (id === '@!virtual-modules/ssrData') {
        pagesFinder ??= getPageFinder(pagesDir, { findPages, loadPageData })
        return renderPageListInSSR(await pagesFinder.results)
      }
    },
    // @ts-expect-error
    vitePagesStaticSiteGeneration: staticSiteGeneration,
    closeWatcher() {
      pagesFinder?.close()
    },
  }
}

export type {
  Theme as Theme,
  PagesStaticData as PagesStaticData,
  PagesLoaded as PagesLoaded,
} from './types/client'
