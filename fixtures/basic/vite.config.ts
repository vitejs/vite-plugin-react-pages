import type { UserConfig } from 'vite'
import pages from 'vite-plugin-react-pages-2'
import * as path from 'path'

module.exports = {
  plugins: [
    pages({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
  minify: false,
} as UserConfig
