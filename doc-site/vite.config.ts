import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'
import { createPlugin } from 'vite-plugin-mdx'
import remarkFrontmatter from 'remark-frontmatter'

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    createPlugin({
      // TODO support frontmatter by default
      remarkPlugins: [remarkFrontmatter],
    }),
    pages(),
  ],
  optimizeDeps: {
    exclude: ['vite-pages-theme-basic'],
  },
  minify: 'esbuild',
} as UserConfig
