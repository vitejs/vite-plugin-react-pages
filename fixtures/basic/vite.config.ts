import type { UserConfig } from 'vite'
import * as path from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages-2'

module.exports = {
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
  minify: false,
} as UserConfig
