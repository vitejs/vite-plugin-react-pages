import type { UserConfig } from 'vite'
import { createPlugin } from 'vite-plugin-mdx'
import react from 'vite-plugin-react'
import remarkToc from 'remark-toc'
import remarkSlug from 'remark-slug'

module.exports = {
  jsx: 'react',
  plugins: [
    react,
    createPlugin({
      remarkPlugins: [remarkToc, remarkSlug]
    })
  ]
} as UserConfig
