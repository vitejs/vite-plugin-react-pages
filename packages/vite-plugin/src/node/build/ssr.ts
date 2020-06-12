import { ssrBuild as viteSSRBuild, build as viteBuild, UserConfig } from 'vite'
import * as path from 'path'
import * as fs from 'fs-extra'

import { CLIENT_PATH } from '../constants'

export async function ssrBuild(viteOptions: UserConfig) {
  const { outDir = path.join(process.cwd(), 'dist') } = viteOptions
  const ssrOutDir = path.join(outDir, 'ssr-tmp')

  await fs.emptyDir(outDir)

  console.log('\n\npreparing vite pages client bundle...')
  const clientResult = await viteBuild({
    ...viteOptions,
    rollupInputOptions: {
      ...viteOptions.rollupInputOptions,
      input: path.join(CLIENT_PATH, 'ssr', 'client.js'),
    },
    assetsDir: '_assets',
    outDir,
  })

  console.log('\n\npreparing vite pages ssr bundle...')
  await viteSSRBuild({
    ...viteOptions,
    rollupInputOptions: {
      ...viteOptions.rollupInputOptions,
      input: path.join(CLIENT_PATH, 'ssr', 'server.js'),
      preserveEntrySignatures: 'strict',
      // TODO: don't hard code this
      external: ['react', 'react-router-dom', 'react-dom/server'],
    },
    outDir: ssrOutDir,
  })

  console.log('\n\nrendering html...')

  const { renderToString, ssrData } = require(path.join(ssrOutDir, 'server.js'))
  await Promise.all(
    Object.keys(ssrData.pages).map(async (pagePath) => {
      const ssrContent = renderToString(pagePath)
      if (!clientResult.html?.includes('<div id="root"></div>')) {
        throw new Error(
          `Your index.html should contain "<div id="root"></div>"`
        )
      }
      const withSSR = clientResult.html.replace(
        '<div id="root"></div>',
        `<div id="root">${ssrContent}</div>`
      )
      const writePath = path.join(outDir, pagePath.slice(1), 'index.html')
      await fs.ensureDir(path.dirname(writePath))
      await fs.writeFile(writePath, withSSR)
    })
  )
  console.log('vite pages ssr build finished successfully.')
}
