import * as path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
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
  pagesDir: string
  findPages?: (helpers: IFindPagesHelpers) => Promise<void>
  hashRouter?: boolean
}): Plugin {
  const { pagesDir, findPages, hashRouter = false } = opts

  let pagesData: Promise<IFindPagesResult>
  return {
    name: 'vite-plugin-react-pages',
    config: () => ({
      alias: {
        '/react-pages-runtime': path.join(__dirname, '../client/'),
      },
      define: {
        __HASH_ROUTER__: !!hashRouter,
      },
    }),
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
        // console.log('await pagesData', await pagesData)
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
