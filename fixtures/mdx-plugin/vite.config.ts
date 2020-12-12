import type { UserConfig } from 'vite'
import mdx from 'vite-plugin-mdx'
import react from 'vite-plugin-react'
import remarkToc from 'remark-toc'
import remarkSlug from 'remark-slug'

module.exports = {
  jsx: 'react',
  plugins: [
    react,
    mdx({
      remarkPlugins: [remarkToc, remarkSlug]
    })
  ]
} as UserConfig
