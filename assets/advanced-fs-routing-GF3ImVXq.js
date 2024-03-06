import{p as r}from"./advanced-fs-routing_-3026UPtn.js";import{u as s,j as a}from"./ssg-client-Q8WOSgrZ.js";const d=`import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import pages, {
  PageStrategy,
  FileHandler,
  File,
  extractStaticData,
} from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [
    react(),
    pages({
      pagesDir: __dirname,
      // custom pageStrategy
      pageStrategy: new PageStrategy(function findPages(pagesDir, helpers) {
        helpers.watchFiles(
          pagesDir,
          '**/index.{md,mdx,js,jsx,ts,tsx}',
          fileHandler
        )
      }),
    }),
  ],
})

const fileHandler: FileHandler = async (file: File, fileHandlerAPI) => {
  const pagePublicPath = getPagePublicPath(file.relative)
  fileHandlerAPI.addPageData({
    pageId: pagePublicPath,
    dataPath: file.path,
    staticData: await extractStaticData(file),
  })
}

/**
 * turn \`sub-path/page2/index.tsx\` into \`/sub-path/page2\`
 */
function getPagePublicPath(relativePageFilePath: string) {
  console.log('getPagePublicPath', relativePageFilePath)
  let pagePublicPath = relativePageFilePath.replace(
    /index\\.(md|mdx|js|jsx|ts|tsx)$/,
    ''
  )
  // remove ending slash
  pagePublicPath = pagePublicPath.replace(/\\/$/, '')
  // add starting slash
  pagePublicPath = \`/\${pagePublicPath}\`
  return pagePublicPath
}
`,o=`import type { File } from '../utils/virtual-module'

export type FindPages = (
  pagesDir: string,
  helpers: PageHelpers
) => void | Promise<void>

export interface PageHelpers extends PageAPIs {
  /**
   * Read the static data from a file.
   */
  readonly extractStaticData: (file: File) => Promise<{
    readonly [key: string]: any
    readonly sourceType: string
  }>
  /**
   * Scan the fileSystem and
   * set page data in the file handler.
   * File deletion will be handled automatically
   */
  readonly watchFiles: WatchFilesHelper
}

export interface WatchFilesHelper {
  /** Watch all files within a directory (except node_modules and .git) */
  (baseDir: string, fileHandler?: FileHandler): void
  /** Watch files matching the given glob */
  (baseDir: string, glob: string, fileHandler?: FileHandler): void
  /** Watch files matching one of the given globs */
  (baseDir: string, globs: string[], fileHandler?: FileHandler): void
}

export type FileHandler = (
  file: File,
  api: PageAPIs
) => void | Promise<void> | DataPiece | Promise<DataPiece>

export interface PageAPIs {
  /**
   * Get a mutable data object of runtimeData
   */
  getRuntimeData: (pageId: string) => {
    [key: string]: string
  }
  /**
   * Get a mutable data object of staticData
   */
  getStaticData: (pageId: string) => {
    [key: string]: any
  }
  /**
   * Add page data.
   * If the data already exists, overwrite it.
   */
  addPageData: (pageData: DataPiece) => void
}

export interface DataPiece {
  /**
   * The page route path.
   * User can register multiple page data with same pageId,
   * as long as they have different keys.
   * Page data with same pageId will be merged.
   *
   * @example '/posts/hello-world'
   */
  readonly pageId: string
  /**
   * The data key.
   * For a same page, users can register multiple data pieces,
   * each with its own key. (Composed Page Data)
   *
   * @default 'main'
   */
  readonly key?: string
  /**
   * The path to the runtime data module.
   * It will be registered with the \`key\`.
   */
  readonly dataPath?: string
  /**
   * The value of static data.
   * It will be registered with the \`key\`.
   */
  readonly staticData?: any
  /**
   * when multiple data pieces have same key (conflict),
   * the data piece with highest priority will win
   * @default 1
   */
  readonly priority?: number
}
`;function i(t){const e={a:"a",blockquote:"blockquote",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...t.components},{FileText:n}=e;return n||h("FileText",!0),a.jsxs(a.Fragment,{children:[a.jsx(e.h2,{id:"advanced-filesystem-routing-pagestrategy-api",children:"Advanced Filesystem Routing: pageStrategy API"}),`
`,a.jsxs(e.blockquote,{children:[`
`,a.jsxs(e.p,{children:[`The "Basic Filesystem Routing Convention" should satisfy most users' needs. `,a.jsx(e.strong,{children:"You probably don't need to read this advanced guide"}),"."]}),`
`]}),`
`,a.jsxs(e.p,{children:["For advanced users, vite-pages lets you implement your own filesystem routing convention: you can ",a.jsx(e.strong,{children:"teach vite-pages how to collect page data from your project"}),"."]}),`
`,a.jsxs(e.p,{children:["When ",a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/create-project/template-lib/docs/vite.config.ts",children:"configuring vite-plugin-react-pages"}),", you can pass the ",a.jsx(e.code,{children:"pageStrategy"})," option. It should be an instance of ",a.jsx(e.code,{children:"PageStrategy"})," class. Here is an example of customizing pageStrategy:"]}),`
`,a.jsx(e.p,{children:"vite.config.ts:"}),`
`,a.jsx(n,{text:d,syntax:"ts"}),`
`,a.jsxs(e.p,{children:["With this custom pageStrategy, page files don't need to end with ",a.jsx(e.code,{children:"$"}),". Instead, they need to match the pattern ",a.jsx(e.code,{children:"**/index.{md,mdx,js,jsx,ts,tsx}"}),"."]}),`
`,a.jsxs(e.blockquote,{children:[`
`,a.jsxs(e.p,{children:["Checkout complete examples in ",a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/playground/custom-find-pages2/vite.config.ts",children:"the custom-find-pages2 fixture"})," or ",a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/create-project/template-lib/docs/vite.config.ts",children:"the project scaffold"}),"."]}),`
`]}),`
`,a.jsx(e.h3,{id:"steps-of-customizing-pagestrategy",children:"Steps of customizing pageStrategy"}),`
`,a.jsx(e.p,{children:"As shown by the above example, here are the usual steps to customize pageStrategy:"}),`
`,a.jsxs(e.ol,{children:[`
`,a.jsxs(e.li,{children:["Define a ",a.jsx(e.code,{children:"findPages"})," function and pass it to ",a.jsx(e.code,{children:"PageStrategy"})," constructor."]}),`
`,a.jsxs(e.li,{children:["Inside the ",a.jsx(e.code,{children:"findPages"}),", use ",a.jsx(e.code,{children:"helpers.watchFiles(baseDir, glob, fileHandler)"})," to find the files that you need.",`
`,a.jsxs(e.ul,{children:[`
`,a.jsxs(e.li,{children:["vite-pages will pass the glob(or glob array) to ",a.jsx(e.a,{href:"https://github.com/paulmillr/chokidar",children:"chokidar"}),". vite-pages use chokidar to scan the fileSystem and watch for files."]}),`
`,a.jsxs(e.li,{children:["Whenever a file is scanned, added or updated, vite-pages will call the ",a.jsx(e.code,{children:"fileHandler"})," with that file. When the file is deleted, vite-pages will automatically delete the related page data."]}),`
`]}),`
`]}),`
`,a.jsxs(e.li,{children:["Inside the ",a.jsx(e.code,{children:"fileHandler"}),", read the information from the ",a.jsx(e.code,{children:"file"})," and register page data by calling ",a.jsx(e.code,{children:"fileHandlerAPI.addPageData"}),".",`
`,a.jsxs(e.ul,{children:[`
`,a.jsxs(e.li,{children:["There are two more helpers inside ",a.jsx(e.code,{children:"fileHandlerAPI"})," that help you to update page data. We will introduce them in the following section."]}),`
`]}),`
`]}),`
`]}),`
`,a.jsx(e.h3,{id:"handle-file-events-and-update-page-data",children:"Handle file events and update page data"}),`
`,a.jsxs(e.p,{children:["The ",a.jsx(e.code,{children:"fileHandler"})," should conform to this interface:"]}),`
`,a.jsx(e.pre,{children:a.jsx(e.code,{className:"language-ts",children:`type FileHandler = (
  file: File,
  fileHandlerAPI: PageAPIs
) => void | Promise<void> | DataPiece | Promise<DataPiece>
`})}),`
`,a.jsxs(e.p,{children:["It will be called when a file is added or updated. You should extract ",a.jsx(e.a,{href:"/page-data",children:"page data"})," from this file."]}),`
`,a.jsxs(e.p,{children:["The ",a.jsx(e.code,{children:"fileHandlerAPI"})," contains a set of helpers that help you to update page data."]}),`
`,a.jsx(e.h4,{id:"filehandlerapiaddpagedatadatapiece",children:"fileHandlerAPI.addPageData(dataPiece)"}),`
`,a.jsxs(e.p,{children:["When you have extracted some ",a.jsx(e.a,{href:"/page-data",children:"page data"})," (which is called dataPiece) in the ",a.jsx(e.code,{children:"fileHandler"}),", call ",a.jsx(e.code,{children:"addPageData"})," to register the data. So that vite-pages will load the data into the theme for rendering."]}),`
`,a.jsx(e.p,{children:"The dataPiece should conform to this interface:"}),`
`,a.jsx(e.pre,{children:a.jsx(e.code,{className:"language-ts",children:`interface DataPiece {
  /**
   * The page route path.
   * User can register multiple page data with same pageId,
   * as long as they have different keys.
   * Page data with same pageId will be merged.
   *
   * @example '/posts/hello-world'
   */
  readonly pageId: string
  /**
   * The data key.
   * For a same page, users can register multiple data pieces,
   * each with its own key. (Composed Page Data)
   *
   * @default 'main'
   */
  readonly key?: string
  /**
   * The path to the runtime data module.
   * It will be registered with the \`key\`.
   */
  readonly dataPath?: string
  /**
   * The value of static data.
   * It will be registered with the \`key\`.
   */
  readonly staticData?: any
  /**
   * when multiple data pieces have same key (conflict),
   * the data piece with highest priority will win
   * @default 1
   */
  readonly priority?: number
}
`})}),`
`,a.jsxs(e.p,{children:["In normal cases, ",a.jsx(e.code,{children:"dataPath"})," is the path of the currently handled file. And ",a.jsx(e.code,{children:"staticData"})," is statically extracted from the file content (js docblock or markdown frontmatter). Vite-pages exports a helper ",a.jsx(e.code,{children:"extractStaticData"})," to do that."]}),`
`,a.jsxs(e.blockquote,{children:[`
`,a.jsxs(e.p,{children:["When a watched file is updated, before calling ",a.jsx(e.code,{children:"fileHandler"}),`, vite-pages will automatically unlink all the previous registered page data from this file. So you don't need to worry about "outdated data from old version of files".`]}),`
`]}),`
`,a.jsxs(e.p,{children:["Checkout ",a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/playground/custom-find-pages2/vite.config.ts",children:"the custom-find-pages2 fixture"})," for an example."]}),`
`,a.jsxs(e.blockquote,{children:[`
`,a.jsxs(e.p,{children:["Checkout ",a.jsx(e.a,{href:"/page-data",children:"the page data doc"})," for more explanation of ",a.jsx(e.code,{children:"key"}),"."]}),`
`]}),`
`,a.jsx(e.h4,{id:"filehandlerapigetruntimedatapageid",children:"fileHandlerAPI.getRuntimeData(pageId)"}),`
`,a.jsx(e.p,{children:"Inside the fileHandler, you can use it to get the runtimeData of a certain page. You can read or mutate the properties of it:"}),`
`,a.jsx(e.pre,{children:a.jsx(e.code,{className:"language-ts",children:`const runtimeDataPaths = fileHandlerAPI.getRuntimeData(pageId)
if (!runtimeDataPaths[key]) runtimeDataPaths[key] = pathToRuntimeModule
`})}),`
`,a.jsxs(e.p,{children:["Checkout ",a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/playground/custom-find-pages/vite.config.ts",children:"the custom-find-pages fixture"})," for an example."]}),`
`,a.jsx(e.h4,{id:"filehandlerapigetstaticdatapageid",children:"fileHandlerAPI.getStaticData(pageId)"}),`
`,a.jsxs(e.p,{children:["Similar to the ",a.jsx(e.code,{children:"fileHandlerAPI.getRuntimeData"})," API, you can use ",a.jsx(e.code,{children:"fileHandlerAPI.getStaticData"})," to get the staticData of a certain page. And you can read or mutate the properties of it:"]}),`
`,a.jsx(e.pre,{children:a.jsx(e.code,{className:"language-ts",children:`const staticData = fileHandlerAPI.getStaticData(pageId)
if (!staticData[key]) staticData[key] = await extractStaticData(file)
`})}),`
`,a.jsxs(e.p,{children:["Checkout ",a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/playground/custom-find-pages/vite.config.ts",children:"the custom-find-pages fixture"})," for an example."]}),`
`,a.jsx(e.h3,{id:"sharable-pagestrategy",children:"Sharable pageStrategy"}),`
`,a.jsxs(e.p,{children:["You can also define your strategy as a subclass of ",a.jsx(e.code,{children:"PageStrategy"}),". It is more sharable than the previous way."]}),`
`,a.jsx(e.p,{children:"For example, this is how vite-pages defines the default page strategy:"}),`
`,a.jsx(e.pre,{children:a.jsx(e.code,{className:"language-ts",children:`export class DefaultPageStrategy extends PageStrategy {
  constructor(
    opts: { extraFindPages?: FindPages; fileHandler?: FileHandler } = {}
  ) {
    const { extraFindPages, fileHandler = defaultFileHandler } = opts
    // pass a wrapped findPages function to super class
    super((pagesDir, helpersFromParent) => {
      // we can create our own helpers, providing a default fileHandler
      // and not using helpersFromParent
      const helpers = this.createHelpers(fileHandler)
      helpers.watchFiles(pagesDir, '**/*$.{md,mdx,js,jsx,ts,tsx}')
      if (typeof extraFindPages === 'function') {
        extraFindPages(pagesDir, helpers)
      }
    })
  }
}
`})}),`
`,a.jsxs(e.blockquote,{children:[`
`,a.jsxs(e.p,{children:[a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/react-pages/src/node/page-strategy/DefaultPageStrategy/index.ts",children:"Source code of DefaultPageStrategy"}),"."]}),`
`]}),`
`,a.jsxs(e.p,{children:[a.jsx(e.a,{href:"/examples/component-library",children:"here is an example of using it"}),"."]}),`
`,a.jsx(e.h4,{id:"examples",children:"Examples"}),`
`,a.jsxs(e.p,{children:["For real-life examples of customizing pageStrategy, check out ",a.jsx(e.a,{href:"/examples/component-library",children:'"Example: develop a component library"'}),"."]}),`
`,a.jsx(e.h4,{id:"types",children:"Types"}),`
`,a.jsx(e.p,{children:"Here are the relavent types:"}),`
`,a.jsx(n,{text:o,syntax:"ts"}),`
`,a.jsxs(e.blockquote,{children:[`
`,a.jsxs(e.p,{children:[a.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/react-pages/src/node/page-strategy/types.document.d.ts",children:"Source code"}),"."]}),`
`]})]})}function c(t={}){const{wrapper:e}={...s(),...t.components};return e?a.jsx(e,{...t,children:a.jsx(i,{...t})}):i(t)}function h(t,e){throw new Error("Expected "+(e?"component":"object")+" `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}const p=Object.freeze(Object.defineProperty({__proto__:null,default:c},Symbol.toStringTag,{value:"Module"})),l={};l.outlineInfo=r;l.main=p;export{l as default};
