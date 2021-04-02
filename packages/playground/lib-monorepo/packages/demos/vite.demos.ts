import type { UserConfig } from 'vite'
import * as path from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages, { DefaultPageStrategy } from 'vite-plugin-react-pages'

module.exports = {
  jsx: 'react',
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
      pageStrategy: new DefaultPageStrategy({
        extraFindPages: async (pagesDir, helpers) => {
          const demosBasePath = path.join(__dirname, '../')
          // find all component demos
          helpers.watchFiles(
            demosBasePath,
            '*/demos/**/*.{[tj]sx,md?(x)}',
            async function fileHandler(file, api) {
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
            }
          )

          // find all component README
          helpers.watchFiles(
            demosBasePath,
            '*/README.md?(x)',
            async function fileHandler(file, api) {
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
            }
          )
        },
      }),
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
