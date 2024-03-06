import{p as r}from"./page-data_-Q-CDJgOG.js";import{u as i,j as t}from"./ssg-client-Q8WOSgrZ.js";import{_ as l}from"./theme.doc.d-4vd-_gTq.js";function n(a){const e={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...i(),...a.components},{FileText:s}=e;return s||c("FileText",!0),t.jsxs(t.Fragment,{children:[t.jsx(e.h1,{id:"page-data",children:"Page data"}),`
`,t.jsxs(e.p,{children:[t.jsx(e.strong,{children:"Essentially, vite-pages is a React app framework that collects your pages' data and passes them to your theme."})," So what kinds of data does it collect?"]}),`
`,t.jsx(e.p,{children:"Each page consists of two kinds of data:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"Static data"}),`
`,t.jsx(e.li,{children:"Runtime data"}),`
`]}),`
`,t.jsx(e.p,{children:"Both of these page data are passed to the theme so that it can render the app."}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsxs(e.p,{children:["Fun fact: vite-pages itself doesn't render any concrete DOM node. All DOM nodes are rendered by ",t.jsx(e.a,{href:"/theme-customization",children:"theme"}),"."]}),`
`]}),`
`,t.jsx(e.h2,{id:"static-data",children:"Static data"}),`
`,t.jsxs(e.p,{children:["Static data usually contains the metadata of a page. Static data of ",t.jsx(e.strong,{children:"all pages"})," is loaded ",t.jsx(e.strong,{children:"eagerly"})," when the app bootstraps, so that the theme can render a side menu or a search box with this information."]}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"You should try to keep the static data as small as possible."}),`
`]}),`
`,t.jsxs(e.p,{children:["For ",t.jsx(e.code,{children:".tsx|.jsx"})," pages, you can define static data with ",t.jsx(e.strong,{children:"a docblock(comment) at the top of the file"}),"."]}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-tsx",children:`/**
 * @title index page
 * @tags tag1,tag2
 */
`})}),`
`,t.jsx(e.p,{children:"This will be collected as:"}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-json",children:`{ "title": "index page", "tags": "tag1,tag2" }
`})}),`
`,t.jsxs(e.p,{children:["For ",t.jsx(e.code,{children:".md|.mdx"})," pages, you can define static data with YAML front matter:"]}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-md",children:`---
title: my page
tags:
  - tag1
  - tag2
---
`})}),`
`,t.jsx(e.p,{children:"This will be collected as:"}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-json",children:`{ "title": "my page", "tags": ["tag1", "tag2"] }
`})}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsx(e.p,{children:"As you can see, YAML front matter can express some simple data structure(.e.g array), while a docblock's properties can only express strings. A qualified theme should understand both of these."}),`
`]}),`
`,t.jsx(e.h2,{id:"runtime-data",children:"Runtime data"}),`
`,t.jsx(e.p,{children:"Runtime page data is whatever value you export from a page file. It contains the actual content of the page."}),`
`,t.jsxs(e.p,{children:["Most themes(e.g. ",t.jsx(e.a,{href:"/official-theme",children:"the official theme"}),") ask users to ",t.jsx(e.code,{children:"export default"})," a React component from each page file. But that is not a requirement from vite-pages core. We will talk about this later."]}),`
`,t.jsx(e.h2,{id:"difference",children:"Difference"}),`
`,t.jsx(e.p,{children:"Both static data and runtime data are passed to the theme, so the theme can use them to render the app."}),`
`,t.jsx(e.p,{children:"Difference:"}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsxs(e.li,{children:["Static data of ",t.jsx(e.strong,{children:"all pages"})," is loaded ",t.jsx(e.strong,{children:"eagerly"})," when the app bootstrap. So you should try to keep the static data small."]}),`
`,t.jsxs(e.li,{children:["Runtime data is loaded ",t.jsx(e.strong,{children:"lazily"})," when a user navigates to that page."]}),`
`,t.jsx(e.li,{children:"The value type of static data is limited (string or simple object/array), while the value of runtime data can be any javascript value (.e.g a React component)."}),`
`]}),`
`,t.jsx(e.h2,{id:"how-themes-consume-these-data",children:"How themes consume these data"}),`
`,t.jsxs(e.p,{children:["As stated in ",t.jsx(e.a,{href:"/theme-customization",children:"the theme customization doc"}),", a theme is a React component. It will be rendered by vite-pages core, and get useful info from props:"]}),`
`,t.jsxs(e.ul,{children:[`
`,t.jsx(e.li,{children:"All pages' static data"}),`
`,t.jsx(e.li,{children:"All runtime data that is already loaded"}),`
`,t.jsx(e.li,{children:"The current loading state of the app"}),`
`]}),`
`,t.jsx(e.p,{children:"Here is the interface of a theme:"}),`
`,t.jsx(s,{text:l,syntax:"ts"}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsxs(e.p,{children:["Here is an example implementation of vite-pages theme: ",t.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/theme-doc/src/index.tsx",children:"vite-pages-theme-doc"}),". ",t.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/playground/use-theme-doc/pages/_theme.tsx",children:"This fixture"})," demonstrate how to use it."]}),`
`]}),`
`,t.jsx(e.h2,{id:"vite-pages-core-doesnt-care-what-your-page-data-looks-like",children:"Vite-pages core doesn't care what your page data looks like"}),`
`,t.jsxs(e.p,{children:["Vite-pages itself doesn't care what the page data looks like. How to interpret the page data and render the view, is totally decided by ",t.jsx(e.a,{href:"/theme-customization",children:"the theme"}),`. Vite-pages just collect your pages' data and pass them to the theme. This design makes the vite-pages core more "simple" and makes themes more powerful.`]}),`
`,t.jsxs(e.p,{children:["Most themes(e.g. ",t.jsx(e.a,{href:"/official-theme",children:"the official theme"}),") ask users to ",t.jsx(e.code,{children:"export default"})," a React component from each page file. But that is not a requirement from vite-pages core."]}),`
`,t.jsx(e.h2,{id:"advanced-topic-how-vite-pages-represent-page-data-internally",children:"Advanced topic: how vite-pages represent page data internally"}),`
`,t.jsx(e.p,{children:"Internally, vite-pages stores all pages' data inside a data structure like this:"}),`
`,t.jsx(e.pre,{children:t.jsx(e.code,{className:"language-ts",children:`interface PagesData {
  // pages are indexed by pageId which is route path like "/dir/page3"
  [pageId: string]: {
    // each page contains runtimeData and staticData
    data: {
      // the values are paths to the runtime data modules
      [key: string]: string
    }
    staticData: {
      // the values are serializable
      [key: string]: any
    }
  }
}
`})}),`
`,t.jsx(e.h3,{id:"composed-page-data",children:"Composed page data"}),`
`,t.jsxs(e.p,{children:["You may wonder why runtimeData and staticData are maps and we use a ",t.jsx(e.code,{children:"key"})," to index into them (instead of just one data for a page). This is because ",t.jsx(e.strong,{children:"vite-pages lets users create a page with multiple data pieces that originate from multiple files."})]}),`
`,t.jsxs(e.blockquote,{children:[`
`,t.jsxs(e.p,{children:["We use this feature in ",t.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/create-project/template-lib/docs/vite.config.ts",children:"the project scaffold"}),". We use it to display demos from multiple files in one page. You can init this sample project ",t.jsx(e.a,{href:"/",children:"with one command"})," (choose ",t.jsx(e.code,{children:"lib"})," template)."]}),`
`]}),`
`,t.jsx(e.p,{children:"Most filesystem routing mechanisms out there assume that each page maps to only one file. But vite-pages doesn't enforce that rule! This makes page data more flexible and programable."}),`
`,t.jsxs(e.p,{children:["Checkout ",t.jsx(e.a,{href:"/advanced-fs-routing",children:"the advanced-fs-routing doc"})," or ",t.jsx(e.a,{href:"/examples/component-library",children:'"Example: develop a component library"'})," to learn more about how to create a page with multiple data pieces that originate from multiple files."]})]})}function d(a={}){const{wrapper:e}={...i(),...a.components};return e?t.jsx(e,{...a,children:t.jsx(n,{...a})}):n(a)}function c(a,e){throw new Error("Expected "+(e?"component":"object")+" `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}const h=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"})),o={};o.outlineInfo=r;o.main=h;export{o as default};
