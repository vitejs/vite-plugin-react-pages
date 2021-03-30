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
          const demosBasePath = path.join(__dirname, 'src')
          // find all demo modules
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
              staticDataPaths.title = `${componentName} Title`
            }
          )
        },
      }),
    }),
  ],
  resolve: {
    alias: {
      'my-lib': '/src',
    },
  },
  optimizeDeps: {
    include: ['@mdx-js/react'],
  },
} as UserConfig
