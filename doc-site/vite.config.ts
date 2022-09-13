import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [react(), mdx(), pages()],
  base:
    process.env.GITHUB_PAGES_DEPLOY === 'true'
      ? '/vite-plugin-react-pages/'
      : '/',
})
