import * as path from 'path'
import type { Plugin } from 'vite'
import type {
  IFindPagesHelpers,
  IFindPagesResult,
} from './dynamic-modules/pages'
import {
  collectPagesData,
  renderPageList,
  renderOnePageData,
} from './dynamic-modules/pages'
import { resolveTheme } from './dynamic-modules/resolveTheme'

export default function pluginFactory(opts: {
  pagesDir?: string
  findPages?: (helpers: IFindPagesHelpers) => Promise<void>
  useHashRouter?: boolean
}): Plugin {
  const { findPages, useHashRouter = false } = opts
  let pagesDir: string = opts.pagesDir ?? ''

  let pagesData: Promise<IFindPagesResult>
  return {
    name: 'vite-plugin-react-pages',
    config: () => ({
      alias: {
        '/@pages-infra': path.join(__dirname, '../client/'),
      },
      define: {
        __HASH_ROUTER__: !!useHashRouter,
      },
    }),
    configResolved: (config) => {
      if (!pagesDir) {
        pagesDir = path.resolve(config.root, 'pages')
      }
    },
    resolveId(importee, importer) {
      if (importee === '/@generated/pages') {
        // page list
        return importee
      }
      if (importee.startsWith('/@generated/pages/')) {
        // one page data
        return importee
      }
      if (importee === '/@generated/theme') {
        return importee
      }
    },
    async load(id) {
      if (id === '/@generated/pages') {
        // page list
        pagesData = collectPagesData(pagesDir, findPages)
        return renderPageList(await pagesData)
      }
      if (id.startsWith('/@generated/pages/')) {
        // one page data
        let pageId = id.slice('/@generated/pages'.length)
        if (pageId === '/__index') pageId = '/'
        const pagesDataAwaited = await pagesData
        const page = pagesDataAwaited?.[pageId]
        if (!page) {
          throw new Error(`Page not exist: ${pageId}`)
        }
        return renderOnePageData(page.data)
      }
      if (id === '/@generated/theme') {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
    },
  }
}

export type { ITheme, IPagesStaticData, IPagesLoaded } from './types/client'
