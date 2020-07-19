---
title: Advanced FS Routing
sort: 5
---

## Advanced Filesystem Routing: findPages API

> The "Basic Filesystem Routing Convention" should satisfy most users' needs. **You probably don't need to read this document**.

For advanced users, vite-pages let you implement your own filesystem routing convention. You can teach vite-pages how to collect pages from your project file structure.

When [creating vite-plugin-react-pages](https://github.com/vitejs/vite-plugin-react-pages/blob/fef62e2e0c6b334c928fd53630eba01940de6142/fixtures/custom-find-pages/vite.demos.ts#L17), you can pass a second argument, `findPages`:

```ts
function createPlugin(
  pagesDir: string = path.join(process.cwd(), 'pages'),
  findPages?: (helpers: IFindPagesHelpers) => Promise<IPageData[]>
): Plugin

interface IFindPagesHelpers {
  readFile: (filePath: string) => Promise<string>
  extractStaticData: (
    filePath: string
  ) => Promise<{
    [key: string]: any
    sourceType: string
  }>
  findPagesFromGlob: (
    baseDir: string,
    glob: string,
    pageInfo: (relativePath: string) => IPageInfo | Promise<IPageInfo>
  ) => Promise<IPageData[]>
  defaultFindPages: (baseDir: string) => Promise<IPageData[]>
}

interface IPageData {
  publicPath: string
  filePath: string | string[]
  staticData?: any
}

type IPageInfo =
  | {
      publicPath: string
      staticData?: any
    }
  | false
```

You can implement your own filesystem routing convention with `findPages` API. It provides some useful helper functions to you. And let you create a page with data from multiple files.

### Composed Pages

Normal filesystem routing mechanism have a rule that one page must have a single entry file. But vite-pages doesn't force that rule! **Vite-pages let you create a page with data from multiple files. A page can be composed by multiple files.** This is a very useful feature of vite-pages's filesystem routing mechanism.

You can declare a page with data from multiple files by returning `string[]` as `IPageData.filePath`. Checkout the type definition of `IPageData` above this document.

For example, one of the page data you return from `findPages` is this:

```ts
{
  publicPath: "/demos/Button",
  filePath: ["/project/src/Button/demos/demo1.tsx", "/project/src/Button/demos/demo2.tsx"],
  staticData: {
    componentName: "Button"
  }
}
```

Then, when the app render the `/demos/Button` page. The theme will be given both modules. So the theme can render a page with multiple data sources.

### Example

For example, suppose you are developing a React component library. Your project have file structure like this:

```text
src
├── Button
│   ├── demos
│   │   ├── demo1.tsx
│   │   └── demo2.tsx
│   ├── index.tsx
│   └── style.module.css
├── Card
│   ├── demos
│   │   ├── demo1.tsx
│   │   └── demo2.tsx
│   ├── index.tsx
│   └── style.module.css
└── index.ts
```

You want to use Vite as your local demo development environment. How to collect demos of all components from this project? The file structure doesn't follow our "Basic Filesystem Routing Convention".

Answer: use `findPages` API to implement your own filesystem routing convention!

```ts
// vite.config.ts
import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'
import * as path from 'path'

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    mdx(),
    pages(path.join(__dirname, 'pages'), async (helpers) => {
      const demos = path.join(__dirname, 'src')
      const title: { [publicPath: string]: string } = {}

      let pages = await helpers.findPagesFromGlob(
        demos,
        // find demos from path `[component]/demos/[demo]`
        '*/demos/**/*.{[tj]sx,md?(x)}',
        // for each matched file, we generate page data with it
        async (filePath) => {
          const relative = path.relative(demos, filePath)
          const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
          if (!match) throw new Error('unexpected file: ' + filePath)
          const [_, componentName, demoPath] = match
          const publicPath = `/${componentName}`
          // Record title for every page
          title[publicPath] = componentName + ' Title'
          return {
            // findPagesFromGlob will help you merge pages with same publicPath.
            // So that multiple demos of the same component can be displayed together.
            publicPath,
            staticData: {
              ...(await helpers.extractStaticData(filePath)),
              demoPath,
            },
          }
        }
      )
      // augment the staticData of composed pages
      pages = pages.map((pageData) => {
        if (!pageData.staticData.isComposedPage) return pageData
        return {
          ...pageData,
          staticData: {
            ...pageData.staticData,
            // add title for composed pages
            title: title[pageData.publicPath],
          },
        }
      })
      // we also want to collect pages from `/pages` with basic filesystem routing convention
      const defaultPages = await helpers.defaultFindPages(
        path.join(__dirname, 'pages')
      )
      return [...defaultPages, ...pages]
    }),
  ],
  alias: {
    'my-lib': '/src',
  },
  minify: false,
} as UserConfig
```

How to render the composed page, is decided by the theme:

```tsx
// ...
loaded(pageData) {
  if (pageData.isComposedPage) {
    const composeModules = pageData.default
    return (
      <Layout>
        {composeModules.map((module: any, idx: number) => {
          const part = pageData.parts[idx]
          const ContentComp = module.default
          return (
            <section style={{ marginBottom: '40px' }} key={idx}>
              <h2>{part.title}</h2>
              <ContentComp />
            </section>
          )
        })}
      </Layout>
    )
  }
  const ContentComp = pageData.default
  return (
    <Layout>
      <ContentComp />
    </Layout>
  )
},
// ...
```

Checkout the example in [the custom-find-pages fixture](https://github.com/vitejs/vite-plugin-react-pages/tree/master/fixtures).
