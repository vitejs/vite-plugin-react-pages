import{p as o}from"./upgrade-from-v4-to-v5_-435BNeor.js";import{u as s,j as e}from"./ssg-client-Q8WOSgrZ.js";function t(i){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...s(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"upgrade-from-v4-to-v5",children:"Upgrade from v4 to v5"}),`
`,e.jsx(n.p,{children:"vite-plugin-react-pages v5 is released with the following improvements:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Upgrade Vite to ",e.jsx(n.a,{href:"https://vitejs.dev/guide/migration.html",children:"v5"}),"."]}),`
`,e.jsxs(n.li,{children:["Upgrade MDX to ",e.jsx(n.a,{href:"https://mdxjs.com/migrating/v3/",children:"v3"}),"."]}),`
`]}),`
`,e.jsxs(n.p,{children:["Most migration is done inside this plugin. Our upstream libraries (Vite and MDX) didn't bring many significant breaking changes. So it should be ",e.jsx(n.strong,{children:"very easy"})," for our users to migrate! The following article will show you the migration instructions."]}),`
`,e.jsxs(n.p,{children:["If you encounter problems, open an issue in the repo. Or check out the ",e.jsx(n.a,{href:"https://vitejs.github.io/vite-plugin-react-pages/#getting-stated",children:"getting-stated templates"})," for working setup."]}),`
`,e.jsx(n.h2,{id:"upgrade-nodejs-to-18",children:"Upgrade Node.js to 18+"}),`
`,e.jsxs(n.p,{children:["As ",e.jsx(n.a,{href:"https://vitejs.dev/guide/migration.html",children:"Vite v5"})," requires Node.js 18+, you should upgrade Node.js to 18+."]}),`
`,e.jsx(n.h2,{id:"upgrade-project-dependencies",children:"Upgrade project dependencies"}),`
`,e.jsx(n.p,{children:"Upgrade these package versions:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "devDependencies": {
    "vite": "^5.0.12",
    "@vitejs/plugin-react": "^4.2.1",
    "vite-plugin-react-pages": "^5.0.0",
    "vite-pages-theme-doc": "^5.0.0",
    "@mdx-js/react": "^3.0.0"
  }
}
`})}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["you can replace ",e.jsx(n.code,{children:"@vitejs/plugin-react"})," with latest version of ",e.jsx(n.code,{children:"@vitejs/plugin-react-swc"}),"."]}),`
`]}),`
`,e.jsx(n.h2,{id:"check-upstream-libraries-migration",children:"Check Upstream libraries migration"}),`
`,e.jsx(n.p,{children:"Most migration is done inside this plugin. Although the upstream libraries (Vite and MDX) didn't bring many significant breaking changes for you, you should still take a look at their migration guides:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://vitejs.dev/guide/migration.html",children:"Vite v5"})}),`
`,e.jsx(n.li,{children:e.jsx(n.a,{href:"https://mdxjs.com/migrating/v3/",children:"MDX v3"})}),`
`]})]})}function d(i={}){const{wrapper:n}={...s(),...i.components};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}const a=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"})),r={};r.outlineInfo=o;r.main=a;export{r as default};
