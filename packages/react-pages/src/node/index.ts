import * as path from 'path'
import type { PluggableList } from 'unified'
import type { Plugin, IndexHtmlTransformContext } from 'vite'

import {
  DefaultPageStrategy,
  defaultFileHandler,
} from './page-strategy/DefaultPageStrategy'
import {
  renderPageList,
  renderPageListInSSR,
  renderOnePageData,
} from './page-strategy/pageUtils'
import { PageStrategy } from './page-strategy'
import { resolveTheme } from './virtual-module-plugins/theme'
import {
  DemoModuleManager,
  DemoMdxPlugin,
} from './virtual-module-plugins/demo-modules'
import {
  TsInfoModuleManager,
  TsInfoMdxPlugin,
} from './virtual-module-plugins/ts-info-module'
import { injectHTMLTag } from './utils/injectHTMLTag'
import { VirtualModulesManager } from './utils/virtual-module'
import { FileTextMdxPlugin } from './utils/mdx-plugin-file-text'
import { AnalyzeHeadingsMdxPlugin } from './utils/mdx-plugin-analyze-headings'
import { OutlineInfoModuleManager } from './virtual-module-plugins/outline-info-module'

/**
 * This is a public API that users use in their index.html.
 * Changing this would introduce breaking change for users.
 */
const appEntryId = '/@pages-infra/main.js'

/**
 * This is a private prefix an users should not use them
 */
const modulePrefix = '/@react-pages/'
const pagesModuleId = modulePrefix + 'pages'
const themeModuleId = modulePrefix + 'theme'
const ssrDataModuleId = modulePrefix + 'ssrData'

const tsInfoQueryReg = /\?tsInfo=(.*)$/

export interface PluginConfig {
  pagesDir?: string
  pageStrategy?: PageStrategy
  useHashRouter?: boolean
  staticSiteGeneration?: {}
}

export default function pluginFactory(opts: PluginConfig = {}): Plugin {
  const { useHashRouter = false, staticSiteGeneration } = opts

  let isBuild: boolean
  let pagesDir: string
  let pageStrategy: PageStrategy
  /** used as data source for PageStrategy and other dynamic-modules */
  const virtualModulesManager = new VirtualModulesManager()
  const demoModuleManager = new DemoModuleManager()
  const tsInfoModuleManager = new TsInfoModuleManager()
  const outlineInfoModuleManager = new OutlineInfoModuleManager()

  return {
    name: 'vite-plugin-react-pages',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-dom/client',
          'react-router-dom',
          '@mdx-js/react',
        ],
        exclude: ['vite-plugin-react-pages'],
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
    async configResolved({ root, plugins, logger, command }) {
      isBuild = command === 'build'
      pagesDir = opts.pagesDir ?? path.resolve(root, 'pages')
      if (opts.pageStrategy) {
        pageStrategy = opts.pageStrategy
      } else {
        pageStrategy = new DefaultPageStrategy()
      }
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

      demoModuleManager.onUpdate(reloadVirtualModule)
      tsInfoModuleManager.onUpdate(reloadVirtualModule)
      outlineInfoModuleManager.onUpdate(reloadVirtualModule)
    },
    buildStart() {
      // buildStart may be called multiple times
      // if the port has already been taken and vite retry with another port

      // pageStrategy.start can't be put in configResolved
      // because vite's resolveConfig will call configResolved without calling close hook
      pageStrategy.start(pagesDir, virtualModulesManager)
    },
    async resolveId(id, importer) {
      if (id === appEntryId) return id
      if (id.startsWith(modulePrefix)) return id
      // TODO
      if (id.endsWith('?demo')) {
        const bareImport = id.slice(0, 0 - '?demo'.length)
        const resolved = await this.resolve(bareImport, importer)
        if (!resolved || resolved.external)
          throw new Error(`can not resolve demo: ${id}. importer: ${importer}`)
        return demoModuleManager.registerProxyModule(resolved.id)
      }
      if (id.endsWith('?outlineInfo')) {
        const bareImport = id.slice(0, 0 - '?outlineInfo'.length)
        const resolved = await this.resolve(bareImport, importer)
        if (!resolved || resolved.external)
          throw new Error(
            `can not resolve outlineInfo: ${id}. importer: ${importer}`
          )
        return outlineInfoModuleManager.registerProxyModule(resolved.id)
      }
      const matchTsInfo = id.match(tsInfoQueryReg)
      if (matchTsInfo) {
        const bareImport = id.replace(tsInfoQueryReg, '')
        const resolved = await this.resolve(bareImport, importer)
        if (!resolved || resolved.external)
          throw new Error(
            `can not resolve tsInfo: ${id}. importer: ${importer}`
          )
        const exportName = matchTsInfo[1]
        return tsInfoModuleManager.registerProxyModule(resolved.id, exportName)
      }
      return undefined
    },
    async load(id) {
      // vite will resolve it with v=${versionHash} query
      // so that this import can be cached
      if (id === appEntryId)
        return `import "vite-plugin-react-pages/dist/client/main.js";`
      // page list
      if (id === pagesModuleId) {
        return renderPageList(await pageStrategy.getPages(), isBuild)
      }
      // one page data
      if (id.startsWith(pagesModuleId + '/')) {
        let pageId = id.slice(pagesModuleId.length)
        if (pageId === '/index__') pageId = '/'
        const page = await pageStrategy.getPage(pageId)
        if (!page) {
          throw Error(`Page not found: ${pageId}`)
        }
        // TODO: 将toc分析结果放在 page data 中，搜索的时候，要拉取所有的page data ，然后在前端搜
        return renderOnePageData(page.data)
      }
      if (id === themeModuleId) {
        return `export { default } from "${await resolveTheme(pagesDir)}";`
      }
      if (id === ssrDataModuleId) {
        return renderPageListInSSR(await pageStrategy.getPages())
      }
      if (demoModuleManager.isProxyModuleId(id)) {
        return demoModuleManager.loadProxyModule(id)
      }
      if (outlineInfoModuleManager.isProxyModuleId(id)) {
        return outlineInfoModuleManager.loadProxyModule(id)
      }
      if (tsInfoModuleManager.isProxyModuleId(id)) {
        return tsInfoModuleManager.loadProxyModule(id)
      }
    },
    // @ts-expect-error
    vitePagesStaticSiteGeneration: staticSiteGeneration,
    closeBundle() {
      virtualModulesManager.close()
      demoModuleManager.close()
      tsInfoModuleManager.close()
      outlineInfoModuleManager.close()
    },
    transformIndexHtml(html, ctx) {
      return moveScriptTagToBodyEnd(html, ctx)
    },
  }
}

