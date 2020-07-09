import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'
import * as path from 'path'
import mdx from 'vite-plugin-mdx'

module.exports = {
  jsx: 'react',
  alias: {
    '/@layout/': path.join(__dirname, 'layout'),
  },
  plugins: [vpr, mdx(), pages()],
  optimizeDeps: {
    include: ["antd"]
  },
  minify: false,
} as UserConfig
