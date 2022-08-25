import * as path from 'path'
import fs from 'fs-extra'
import type { Plugin, IndexHtmlTransformContext } from 'vite'
import type { MdxPlugin } from 'vite-plugin-mdx/dist/types'
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
import { ImageMdxPlugin } from './utils/mdx-plugin-image'
import { FileTextMdxPlugin } from './utils/mdx-plugin-file-text'

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

  return {
    name: 'vite-plugin-react-pages',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', '@mdx-js/react'],
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

      const mdxPlugin = plugins.find(
        (plugin) => plugin.name === 'vite-plugin-mdx'
      ) as MdxPlugin | undefined

      if (mdxPlugin?.mdxOptions) {
        // Inject demo transformer
        mdxPlugin.mdxOptions.remarkPlugins.push(
          ...(await getRemarkPlugins(root))
        )
      } else {
        logger.warn(
          '[react-pages] Please install vite-plugin-mdx@3.1 or higher'
        )
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

async function getRemarkPlugins(root: string) {
  const result: any[] = [
    DemoMdxPlugin,
    TsInfoMdxPlugin,
    ImageMdxPlugin,
    FileTextMdxPlugin,
  ]
  const pkgJsonPath = path.join(root, 'package.json')
  // TODO: user may put the whole vite-pages project
  // under a sub folder (which is the root here),
  // so the package.json will be located at the upper folder.
  // checkout playground/custom-find-pages2.
  const hasPkgJson = fs.pathExistsSync(pkgJsonPath)

  const pkgJson = await fs.readJSON(pkgJsonPath)

  // Inject frontmatter parser if missing
  const { devDependencies = {}, dependencies = {} } = hasPkgJson ? pkgJson : {}
  // By default we add remark-frontmatter automatically.
  // But if user install their own remark-frontmatter,
  // they are responsible to add the plugin manually
  // (they may provide some config to it)
  if (
    !devDependencies['remark-frontmatter'] &&
    !dependencies['remark-frontmatter']
  ) {
    // result.push(require('remark-frontmatter'))
    const remarkFrontmatter = await import('remark-frontmatter')
    result.push(remarkFrontmatter.default || remarkFrontmatter)
  }
  return result
}

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
