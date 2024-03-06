import{p as d}from"./upgrade-from-v2-to-v3_-4DVH73De.js";import{u as s,j as e}from"./ssg-client-Q8WOSgrZ.js";function i(n){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...s(),...n.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{id:"upgrade-from-v2-to-v3",children:"Upgrade from v2 to v3"}),`
`,e.jsx(t.h2,{id:"upgrade-package-versions",children:"Upgrade package versions"}),`
`,e.jsx(t.p,{children:"Upgrade these package versions:"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-json",children:`{
  "devDependencies": {
    "@vitejs/plugin-react": "^2.0.1",
    "vite": "^3.0.7",
    "vite-plugin-mdx": "^3.5.6",
    "vite-plugin-react-pages": "^3.2.1",
    "vite-pages-theme-basic": "^3.0.0"
  }
}
`})}),`
`,e.jsxs(t.p,{children:["Notice that you need to ",e.jsx(t.a,{href:"https://vitejs.dev/guide/migration.html",children:"migrate your app to Vite v3"})," with this setup."]}),`
`,e.jsxs(t.p,{children:["It is very recommended to migrate ",e.jsx(t.code,{children:"vite-pages-theme-basic"})," to ",e.jsx(t.a,{href:"/official-theme",children:"vite-pages-theme-doc"}),"."]}),`
`,e.jsx(t.h3,{id:"stick-with-vite-v2",children:"Stick with Vite v2"}),`
`,e.jsx(t.p,{children:"If you are not ready for Vite v3 for some reason, you can stick with Vite v2:"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-json",children:`{
  "devDependencies": {
    "@vitejs/plugin-react": "^1.1.4",
    "vite": "^2.5.6",
    "vite-plugin-mdx": "^3.5.6",
    "vite-plugin-react-pages": "^3.2.1",
    "vite-pages-theme-basic": "^3.0.0"
  }
}
`})}),`
`,e.jsxs(t.p,{children:["Notice the version of ",e.jsx(t.code,{children:"@vitejs/plugin-react"})," needs to be changed together with ",e.jsx(t.code,{children:"vite"}),"."]}),`
`,e.jsxs(t.p,{children:["We also recommend you migrate ",e.jsx(t.code,{children:"vite-pages-theme-basic"})," to ",e.jsx(t.a,{href:"/official-theme",children:"vite-pages-theme-doc"})," with this setup (with Vite v2)."]}),`
`,e.jsx(t.h2,{id:"install-peerdependencies-for-mdx",children:"Install peerDependencies for MDX"}),`
`,e.jsxs(t.p,{children:[e.jsx(t.code,{children:"vite-plugin-mdx"})," no longer installs mdx-related peerDependencies for you. You should install them in your project:"]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-json",children:`{
  "devDependencies": {
    "@mdx-js/mdx": "^1.6.22",
    "@mdx-js/react": "^1.6.22"
  }
}
`})}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"https://github.com/brillout/vite-plugin-mdx",children:"vite-plugin-mdx"})," has been moved to a separate repo. (",e.jsx(t.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/issues/6",children:"related issue"}),")"]}),`
`]}),`
`,e.jsx(t.h2,{id:"a-small-update-to-theme-api",children:"A Small update to theme API"}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:e.jsx(t.strong,{children:"If you have only used the basic theme and haven't created a custom theme. You don't need to care about this API change."})}),`
`]}),`
`,e.jsxs(t.p,{children:["In ",e.jsx(t.code,{children:"vite-plugin-react-pages@3.x"}),", vite-pages don't pass staticData to the theme component anymore. You should use the hook ",e.jsx(t.code,{children:"useStaticData"})," to get staticData. This API update is for less prop drilling and more efficient HMR update during dev."]}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-ts",children:`interface ThemeProps {
  // staticData is removed, use useStaticData instead
  readonly loadedData: PagesLoaded
  readonly loadState: LoadState
}

/**
 * A react hook to get static data.
 * import { useStaticData } from 'vite-plugin-react-pages/client'
 */
export interface UseStaticData {
  (): PagesStaticData
  (path: string): Record<string, any>
}
`})}),`
`,e.jsxs(t.p,{children:["Here is an ",e.jsx(t.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/commit/61f0fa0223ef28c526dfc7bd87bafd8de2523c38#diff-e18e1392eaf0be6f307cc5ba266f589b1517c4d991d6e0d5006c339fbe4b7ff6",children:"example upgrade commit"}),"."]}),`
`,e.jsx(t.h2,{id:"findpages-api-change",children:"findPages API change"}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:e.jsxs(t.strong,{children:[`If you have only used the "Basic Filesystem Routing Convention" and haven't used `,e.jsx(t.code,{children:"findPages"}),` to do "Advanced Filesystem Routing". You don't need to care about this API change.`]})}),`
`]}),`
`,e.jsxs(t.p,{children:["Previously, ",e.jsx(t.code,{children:"vite-plugin-react-pages"}),` don't react to the change from the fileSystem. If there is file add/update/unlink that will result in different pageData, you need to restart the dev server.
In `,e.jsx(t.code,{children:"vite-plugin-react-pages@3.x"}),", vite-pages use chokidar to scan the fileSystem and watch for files."]}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:["Thanks ",e.jsx(t.a,{href:"https://github.com/aleclarson",children:"Alec Larson"})," for the idea and initial implementation."]}),`
`]}),`
`,e.jsxs(t.p,{children:['In order to handle the change from the fileSystem, the "Advanced Filesystem Routing" API has changed from the ',e.jsx(t.code,{children:"findPages"})," API to the ",e.jsx(t.code,{children:"pageStrategy"})," API. Checkout ",e.jsx(t.a,{href:"/advanced-fs-routing",children:"the advanced-fs-routing doc"})," to learn about the latest API."]})]})}function o(n={}){const{wrapper:t}={...s(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(i,{...n})}):i(n)}const c=Object.freeze(Object.defineProperty({__proto__:null,default:o},Symbol.toStringTag,{value:"Module"})),a={};a.outlineInfo=d;a.main=c;export{a as default};