export type {
  Theme,
  LoadState,
  PagesLoaded,
  PagesStaticData,
  TsInterfaceInfo,
  TsInterfacePropertyInfo,
} from '../../clientTypes'

export type { FileHandler } from './page-strategy/types.doc'
export { extractStaticData, File } from './utils/virtual-module'
export { PageStrategy }
export { DefaultPageStrategy, defaultFileHandler }

/**
 * vite put script before style, which cause style problem for antd
 * so we move the script tag to the end of the body
 * https://github.com/vitejs/vite/blob/4112c5d103673b83c50d446096086617dfaac5a3/packages/vite/src/node/plugins/html.ts#L352
 */
function moveScriptTagToBodyEnd(
  html: string,
  ctx: IndexHtmlTransformContext
): string | undefined {
  if (ctx.chunk) {
    const reg = new RegExp(
      `<script\\s[^>]*?${ctx.chunk.fileName}[^<]*?<\\/script>`
    )
    const match = html.match(reg)
    if (match) {
      const script = match[0]
      html = html.replace(script, '')
      return injectHTMLTag(html, script)
    }
  }
}

export async function setupPlugins(vpConfig: PluginConfig) {
  // use dynamic import so that it supports node commonjs
  const mdx = await import('@mdx-js/rollup')
  return [
    mdx.default({
      remarkPlugins: await getRemarkPlugins(),
      rehypePlugins: await getRehypePlugins(),
      // treat .md as mdx
      mdExtensions: [],
      mdxExtensions: ['.md', '.mdx'],
      providerImportSource: '@mdx-js/react',
    }),
    pluginFactory(vpConfig),
  ]
}

function getRemarkPlugins(): Promise<PluggableList> {
  return Promise.all([
    // use dynamic import so that it works in node commonjs
    import('remark-frontmatter').then((m) => m.default),
    import('remark-gfm').then((m) => m.default),
    import('remark-mdx-images').then((m) => m.default),

    // plugins created for vite-pages:
    DemoMdxPlugin,
    TsInfoMdxPlugin,
    FileTextMdxPlugin,
  ])
}

function getRehypePlugins(): Promise<PluggableList> {
  return Promise.all([
    // use dynamic import so that it works in node commonjs
    import('rehype-slug').then((m) => m.default),
  ])
}
