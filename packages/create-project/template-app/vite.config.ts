import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import { setupPlugins } from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [
    react(),
    setupPlugins({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
})
