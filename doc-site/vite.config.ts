import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pages from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [react(), pages()],
  base:
    process.env.GITHUB_PAGES_DEPLOY === 'true'
      ? '/vite-plugin-react-pages/'
      : '/',
})
