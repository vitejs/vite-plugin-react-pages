import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { setupPlugins } from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [react(), ...(await setupPlugins({}))],
  base:
    process.env.GITHUB_PAGES_DEPLOY === 'true'
      ? '/vite-plugin-react-pages/'
      : '/',
})
