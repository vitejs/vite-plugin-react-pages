import { build as viteBuild } from 'vite'
import type { ResolvedConfig } from 'vite'
import type { RollupOutput } from 'rollup'
import * as path from 'path'
import * as fs from 'fs-extra'

import { CLIENT_PATH } from '../constants'
import { stringify } from 'gray-matter'

export async function ssrBuild(
  viteConfig: ResolvedConfig,
  ssrConfig: any,
  argv: any
) {
  // ssr build should not use hash router
  // if (viteOptions?.define?.['__HASH_ROUTER__'])
  //   viteOptions!.define!['__HASH_ROUTER__'] = false
  const root = viteConfig.root
  let outDir = viteConfig.build?.outDir ?? 'dist'
  outDir = path.resolve(root, outDir)
  await fs.emptyDir(outDir)

  const ssrOutDir = path.join(outDir, 'ssr-tmp')
  const clientOutDir = path.join(outDir, 'client-tmp')

  console.log('\n\npreparing vite pages ssr bundle...')
  const ssrOutput = await viteBuild({
    root,
    configFile: viteConfig.configFile,
    build: {
      ssr: true,
      cssCodeSplit: false,
      rollupOptions: {
        input: path.join(CLIENT_PATH, 'ssr', 'serverRender.js'),
        preserveEntrySignatures: 'allow-extension',
        output: {
          format: 'cjs',
          exports: 'named',
          entryFileNames: '[name].js',
        },
      },
      outDir: ssrOutDir,
      minify: false,
    },
    // @ts-ignore
    ssr: {
      external: ['react', 'react-router-dom', 'react-dom', 'react-dom/server'],
      noExternal: [
        // TODO: remove this
        'vite-pages-theme-basic',
        'vite-pages-theme-doc',
        'vite-plugin-react-pages',
        'vite-plugin-react-pages/client',
      ],
    },
  })

  console.log('\n\nrendering html...')

  const { renderToString, ssrData } = require(path.join(
    ssrOutDir,
    'serverRender.js'
  ))

  const pagePaths = Object.keys(ssrData)

  console.log('\n\npreparing vite pages client bundle...')
  const _clientResult = await viteBuild({
    root,
    configFile: viteConfig.configFile,
    build: {
      cssCodeSplit: false,
      rollupOptions: {
        input: path.join(CLIENT_PATH, 'ssr', 'clientRender.js'),
        preserveEntrySignatures: 'allow-extension',
      },
      assetsDir: 'assets',
      outDir: clientOutDir,
    },
  })
  let clientResult: RollupOutput
  if (Array.isArray(_clientResult)) {
    if (_clientResult.length !== 1)
      throw new Error(`expect viteBuild to have only one BuildResult`)
    clientResult = _clientResult[0]
  } else {
    clientResult = _clientResult as RollupOutput
  }

  const entryChunk = (() => {
    const _entryChunks = clientResult.output.filter((chunkOrAsset) => {
      return chunkOrAsset.type === 'chunk' && chunkOrAsset.isEntry
    })
    if (_entryChunks.length !== 1) {
      throw new Error(`Expect one entryChunk. Got ${_entryChunks.length}.`)
    }
    return _entryChunks[0]
  })()

  const cssChunks = clientResult.output.filter((chunk) => {
    return chunk.type === 'asset' && chunk.fileName.endsWith('.css')
  })

  const basePath = viteConfig.base ?? '/'

  const htmlCode = await fs.readFile(path.join(root, 'index.html'), 'utf-8')
  const RootElementInjectPoint = '<div id="root"></div>'
  if (!htmlCode.includes(RootElementInjectPoint)) {
    throw new Error(
      `Your index.html should contain the RootElementInjectPoint: "${RootElementInjectPoint}" (it must appear exactly as-is)`
    )
  }
  const EntryModuleInjectPoint =
    '<script type="module" src="/@pages-infra/main.js"></script>'
  if (!htmlCode.includes(EntryModuleInjectPoint)) {
    throw new Error(
      `Your index.html should contain EntryModuleInjectPoint: "${EntryModuleInjectPoint}" (it must appear exactly as-is)`
    )
  }
  const CSSInjectPoint = '</head>'
  if (!htmlCode.includes(CSSInjectPoint)) {
    throw new Error(
      `Your index.html should contain CSSInjectPoint: "${CSSInjectPoint}" (it must appear exactly as-is)`
    )
  }

  await Promise.all(
    pagePaths.map(async (pagePath) => {
      // currently not support pages with path param
      // .e.g /users/:userId
      if (pagePath.match(/\/:\w/)) return
      const ssrContent = renderToString(pagePath)
      const ssrInfo = {
        routePath: pagePath,
      }
      let html = htmlCode.replace(
        RootElementInjectPoint,
        // let client know the current ssr page
        `<script>window._vitePagesSSR=${JSON.stringify(ssrInfo)};</script>
<div id="root">${ssrContent}</div>`
      )
      const cssInject = cssChunks
        .map((cssChunk) => {
          return `<link rel="stylesheet" href="${basePath}${cssChunk.fileName}" />`
        })
        .join('\n')
      html = html.replace(
        CSSInjectPoint,
        `${cssInject}
${CSSInjectPoint}`
      )
      html = html.replace(
        EntryModuleInjectPoint,
        `<script type="module" src="${basePath}${entryChunk.fileName}"></script>`
      )
      // TODO: injectPreload
      // preload data module for this page
      // html = injectPreload(html, "path/to/page/data")
      const writePath = path.join(
        clientOutDir,
        pagePath.replace(/^\//, ''),
        'index.html'
      )
      await fs.ensureDir(path.dirname(writePath))
      await fs.writeFile(writePath, html)
    })
  )

  // move 404 page to `/` if `/` doesn't exists
  const html404 = path.join(clientOutDir, '404', 'index.html')
  if (!pagePaths.includes('/') && (await fs.pathExists(html404))) {
    await fs.copy(html404, path.join(clientOutDir, 'index.html'))
  }

  await fs.copy(clientOutDir, outDir)
  await fs.remove(clientOutDir)
  await fs.remove(ssrOutDir)
  console.log('vite pages ssr build finished successfully.')
}

const injectPreload = (html: string, filePath: string) => {
  const tag = `<link rel="modulepreload" href="${filePath}" />`
  if (/<\/head>/.test(html)) {
    return html.replace(/<\/head>/, `${tag}\n</head>`)
  } else {
    return tag + '\n' + html
  }
}
