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
        const demosBasePath = path.join(__dirname, 'src')
        // find all demo modules
        helpers.watchFiles(
          demosBasePath,
          '*/demos/**/*.{[tj]sx,md?(x)}',
          async (file) => {
            const { relative, path: absolute } = file
            const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
            if (!match) throw new Error('unexpected file: ' + absolute)
            const [_, componentName, demoPath] = match
            const publicPath = `/${componentName}`
            // a component page is composed by multiple demos
            helpers.addPageData({
              pageId: publicPath,
              key: demoPath,
              dataPath: absolute,
              staticData: await helpers.extractStaticData(file),
            })
            // set page's title
            // currently doesn't work
            helpers.addPageData({
              pageId: publicPath,
              key: 'title',
              staticData: componentName + ' Title',
            })
            return null
          }
        )
        // we also want to collect pages from `/pages` with basic filesystem routing convention
        defaultPageFinder(pagesDir, helpers)
      },
    }),
  ],
  resolve: {
    alias: {
      'my-lib': '/src',
    },
  },
  optimizeDeps: {
    include: ["@mdx-js/react"]
  }
} as UserConfig
