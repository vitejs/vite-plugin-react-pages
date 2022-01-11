# vite-pages library starter

This is a demo project for [vite-plugin-react-pages](https://github.com/vitejs/vite-plugin-react-pages).
This project demonstrate how to develop a library using vite as your local develop envirenment.

Notice that we put the **whole** vite-pages project (including config, index.html, .etc) into a sub folder. It makes the root directory cleaner. **This is a neet way to "embed" a vite-pages document project inside your main project.**

## How to use

`npm install` or `yarn`

`npm run dev` You can play with docs and demos of your packages in local develop envirenment.

> **Notice the "Components" navigation at the top bar!**

Edit `src/Button/index.tsx` or other souce files, the demos will inflect your change instantly.
Edit `src/Button/demos/demo1.tsx` or other demo files, the demos will inflect your change instantly.

`npm run build` The demos are built and served.

`npm run ssr` The app are built into a static site (Static-Site Generation) and served.

---

Checkout [vite-plugin-react-pages](https://github.com/vitejs/vite-plugin-react-pages) for more info.
