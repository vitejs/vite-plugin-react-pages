const path = require('path')
const plugin_react_refresh = require('@vitejs/plugin-react-refresh').default
const vite_plugin_mdx = require('vite-plugin-mdx').default
const vite_plugin_react_pages = require('vite-plugin-react-pages').default

/**
 * @type {import('vite').UserConfig}
 */
module.exports = {
  plugins: [
    plugin_react_refresh(),
    vite_plugin_mdx(),
    vite_plugin_react_pages({
      pagesDir: path.join(__dirname, 'pages'),
    }),
  ],
  optimizeDeps: {
    include: ['@mdx-js/react'],
    link: ['vite-pages-theme-basic'],
  },
}
