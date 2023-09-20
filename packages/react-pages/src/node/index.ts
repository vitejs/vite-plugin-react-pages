import * as path from 'path'
import type { PluggableList, Pluggable } from 'unified'
import type {
  Plugin,
  IndexHtmlTransformContext,
  PluginOption,
  Rollup,
} from 'vite'
import type { staticSiteGenerationConfig } from './types'

import {
  DefaultPageStrategy,
  defaultFileHandler,
} from './page-strategy/DefaultPageStrategy'
import {
  renderPageList,
  renderPageListInSSR,
  renderOnePageData,
  renderAllPagesOutlines,
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
import {
  OutlineInfoModuleManager,
  OUTLINE_INFO_MODULE_ID_PREFIX,
} from './virtual-module-plugins/outline-info-module'

/**
 * This is a public API that users use in their index.html.
 * Changing this would introduce breaking change for users.
 */
const appEntryId = '/@pages-infra/main.js'

/**
 * This is a private prefix and users should not use them directly
 */
const modulePrefix = '/@react-pages/'
const pagesModuleId = modulePrefix + 'pages'
const themeModuleId = modulePrefix + 'theme'
const ssrDataModuleId = modulePrefix + 'ssrData'
const allOutlineDataModuleId = modulePrefix + 'allPagesOutlines'

const tsInfoQueryReg = /\?tsInfo=(.*)$/

export interface PluginConfig {
  pagesDir?: string
  pageStrategy?: PageStrategy
  useHashRouter?: boolean
  staticSiteGeneration?: staticSiteGenerationConfig
  /** user can add/remove remark plugins passed to mdx */
  modifyRemarkPlugins?: ModifyNamedUnifiedPlugins
  /** user can add/remove rehype plugins passed to mdx */
  modifyRehypePlugins?: ModifyNamedUnifiedPlugins
}

export type NamedUnifiedPlugin = {
  /** use name so that modifier can recognize a plugin */
  name: string
  createPlugin: () => Pluggable | Promise<Pluggable>
}

export type ModifyNamedUnifiedPlugins = (
  original: NamedUnifiedPlugin[]
) => NamedUnifiedPlugin[]

function pluginFactory(opts: PluginConfig = {}): Plugin {
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
    config: (config, env) => ({
      optimizeDeps: {
        include: [
          'react',
          // fix https://github.com/vitejs/vite-plugin-react-pages/issues/132#issuecomment-1536515395
          'react/jsx-runtime',
          'react-dom',
          'react-dom/client',
          'react-router-dom',
          '@mdx-js/react',
        ],
        exclude: ['vite-plugin-react-pages'],
      },
      define: {
        __HASH_ROUTER__: !!useHashRouter,
        'process.env.VITE_PAGES_IS_SSR': env.ssrBuild
          ? JSON.stringify('true')
          : JSON.stringify('false'),
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: undefined,
            // local rollup's types may not be compatible with vite's rollup types
            plugins: [outputPluginDisableJekyll() as any],
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
      )
      if (mdxPlugin) {
        throw new Error(
          'You should not use vite-plugin-mdx with vite-plugin-react-pages. vite-pages v5 has buildin plugin for mdx.'
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
        return `import "vite-plugin-react-pages/dist/client-bundles/entries/csr.mjs";`
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
      if (outlineInfoModuleManager.isProxyModuleId(id)) {
        return outlineInfoModuleManager.loadProxyModule(id)
      }
      if (id === allOutlineDataModuleId) {
        return renderAllPagesOutlines(await pageStrategy.getPages())
      }
      if (tsInfoModuleManager.isProxyModuleId(id)) {
        return tsInfoModuleManager.loadProxyModule(id)
      }
    },
    closeBundle() {
      virtualModulesManager.close()
      demoModuleManager.close()
      tsInfoModuleManager.close()
      outlineInfoModuleManager.close()
    },
    transformIndexHtml(html, ctx) {
      return moveScriptTagToBodyEnd(html, ctx)
    },
    // Read by the cli script to get staticSiteGeneration config
    // @ts-expect-error
    vitePagesStaticSiteGeneration: staticSiteGeneration,
  }
}

export type {
  Theme,
  LoadState,
  PagesLoaded,
  PagesStaticData,
  TsInfo,
  TsPropertyOrMethodInfo,
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

export default async function setupPlugins(
  vpConfig: PluginConfig = {}
): Promise<PluginOption[]> {
  // use dynamic import so that it supports node commonjs
  const mdx = await import('@mdx-js/rollup')
  const mdxPlugin = mdx.default({
    remarkPlugins: await getRemarkPlugins(vpConfig.modifyRemarkPlugins),
    rehypePlugins: await getRehypePlugins(vpConfig.modifyRehypePlugins),
    // treat .md as mdx
    mdExtensions: [],
    mdxExtensions: ['.md', '.mdx'],
    providerImportSource: '@mdx-js/react',
  })
  return [
    {
      ...mdxPlugin,
      enforce: 'pre',
    },
    createMdxTransformPlugin(),
    pluginFactory(vpConfig),
  ]
}

function getRemarkPlugins(
  modifyPlugins?: ModifyNamedUnifiedPlugins
): Promise<PluggableList> {
  const originalPlugins: NamedUnifiedPlugin[] = [
    {
      name: 'remark-frontmatter',
      // use dynamic import so that it works in node commonjs
      // use lazy-eval function so that we don't import/create a plugin until we actually need it
      // (it may be removed by modifyPlugins so we can avoid calling it)
      createPlugin: () => import('remark-frontmatter').then((m) => m.default),
    },
    {
      name: 'remark-gfm',
      createPlugin: () => import('remark-gfm').then((m) => m.default),
    },
    {
      name: 'remark-mdx-images',
      createPlugin: () => import('remark-mdx-images').then((m) => m.default),
    },
    {
      name: 'DemoMdxPlugin',
      createPlugin: () => DemoMdxPlugin,
    },
    {
      name: 'TsInfoMdxPlugin',
      createPlugin: () => TsInfoMdxPlugin,
    },
    {
      name: 'FileTextMdxPlugin',
      createPlugin: () => FileTextMdxPlugin,
    },
  ]
  return createFinalPlugins(originalPlugins, modifyPlugins)
}

function getRehypePlugins(
  modifyPlugins?: ModifyNamedUnifiedPlugins
): Promise<PluggableList> {
  const originalPlugins: NamedUnifiedPlugin[] = [
    {
      name: 'rehype-slug',
      // use dynamic import so that it works in node commonjs
      // use lazy-eval function so that we don't import/create a plugin until we actually need it
      // (it may be removed by modifyPlugins so we can avoid calling it)
      createPlugin: () => import('rehype-slug').then((m) => m.default),
    },
  ]
  return createFinalPlugins(originalPlugins, modifyPlugins)
}

function createFinalPlugins(
  originalPlugins: NamedUnifiedPlugin[],
  modifyPlugins: ModifyNamedUnifiedPlugins | undefined
) {
  const finalPlugins = (() => {
    if (typeof modifyPlugins === 'function') {
      const res = modifyPlugins(originalPlugins)
      if (Array.isArray(res)) return res
    }
    return originalPlugins
  })()
  return Promise.all(finalPlugins.map(({ createPlugin }) => createPlugin()))
}

/**
 * use @vitejs/plugin-react to handle the output of @mdx-js/rollup
 * workaround this issue: https://github.com/vitejs/vite-plugin-react/issues/38
 */
function createMdxTransformPlugin(): Plugin {
  let vitePluginReactTrasnform: Plugin['transform'] | undefined
  return {
    name: 'vite-pages:mdx-fast-refresh',
    apply: 'serve',
    configResolved: ({ plugins }) => {
      // find this plugin to call it's transform function:
      // https://github.com/vitejs/vite-plugin-react/blob/b647e74c38565696bd6fb931b8bd9ac7f3bebe88/packages/plugin-react/src/index.ts#L206
      // or https://github.com/vitejs/vite-plugin-react-swc/blob/95e991914322e7b011d1c8d18d501b9eee21adaa/src/index.ts#L111
      vitePluginReactTrasnform = plugins.find(
        (p) =>
          (p.name === 'vite:react-babel' &&
            typeof p.transform === 'function') ||
          (p.name === 'vite:react-swc' && typeof p.transform === 'function')
      )?.transform
      if (!vitePluginReactTrasnform) {
        throw new Error(
          `Can't find an instance of @vitejs/plugin-react or @vitejs/plugin-react-swc. You should apply either of these plugins to make mdx work.`
        )
      }
    },
    transform: (code, id, options) => {
      const [filepath, ...qs] = id.split('?')
      if (
        filepath.match(/\.mdx?$/) &&
        !id.startsWith(OUTLINE_INFO_MODULE_ID_PREFIX)
      ) {
        // turn file path like `/path/to/md-file$.md` into `/path/to/md-file$.jsx`
        // make vite-plugin-react transform "the output of @mdx-js/rollup" like a jsx file
        // https://github.com/vitejs/vite-plugin-react/blob/caa9b5330092c70288fcb94ceb96ca42438df2a2/packages/plugin-react/src/index.ts#L170
        const newFilePath = filepath.replace(/\.mdx?$/, '.jsx')
        const newId = [newFilePath, ...qs].join('?')

        return (vitePluginReactTrasnform as any)(code, newId, options)
      }
    },
  }
}

/**
 * Some chunk filenames may start with `_`, which will be treated as special resource by github pages. So we need to disable jekyll of github pages.
 * https://github.blog/2009-12-29-bypassing-jekyll-on-github-pages/
 */
function outputPluginDisableJekyll(): Rollup.OutputPlugin {
  return {
    name: 'vite-pages-disable-jekyll',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '.nojekyll',
        source: '',
      })
    },
  }
}
