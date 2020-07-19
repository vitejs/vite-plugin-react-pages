# TODO

- 🔧 Polish basic theme
- ✅ Let theme to decide how to render loading or loadError view
  - vite-pages core should not render any dom node. It should be done by theme
- 🔧 Support [static generation with external data](https://nextjs.org/learn/basics/data-fetching/with-data) (getStaticProps)
- 🔧 Support [static generation with dynamic routes](https://nextjs.org/learn/basics/data-fetching/with-data) (getStaticPaths)
  - In development, `getStaticProps`/`getStaticPaths` runs on every request
  - In production, `getStaticProps`/`getStaticPaths` runs at build time
