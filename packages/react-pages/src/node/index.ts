import * as path from 'path'
import type { Plugin } from 'vite'
import type { MdxPlugin } from 'vite-plugin-mdx/dist/types'
import {
  DefaultPageStrategy,
  defaultFileHandler,
} from './dynamic-modules/DefaultPageStrategy'
import {
  renderPageList,
  renderPageListInSSR,
  renderOnePageData,
} from './dynamic-modules/pages'
import { PageStrategy } from './dynamic-modules/PageStrategy'
import { resolveTheme } from './dynamic-modules/resolveTheme'

const modulePrefix = '/@react-pages/'
const pagesModuleId = modulePrefix + 'pages'
const themeModuleId = modulePrefix + 'theme'
const ssrDataModuleId = modulePrefix + 'ssrData'

export default function pluginFactory(
  opts: {
    pagesDir?: string
    pageStrategy?: PageStrategy
    useHashRouter?: boolean
    staticSiteGeneration?: {}
  } = {}
): Plugin {
  const { useHashRouter = false, staticSiteGeneration } = opts

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
      optimizeDeps: {
        include: ['@mdx-js/react'],
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
    configResolved({ root, plugins, logger, command }) {
      isBuild = command === 'build'
      pagesDir = opts.pagesDir ?? path.resolve(root, 'pages')
      if (opts.pageStrategy) {
        pageStrategy = opts.pageStrategy
      } else {
        pageStrategy = new DefaultPageStrategy()
      }

      // Inject parsing logic for frontmatter if missing.
      const { devDependencies = {} } = require(path.join(root, 'package.json'))
      if (!devDependencies['remark-frontmatter']) {
        const mdxPlugin = plugins.find(
          (plugin) => plugin.name === 'vite-plugin-mdx'
        ) as MdxPlugin | undefined

        if (mdxPlugin?.mdxOptions) {
          mdxPlugin.mdxOptions.remarkPlugins.push(require('remark-frontmatter'))
        } else {
          logger.warn(
            '[react-pages] Please install vite-plugin-mdx@3.1 or higher'
          )
        }
      }
    },
    buildStart() {
      pageStrategy.start(pagesDir)
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
        .on('page-list', () => reloadVirtualModule(pagesModuleId))
        .on('page', (pageIds: string[]) => {
          pageIds.forEach((pageId) => {
            reloadVirtualModule(pagesModuleId + pageId)
          })
        })
    },
    resolveId(id) {
      return id.startsWith(modulePrefix) ? id : undefined
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
    closeBundle() {
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

export { extractStaticData } from './dynamic-modules/utils'
export { PageStrategy }
export { DefaultPageStrategy, defaultFileHandler }
