// import the src directly instead of build output
// useful for local development in this repo (and only used for dev)
// this should be used with viteConfig.css.modules.generateScopedName setup: https://github.com/vitejs/vite-plugin-react-pages/blob/a295d2902ef2d69c7808db2be8d182807ead5a3e/packages/playground/use-theme-doc/vite.config.ts#L20
export * from 'vite-pages-theme-doc/src/index'
// actual users shouldn't do this, they should import directly from 'vite-pages-theme-doc':
// export * from 'vite-pages-theme-doc'
