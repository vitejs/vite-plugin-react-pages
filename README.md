# 📘 vite-plugin-react-page

[Document site](https://csr632.github.io/vite-pages-example/)

[vite-plugin-react-page](https://github.com/csr632/vite-plugin-react-pages) is a [vite](https://github.com/vitejs/vite) plugin for React. **It is very suitable for document site. It also serves as a great React UI development environment** (like [storybook](https://storybook.js.org/)).

## Highlights

- **Fantastic development experience**. Start the local development server in a blink, even when you have many pages. Hot module replacement works with React and Mdx, so you can get instant feedback when you edit the files. Big thanks to vite.
- **Filesystem based routing**. It is easy to create, locate and develop pages. You don't need to worry about routing configuration.
- **Support [Mdx](https://mdxjs.com/)**. You can write content with both "normal React" or [Mdx](https://mdxjs.com/). Normal Reactjs is flexible and composable. While Mdx is readable and easy to edit. You can choose the proper format for your task. These formats can import each other like normal esModules.
- **Simple but powerful theme customization**. With **only one theme API**, you can customize anything on the page. It is easy to write a theme that is sharable and configurable. If you use typescript, your theme configuration code will get type-check and intelliSense.
- **Automatic code splitting based on pages**. Readers don't need to download the whole app, they only load page data as needed.
- **Support SSR out of the box**. Get even better user experience.

## Getting started

1. Clone [the example repo](https://github.com/csr632/vite-pages-example)
2. `npm install`
3. `npm run dev` and play with the local dev envirenment.
4. `npm run build` and serve the `dist`.
5. `npm run ssr` and serve the `dist`. You can disable javascript in your browser, to verify if it can still render.

## TODOs

- 🔧 Polish basic theme
- ✅ Let theme to decide how to render loading or loadError view
  - vite-pages core should not render any dom node. It should be done by theme
- 🔧 Support [static generation with external data](https://nextjs.org/learn/basics/data-fetching/with-data) (getStaticProps)
- 🔧 Support [static generation with dynamic routes](https://nextjs.org/learn/basics/data-fetching/with-data) (getStaticPaths)
  - In development, `getStaticProps`/`getStaticPaths` runs on every request
  - In production, `getStaticProps`/`getStaticPaths` runs at build time
