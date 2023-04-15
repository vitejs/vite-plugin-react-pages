# vite-pages library-monorepo starter

This is a demo project for [vite-plugin-react-pages](https://github.com/vitejs/vite-plugin-react-pages).
This project demonstrate how to develop libraries **in monorepo** using vite as your local develop environment.

> This demo project setup both [pnpm workspaces](https://pnpm.io/workspaces) and [npm workspaces](https://docs.npmjs.com/cli/v8/using-npm/workspaces?v=true). You can use either one.

## How to use

`pnpm install` or `npm install` (require npm 7+)

`cd packages/demos`

`pnpm run dev` or `npm run dev` You can play with demos of your packages in local develop environment.

Edit `packages/button/src/index.tsx` or other source files, the demos will inflect your change instantly.
Edit `packages/button/demos/demo1.tsx` or other demo files, the demos will inflect your change instantly.

`pnpm run build` The demos are built and served.

`pnpm run ssr` The app are built into a static site (Static-Site Generation) and served.

---

Checkout [vite-plugin-react-pages](https://github.com/vitejs/vite-plugin-react-pages) for more info.
