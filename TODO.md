# TODO

- 🔧 Polish basic theme
- ✅ Let theme to decide how to render loading or loadError view
  - vite-pages core should not render any dom node. It should be done by theme
- ✅ Let user/theme implement their own fs routing convention
- 🔧 Composed pages can be merged into object(return object as IPageData.filePath)
  - Currently they are [merged into array by vite-pages(hard-coded)](https://github.com/vitejs/vite-plugin-react-pages/blob/ba20fe4c7c69aee0b5b2507681c556c4467c23f2/packages/vite-plugin-react-pages/src/node/dynamic-modules/mergeModules.ts#L5).
- 🔧 Support [static generation with external data](https://nextjs.org/learn/basics/data-fetching/with-data) (getStaticProps)
- 🔧 Support [static generation with dynamic routes](https://nextjs.org/learn/basics/data-fetching/with-data) (getStaticPaths)
  - In development, `getStaticProps`/`getStaticPaths` runs on every request
  - In production, `getStaticProps`/`getStaticPaths` runs at build time
