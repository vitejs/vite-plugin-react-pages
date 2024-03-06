import{p as o}from"./_-uQuonELK.js";import{u as s,j as e}from"./ssg-client-Q8WOSgrZ.js";function n(i){const t={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...s(),...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{id:"-vite-plugin-react-pages",children:"📘 vite-plugin-react-pages"}),`
`,e.jsx("p",{children:e.jsx("a",{href:"https://www.npmjs.com/package/vite-plugin-react-pages",target:"_blank",rel:"noopener",children:e.jsx("img",{src:"https://img.shields.io/npm/v/vite-plugin-react-pages.svg",alt:"npm package"})})}),`
`,e.jsxs(t.p,{children:[e.jsx(t.a,{href:"https://github.com/vitejs/vite-plugin-react-pages",children:"vite-plugin-react-pages"})," (vite-pages) is a React app framework powered by ",e.jsx(t.a,{href:"https://github.com/vitejs/vite",children:"vite"}),". It is very suitable for:"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:"blog site"}),`
`,e.jsx(t.li,{children:"documentation site for your library or product"}),`
`,e.jsxs(t.li,{children:["stories/demos/playgrounds for your React components or libraries (like ",e.jsx(t.a,{href:"https://storybook.js.org/",children:"storybook"}),")"]}),`
`]}),`
`,e.jsxs(t.p,{children:["It provides many features that help developers ",e.jsx(t.strong,{children:"build a React App quickly"}),":"]}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Fantastic development experience"}),". Start the local development server in a blink, even when you have many pages. Hot module replacement works with React and Mdx, so you can get instant feedback when you edit your code."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Filesystem based routing"}),". By following a ",e.jsx(t.a,{href:"/fs-routing",children:"simple filesystem routing convention"}),", It is easy to create, locate and develop pages. You don't need to worry about routing configuration. For advanced users, you can ",e.jsx(t.a,{href:"/advanced-fs-routing",children:"tell vite-pages how to find page files"}),", so that vite-pages can work with any project file structure."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support Mdx"}),'. You can write content with either "normal React" or ',e.jsx(t.a,{href:"https://mdxjs.com/",children:"Mdx"}),". Normal Reactjs is more flexible and composable. While Mdx is more readable and easier to edit. You can choose the proper format for your task. These formats can import each other like normal esModules."]}),`
`,e.jsxs(t.li,{children:[e.jsxs(t.strong,{children:["Powerful ",e.jsx(t.a,{href:"/theme-customization",children:"theme customization"})]}),". Vite-pages itself doesn't render any concrete DOM node. You can customize ",e.jsx(t.strong,{children:"anything"})," on the page with a theme. It is easy to write a theme that is sharable and configurable. If you use typescript, the users of your theme will get type-check and intelliSense."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Automatic code splitting based on pages"}),". Visitors don't need to download the whole app, they only load page data as needed."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Support static site generation out of the box"}),". By pre-rendering your app into HTML at build-time, users can see the content before any JS is loaded. With this feature, you can ",e.jsx(t.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/tree/main/doc-site",children:"deploy your single page apps on GitHub Pages"}),"(which ",e.jsx(t.a,{href:"https://www.google.com/search?q=github+pages+single+page+apps&oq=github+pages+single+page+apps",children:"doesn't natively support single page apps"}),")."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.strong,{children:"Tools for Library documentation"}),". Vite-pages provides ",e.jsx(t.a,{href:"/library-documentation-tools",children:"some tools"})," to reduce the maintenance costs for library authors and make their documents easier to read."]}),`
`]}),`
`,e.jsx(t.h2,{id:"getting-stated",children:"Getting stated"}),`
`,e.jsx(t.h3,{id:"try-it-online-on-stackblitz",children:"Try it online on StackBlitz"}),`
`,e.jsx(t.p,{children:"You can play with these demo projects in your browser, without installing anything on your machine."}),`
`,e.jsxs(t.ul,{children:[`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-app?file=README.md&terminal=dev",children:"app demo"})}),`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib?file=README.md&terminal=dev",children:"library demo"})}),`
`,e.jsx(t.li,{children:e.jsx(t.a,{href:"https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib-monorepo?file=README.md&terminal=dev",children:"library monorepo demo"})}),`
`]}),`
`,e.jsx(t.h3,{id:"initialize-a-demo-project-locally",children:"Initialize a demo project locally"}),`
`,e.jsxs(t.ol,{children:[`
`,e.jsxs(t.li,{children:["Initialize a vite-pages project (with npm 7+):",`
`,e.jsxs(t.ul,{children:[`
`,e.jsxs(t.li,{children:["execute ",e.jsx(t.code,{children:"npm init vite-pages app-demo -- --template app"})," to initialize an app project, or"]}),`
`,e.jsxs(t.li,{children:["execute ",e.jsx(t.code,{children:"npm init vite-pages library-demo -- --template lib"})," to initialize a library project, or"]}),`
`,e.jsxs(t.li,{children:["execute ",e.jsx(t.code,{children:"npm init vite-pages library-monorepo-demo -- --template lib-monorepo"})," to initialize a library project with monorepo setup."]}),`
`,e.jsxs(t.li,{children:["If you are using ",e.jsx(t.strong,{children:"npm 6.x"}),", the extra double-dash before ",e.jsx(t.code,{children:"--template"})," should be deleted. For example, ",e.jsx(t.code,{children:"npm init vite-pages app-demo --template app"}),"."]}),`
`]}),`
`]}),`
`,e.jsx(t.li,{children:e.jsx(t.code,{children:"npm install"})}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"npm run dev"})," and play with the local dev environment."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"npm run build"}),"."]}),`
`,e.jsxs(t.li,{children:[e.jsx(t.code,{children:"npm run ssr"}),". You can ",e.jsx(t.a,{href:"https://developer.chrome.com/docs/devtools/javascript/disable/",children:"disable javascript in your browser"}),", to verify if it can still render."]}),`
`]}),`
`,e.jsx(t.h3,{id:"read-the-documentation",children:"Read the documentation"}),`
`,e.jsxs(t.p,{children:["Read ",e.jsx(t.a,{href:"https://vitejs.github.io/vite-plugin-react-pages/",children:"the documentation of vite-plugin-react-pages"}),"."]})]})}function a(i={}){const{wrapper:t}={...s(),...i.components};return t?e.jsx(t,{...i,children:e.jsx(n,{...i})}):n(i)}const l=Object.freeze(Object.defineProperty({__proto__:null,default:a},Symbol.toStringTag,{value:"Module"})),r={};r.outlineInfo=o;r.main=l;export{r as default};
