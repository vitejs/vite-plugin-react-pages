import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'
import * as path from 'path'

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    pages({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
  optimizeDeps: {
    include: ["@loadable/component"]
  },
} as UserConfig
