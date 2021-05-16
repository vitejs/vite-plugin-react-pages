import { defineConfig } from 'vite'
import * as path from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

module.exports = defineConfig({
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
  // theme local dev
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'ant-prefix': 'vp-antd',
        },
        javascriptEnabled: true,
      },
    },
    modules: {
      generateScopedName: `vp-local-[local]`,
    },
  },
})
