import * as path from 'path'
import type { Plugin } from 'vite'
import {
  renderPageList,
  renderPageListInSSR,
  renderOnePageData,
} from './dynamic-modules/pages'
import {
  FindPages,
  LoadPageData,
  PageStrategy,
} from './dynamic-modules/PageStrategy'
import { resolveTheme } from './dynamic-modules/resolveTheme'

const modulePrefix = '/@react-pages/'
const pagesModuleId = modulePrefix + 'pages'
const themeModuleId = modulePrefix + 'theme'
const ssrDataModuleId = modulePrefix + 'ssrData'

export default function pluginFactory(
  opts: {
    pagesDir?: string
    findPages?: FindPages
    loadPageData?: LoadPageData
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

  let isBuild: boolean
  let pagesDir: string
  let pageStrategy: PageStrategy

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
    configResolved(config) {
      isBuild = config.command === 'build'
      pagesDir = opts.pagesDir ?? path.resolve(config.root, 'pages')
      pageStrategy = new PageStrategy(pagesDir, findPages, loadPageData)
    },
    configureServer({ watcher, moduleGraph }) {
      const reloadVirtualModule = (moduleId: string) => {
        const module = moduleGraph.getModuleById(moduleId)
        if (module) {
          moduleGraph.invalidateModule(module)
          watcher.emit('change', moduleId)
        }
      }

      pageStrategy
        .on('promise', () => reloadVirtualModule(pagesModuleId))
        .on('change', (pageId: string) =>
          reloadVirtualModule(pagesModuleId + pageId)
        )
    },
    resolveId(id) {
      return id === themeModuleId ||
        id === ssrDataModuleId ||
        id === pagesModuleId ||
        id.startsWith(pagesModuleId + '/')
        ? id
        : undefined
    },
    async load(id) {
      // page list
      if (id === pagesModuleId) {
        return renderPageList(await pageStrategy.getPages(), isBuild)
      }
      // one page data
      if (id.startsWith(pagesModuleId + '/')) {
        let pageId = id.slice(pagesModuleId.length)
        if (pageId === '/__index') pageId = '/'
        const pages = await pageStrategy.getPages()
        const page = pages[pageId]
        if (!page) {
          throw Error(`Page not found: ${pageId}`)
        }
        return renderOnePageData(page.data)
      }
      if (id === themeModuleId) {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
      if (id === ssrDataModuleId) {
        return renderPageListInSSR(await pageStrategy.getPages())
      }
    },
    // @ts-expect-error
    vitePagesStaticSiteGeneration: staticSiteGeneration,
    closeWatcher() {
      pageStrategy.close()
    },
  }
}

export type {
  Theme,
  LoadState,
  PagesLoaded,
  PagesStaticData,
} from '../../client'
