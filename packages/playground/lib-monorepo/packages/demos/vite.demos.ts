import type { UserConfig } from 'vite'
import * as path from 'path'

import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages, { defaultPageFinder } from 'vite-plugin-react-pages'

module.exports = {
  jsx: 'react',
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
      findPages: async (pagesDir, helpers) => {
        const demosBasePath = path.join(__dirname, '../')

        helpers.watchFiles({
          baseDir: demosBasePath,
          globs: '*/demos/**/*.{[tj]sx,md?(x)}',
          async fileHandler(file, api) {
            const { relative, path: absolute } = file
            const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
            if (!match) throw new Error('unexpected file: ' + absolute)
            const [_, componentName, demoPath] = match
            const pageId = `/${componentName}`
            const runtimeDataPaths = api.getRuntimeData(pageId)
            runtimeDataPaths[demoPath] = absolute
            const staticDataPaths = api.getStaticData(pageId)
            staticDataPaths[demoPath] = await helpers.extractStaticData(file)
            if (!staticDataPaths.title)
              staticDataPaths.title = `${componentName} Title`
          },
        })

        // find all component README
        helpers.watchFiles({
          baseDir: demosBasePath,
          globs: '*/README.md?(x)',
          async fileHandler(file, api) {
            const { relative, path: absolute } = file
            const match = relative.match(/(.*)\/README\.mdx?$/)
            if (!match) throw new Error('unexpected file: ' + absolute)
            const [_, componentName] = match
            const pageId = `/${componentName}`
            const runtimeDataPaths = api.getRuntimeData(pageId)
            runtimeDataPaths['README'] = absolute
            const staticDataPaths = api.getStaticData(pageId)
            staticDataPaths['README'] = await helpers.extractStaticData(file)
            // make sure the title data is bound to this file
            staticDataPaths.title = undefined
            staticDataPaths.title =
              staticDataPaths['README'].title ?? `${componentName} Title`
          },
        })
        // we also want to collect pages from `/pages` with basic filesystem routing convention
        defaultPageFinder(pagesDir, helpers)
      },
    }),
  ],
  resolve: {
    alias: {
      'playground-button': path.resolve(__dirname, '../button/src'),
      'playground-card': path.resolve(__dirname, '../card/src'),
    },
  },
  minify: false,
} as UserConfig
