import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import _mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

// vite-plugin-mdx is not esm friendly currently
const mdx = ((_mdx as any).default || _mdx) as typeof _mdx

export default defineConfig({
  resolve: {
    alias: {
      '~pages/': `${path.join(__dirname, 'pages')}/`,
    },
  },
  plugins: [
    react(),
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
