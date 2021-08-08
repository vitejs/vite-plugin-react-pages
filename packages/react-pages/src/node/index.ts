import * as path from 'path'
import fs from 'fs-extra'
import type { Plugin, IndexHtmlTransformContext } from 'vite'
import type { MdxPlugin } from 'vite-plugin-mdx/dist/types'
import {
  DefaultPageStrategy,
  defaultFileHandler,
} from './dynamic-modules/PageStrategy/DefaultPageStrategy'
import {
  renderPageList,
  renderPageListInSSR,
  renderOnePageData,
} from './dynamic-modules/PageStrategy/pageUtils'
import { PageStrategy } from './dynamic-modules/PageStrategy'
import { resolveTheme } from './dynamic-modules/resolveTheme'
import { demoModule } from './demo-modules'
import { demoTransform } from './mdx-plugins/demo'
import { tsInfoModule } from './ts-info-module'
import { tsInfoTransform } from './mdx-plugins/tsInfo'
import { injectHTMLTag } from './utils'
import { VirtualModulesManager } from './dynamic-modules/VirtualModulesManager'

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
const demosModuleId = modulePrefix + 'demos'
const tsInfoModuleId = modulePrefix + 'tsInfo'

const tsInfoQueryReg = /\?tsInfo=(.*)$/

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
  let virtualModulesManager = new VirtualModulesManager()

  return {
    name: 'vite-plugin-react-pages',
    enforce: 'pre',
    config: () => ({
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@mdx-js/react',
          'jotai',
          'jotai/utils',
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
    configResolved({ root, plugins, logger, command }) {
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
        mdxPlugin.mdxOptions.remarkPlugins.push(...getRemarkPlugins(root))
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
      if (id.endsWith('?demo')) {
        const bareImport = id.slice(0, 0 - '?demo'.length)
        const resolved = await this.resolve(bareImport, importer)
        if (!resolved || resolved.external)
          throw new Error(`can not resolve demo: ${id}. importer: ${importer}`)
        return demosModuleId + resolved.id
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
        return `${tsInfoModuleId}--${exportName}--${resolved.id}`
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
      if (id.startsWith(demosModuleId)) {
        const demoPath = id.slice(demosModuleId.length)
        return demoModule(demoPath)
      }
      if (id.startsWith(tsInfoModuleId)) {
        let sourcePath = id.slice(demosModuleId.length)
        const match = sourcePath.match(/--(.*?)--(.*)$/)
        if (!match) throw new Error('assertion fail')
        const exportName = match[1]
        sourcePath = match[2]
        return tsInfoModule(sourcePath, exportName)
      }
    },
    // @ts-expect-error
    vitePagesStaticSiteGeneration: staticSiteGeneration,
    closeBundle() {
      virtualModulesManager.close()
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

export type { FileHandler } from './dynamic-modules/PageStrategy/PagesDataKeeper'
export { File } from './dynamic-modules/VirtualModulesManager'
export { extractStaticData } from './dynamic-modules/utils'
export { PageStrategy }
export { DefaultPageStrategy, defaultFileHandler }

function getRemarkPlugins(root: string) {
  const result: any[] = [demoTransform, tsInfoTransform]
  const pkgJsonPath = path.join(root, 'package.json')
  const hasPkgJson = fs.pathExistsSync(pkgJsonPath)

  // Inject frontmatter parser if missing
  const { devDependencies = {}, dependencies = {} } = hasPkgJson
    ? require(pkgJsonPath)
    : {}
  if (
    !devDependencies['remark-frontmatter'] &&
    !dependencies['remark-frontmatter']
  ) {
    result.push(require('remark-frontmatter'))
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
