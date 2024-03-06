import{p as i}from"./upgrade-from-v3-to-v4_-VWVkOECi.js";import{u as o,j as e}from"./ssg-client-Q8WOSgrZ.js";const a="/vite-plugin-react-pages/assets/outline-and-search-azIpdYS2.jpg";function t(s){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",img:"img",li:"li",p:"p",pre:"pre",ul:"ul",...o(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"upgrade-from-v3-to-v4",children:"Upgrade from v3 to v4"}),`
`,e.jsx(n.p,{children:"vite-pages v4 is released with the following improvements:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Support ",e.jsx(n.a,{href:"https://vitejs.dev/guide/migration.html",children:"Vite v4"}),"."]}),`
`,e.jsxs(n.li,{children:["Upgrade React to ",e.jsx(n.a,{href:"https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html",children:"18.x"}),"."]}),`
`,e.jsxs(n.li,{children:["Upgrade react-router to ",e.jsx(n.a,{href:"https://reactrouter.com/en/main/upgrading/v5",children:"6.x"}),"."]}),`
`,e.jsxs(n.li,{children:["Upgrade mdx to ",e.jsx(n.a,{href:"https://mdxjs.com/migrating/v2/",children:"2.x"}),"."]}),`
`,e.jsxs(n.li,{children:["Upgrade antd to ",e.jsx(n.a,{href:"https://ant.design/docs/react/migration-v5",children:"5.x"})," (for vite-pages-theme-doc)."]}),`
`,e.jsxs(n.li,{children:["Support ",e.jsx(n.a,{href:"https://nodejs.org/api/esm.html",children:"Node.js ECMAScript modules"}),"."]}),`
`,e.jsx(n.li,{children:"Support markdown outline (table of contents)."}),`
`,e.jsx(n.li,{children:"Support search."}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"outline-and-search",src:a})}),`
`,e.jsxs(n.p,{children:["The following article will show you the migration instructions. If you encounter problems, open an issue in the repo. Or check out the ",e.jsx(n.a,{href:"https://vitejs.github.io/vite-plugin-react-pages/#getting-stated",children:"getting-stated templates"})," for reference."]}),`
`,e.jsx(n.h2,{id:"upstream-libraries-migration",children:"Upstream libraries migration"}),`
`,e.jsxs(n.p,{children:["Most upgrade work for upstream libraries is already done inside ",e.jsx(n.code,{children:"vite-plugin-react-pages"})," and ",e.jsx(n.code,{children:"vite-pages-theme-doc"}),". But some of the migration needs to be done in userland, if you are using some old APIs that are dropped by these upstream libraries. For example, you can no longer use ",e.jsx(n.code,{children:"<Switch>"})," of ",e.jsx(n.code,{children:"react-router"}),". Check out the links above for the migration guides of upstream libraries."]}),`
`,e.jsxs(n.p,{children:["We expect upstream libraries migration to be very easy for framework users unless you used many ",e.jsx(n.code,{children:"react-router"})," v5-only APIs."]}),`
`,e.jsx(n.h2,{id:"remove-vite-plugin-mdx",children:"Remove vite-plugin-mdx"}),`
`,e.jsxs(n.p,{children:["Since ",e.jsx(n.code,{children:"vite-plugin-mdx"})," doesn't support mdx v2, vite-pages now includes a built-in MDX plugin. So you should remove the ",e.jsx(n.code,{children:"vite-plugin-mdx"})," in vite-pages v5."]}),`
`,e.jsxs(n.p,{children:["Update ",e.jsx(n.code,{children:"vite.config.ts"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-diff",children:`import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
- import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [
    react(),
-   mdx(),
    pages()
  ],
})
`})}),`
`,e.jsxs(n.p,{children:["Notice that ",e.jsx(n.code,{children:"pages()"})," now returns an array of Vite plugins(instead of returning a plugin). But Vite can understand that and apply every plugin in that array. So the invoke pattern of ",e.jsx(n.code,{children:"vite-plugin-react-pages"})," looks exactly the same as before! You don't need to apply the new built-in MDX plugin manually."]}),`
`,e.jsxs(n.p,{children:["Update ",e.jsx(n.code,{children:"package.json"}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Remove ",e.jsx(n.code,{children:"vite-plugin-mdx"})," and ",e.jsx(n.code,{children:"@mdx-js/mdx"}),"."]}),`
`,e.jsxs(n.li,{children:["You should upgrade ",e.jsx(n.code,{children:"@mdx-js/react"})," to ",e.jsx(n.code,{children:"^2.1.5"}),". It is a peerDependencies of mdx, so it should be installed by your Vite project."]}),`
`]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-diff",children:`{
  "devDependencies": {
-   "@mdx-js/mdx": "^1.6.22",
-   "vite-plugin-mdx": "^3.5.11",
-   "@mdx-js/react": "^1.6.22",
+   "@mdx-js/react": "^2.1.5",
  }
}
`})}),`
`,e.jsx(n.h2,{id:"mdx-comment-syntax-change",children:"MDX Comment Syntax Change"}),`
`,e.jsxs(n.p,{children:["MDX v2 drops support for HTML comment syntax ",e.jsx(n.code,{children:"<!-- html comment -->"})," (actually it drops all HTML syntax), and ",e.jsx(n.a,{href:"https://mdxjs.com/docs/what-is-mdx/#markdown",children:"the document"})," recommends using JSX comment syntax instead:"]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["HTML syntax doesn’t work in MDX as it’s replaced by JSX. Instead of HTML comments, you can use JavaScript comments in braces: ",e.jsx(n.code,{children:"{/* comment! */}"}),"."]}),`
`]}),`
`,e.jsxs(n.p,{children:["The author explains the reason behind this at ",e.jsx(n.a,{href:"https://github.com/mdx-js/mdx/issues/1042#issuecomment-622281752",children:"this rfc"}),". The author hopes that the MDX syntax is only composed of markdown syntax + JSX syntax. The introduction of HTML syntax is not necessary and it would increase the mental burden."]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsx(n.p,{children:"Although many markdown parsers support HTML syntax, it is technically not the syntax of markdown itself. Those markdown parsers support it because markdown was not expressive enough in the past (without MDX). MDX has already solved the lack of expressiveness (via JSX syntax), so there is no need to support HTML syntax."}),`
`]}),`
`,e.jsxs(n.p,{children:["The removal of HTML comment syntax does bring some migration costs. You can quickly migrate it by regular search and replacement: ",e.jsx(n.code,{children:"<!--(.*?)-->"})," replace to ",e.jsx(n.code,{children:"{/*$0*/}"}),"."]}),`
`,e.jsx(n.h2,{id:"use-nodejs-ecmascript-modules",children:"Use Node.js ECMAScript modules"}),`
`,e.jsx(n.p,{children:"The Node.js community is quickly migrating from CommonJS to ECMAScript modules (esm). And we encourage you to run Vite on the esm mode of Node.js."}),`
`,e.jsxs(n.p,{children:["How to enable ESM for Node.js? Just add a ",e.jsx(n.code,{children:'"type": "module"'})," field to the ",e.jsx(n.code,{children:"package.json"})," of your Vite project!"]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["It is encouraged to have a dedicated ",e.jsx(n.code,{children:"package.json"})," for your Vite project. Your Vite project should not share a ",e.jsx(n.code,{children:"package.json"})," with the npm package that you are publishing (or the workspace package in the project root directory, if you are using monorepo)."]}),`
`]})]})}function d(s={}){const{wrapper:n}={...o(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(t,{...s})}):t(s)}const c=Object.freeze(Object.defineProperty({__proto__:null,default:d},Symbol.toStringTag,{value:"Module"})),r={};r.outlineInfo=i;r.main=c;export{r as default};
