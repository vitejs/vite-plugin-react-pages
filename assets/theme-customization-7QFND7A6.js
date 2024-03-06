import{p as i}from"./theme-customization_-NAxRUSG-.js";import{u as s,j as t}from"./ssg-client-Q8WOSgrZ.js";import{_ as h}from"./theme.doc.d-4vd-_gTq.js";const c=`import React from 'react'
import type { Theme } from 'vite-plugin-react-pages'
import { useStaticData } from 'vite-plugin-react-pages/client'

const theme: Theme = ({ loadedData, loadState }) => {
  const staticData = useStaticData()
  console.log('#Theme', staticData, loadedData, loadState)

  // You can generate side nav menu from staticData
  // const sideMenuData = useMemo(() => generateSideMenu(staticData), [staticData])

  if (loadState.type === '404') return <p>Page not found.</p>
  if (loadState.type === 'load-error') return <p>Load error!</p>
  if (loadState.type === 'loading') return <p>Loading...</p>

  // loadState.type === 'loaded'
  // Runtime page data for current page
  const pageData = loadedData[loadState.routePath]
  // the default export of the main module
  const Component = pageData.main.default
  return <Component />
}

export default theme
`;function o(n){const e={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...n.components},{FileText:a}=e;return a||l("FileText",!0),t.jsxs(t.Fragment,{children:[t.jsx(e.h1,{id:"theme-customization",children:"Theme customization"}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsxs(e.p,{children:["This is an advanced guide about how to make a theme by yourself. If there are already themes that meet your needs(e.g. ",t.jsx(e.a,{href:"/official-theme",children:"the official theme"}),"), you don't need to read this guide now!"]}),`
`]}),`
`,t.jsxs(e.p,{children:["Vite-pages itself doesn't render any concrete DOM node. Users can customize ",t.jsx(e.strong,{children:"anything"})," with a theme. That's why themes are so powerful."]}),`
`,t.jsxs(e.p,{children:["To use a theme, users should export their theme from ",t.jsx(e.code,{children:"_theme.tsx"}),". It should export a React component. It will be rendered by vite-pages core, and get useful info from props:"]}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"All pages' static data"}),`
`,t.jsx(e.li,{children:"All runtime data that is already loaded"}),`
`,t.jsx(e.li,{children:"The current loading state of the app"}),`
`]}),`
`,t.jsx(e.p,{children:"Here is the interface of a theme:"}),`
`,t.jsx(a,{text:h,syntax:"ts"}),`
`,t.jsxs(e.p,{children:['You can learn more about the "data" received by the render functions in ',t.jsx(e.a,{href:"/page-data",children:"the page data doc"}),"."]}),`
`,t.jsxs(e.p,{children:["This is probably ",t.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/playground/basic/pages/_theme.tsx",children:"the simplest theme"}),":"]}),`
`,t.jsx(a,{text:c,syntax:"tsx"}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsxs(e.p,{children:["Here is a more useful theme: ",t.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/theme-doc/src/index.tsx",children:"vite-pages-theme-doc"}),". Learn more about it in ",t.jsx(e.a,{href:"/official-theme",children:"this guide"}),"."]}),`
`]}),`
`,t.jsx(e.p,{children:"You can customize every bit of UI with a theme. Welcome to share your theme with a npm package!"}),`
`,t.jsx(e.h2,{id:"suggestions",children:"Suggestions"}),`
`,t.jsx(e.h3,{id:"to-theme-providers-make-your-theme-easier-to-use",children:"To theme providers: make your theme easier to use"}),`
`,t.jsxs(e.p,{children:["We encourage theme providers to export your theme as ",t.jsx(e.strong,{children:"a config function"})," that receives the user config and returns a ",t.jsx(e.code,{children:"Theme"}),"."]}),`
`,t.jsx(e.p,{children:"For example, the theme provider can export a theme like this:"}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-tsx",children:`// The theme config function accepts navs config
export default function createTheme({ navs }: Option = {}): Theme {
  return ({ loadedData, loadState }) => {
    if (loadState.type !== 'loaded')
      return (
        <Layout navs={navs}>
          <p>Loading...</p>
        </Layout>
      )
    // Runtime page data for current page
    const pageData = loadedData[loadState.routePath]
    // the default export of the main module
    const Component = pageData.main.default
    return (
      <Layout navs={navs}>
        <Component />
      </Layout>
    )
  }
}
`})}),`
`,t.jsx(e.p,{children:"Theme consumers can use it to config their navs menu:"}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-tsx",children:`// Theme users can configure sideMenu in \`/_theme.tsx\`:
import createTheme from 'theme-pkg'
export default createTheme({
  navs: [
    { path: '/guides/guide1', label: 'guide1' },
    { path: '/guides/guide2', label: 'guide1' },
  ],
})
`})}),`
`,t.jsxs(e.p,{children:["As you can see, the theme is easier to use because ",t.jsxs(e.strong,{children:["theme consumers don't need to know about the ",t.jsx(e.code,{children:"Theme"})," API of vite-pages"]}),". They only need to know about ",t.jsx(e.code,{children:"createTheme"})," API from the theme. Users should be talking to the theme, instead of talking directly to vite-pages framework."]}),`
`,t.jsxs(e.p,{children:["For this reason, we encourage theme providers to export a config function like the ",t.jsx(e.code,{children:"createTheme"})," above."]}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsxs(e.p,{children:["You can refer to ",t.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/theme-doc/src/index.tsx",children:"vite-pages-theme-doc"})]}),`
`]}),`
`,t.jsx(e.h4,{id:"release-the-power-of-typescript",children:"Release the power of Typescript"}),`
`,t.jsx(e.p,{children:'The above example shows another benefit for users: theme users can get Typescript type-check and intelliSense when they are configuring a theme. This is because users are calling the theme config function, instead of "exporting some configs".'}),`
`,t.jsx(e.h2,{id:"share-your-theme",children:"Share your theme!"}),`
`,t.jsx(e.p,{children:"It is easy to write a theme that is sharable and configurable."}),`
`,t.jsx(e.p,{children:"If you have designed and implemented a theme (.e.g a blog theme, a document site theme), welcome to add a link to your theme package in this document!"})]})}function d(n={}){const{wrapper:e}={...s(),...n.components};return e?t.jsx(e,{...n,children:t.jsx(o,{...n})}):o(n)}function l(n,e){throw new Error("Expected "+(e?"component":"object")+" `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const u=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"})),r={};r.outlineInfo=i;r.main=u;export{r as default};
