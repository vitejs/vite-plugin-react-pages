import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

module.exports = defineConfig({
  plugins: [
    react(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
})
