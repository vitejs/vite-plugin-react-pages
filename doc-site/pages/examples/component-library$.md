---
title: Examples
sort: 5.5
---

# Example: develop a component library

This is an example of using "Advanced Filesystem Routing" inside a component library project.

Suppose you are developing a React component library. Your project have file structure like this:

```text
src
├── Button
│   ├── demos
│   │   ├── demo1.tsx
│   │   └── demo2.tsx
│   ├── index.tsx
│   ├── style.module.css
│   └── README.md
├── Card
│   ├── demos
│   │   ├── demo1.tsx
│   │   └── demo2.tsx
│   ├── index.tsx
│   ├── style.module.css
│   └── README.md
└── index.ts
```

You want to use vite as your local demo development environment (because it is blazingly fast). **How to collect all components and all demos from this project?** The file structure doesn't follow our "Basic Filesystem Routing Convention".

The answer: implement your own filesystem routing convention!

```ts
// vite.config.ts
import type { UserConfig } from 'vite'
import * as path from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages, { DefaultPageStrategy } from 'vite-plugin-react-pages'

module.exports = {
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
      pageStrategy: new DefaultPageStrategy({
        extraFindPages: async (pagesDir, helpers) => {
          const demosBasePath = path.join(__dirname, 'src')
          // find all component demos
          helpers.watchFiles(
            demosBasePath,
            '*/demos/**/*.{[tj]sx,md?(x)}',
            async function fileHandler(file, api) {
              const { relative, path: absolute } = file
              const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
              if (!match) throw new Error('unexpected file: ' + absolute)
              const [_, componentName, demoPath] = match
              const pageId = `/${componentName}`
              const runtimeDataPaths = api.getRuntimeData(pageId)
              runtimeDataPaths[demoPath] = absolute
              const staticData = api.getStaticData(pageId)
              staticData[demoPath] = await helpers.extractStaticData(file)
              if (!staticData.title)
                staticData.title = `${componentName} Title`
            }
          )

          // find all component README
          helpers.watchFiles(
            demosBasePath,
            '*/README.md?(x)',
            async function fileHandler(file, api) {
              const { relative, path: absolute } = file
              const match = relative.match(/(.*)\/README\.mdx?$/)
              if (!match) throw new Error('unexpected file: ' + absolute)
              const [_, componentName] = match
              const pageId = `/${componentName}`
              const runtimeDataPaths = api.getRuntimeData(pageId)
              runtimeDataPaths['README'] = absolute
              const staticData = api.getStaticData(pageId)
              staticData['README'] = await helpers.extractStaticData(file)
              // make sure the title data is bound to this file
              staticData.title = undefined
              staticData.title =
                staticData['README'].title ?? `${componentName} Title`
            }
          )
        },
      }),
    }),
  ],
  resolve: {
    alias: {
      'my-lib': '/src',
    },
  },
} as UserConfig
```

We use `api.getRuntimeData(pageId)` and `api.getStaticData(pageId)` inside fileHandlers to get the pageData object. We can mutate the data object, and vite-pages will update its pages accordingly.

Checkout the complete example in [the custom-find-pages fixture](https://github.com/vitejs/vite-plugin-react-pages/blob/master/packages/playground/custom-find-pages).
Or you can **initialize such a project in one command**: `npm init vite-pages library-demo --template lib`

## Monorepo

In some cases, we want to publish each component in their own package.

> Monorepo has more advantages when components are complex and tend to evolve independently. If we use a single package to publish all these components like the above example, all components share a version number. If we need to introduce a breaking change in a component, we have to bump the major version of the whole package. But with the monorepo we only need to bump the major version of that sub-package. Users will be more confident to upgrade.

In that case, we create a seperate package to run vite-pages, collecting all components and their demos. The project setup will look like this:

```text
packages
├── Button
│   ├── demos
│   │   ├── demo1.tsx
│   │   └── demo2.tsx
│   ├── src
│   │   ├── index.tsx
│   │   └── style.module.css
│   ├── package.json
│   └── README.md
├── Card
│   ├── demos
│   │   ├── demo1.tsx
│   │   └── demo2.tsx
│   ├── src
│   │   ├── index.tsx
│   │   └── style.module.css
│   ├── package.json
│   └── README.md
├── demos
│   ├── pages
│   │   ├── index$.tsx
│   │   └── _theme.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

Checkout the complete example in [the lib-monorepo fixture](https://github.com/vitejs/vite-plugin-react-pages/tree/master/packages/playground/lib-monorepo).
Or you can **initialize such a project in one command**: `npm init vite-pages library-monorepo-demo --template lib-monorepo`.
