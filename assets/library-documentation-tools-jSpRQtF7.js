import{p as d}from"./index_-BeUvaIp7.js";import{j as e,u as l}from"./ssg-client-Q8WOSgrZ.js";const c=`import type { MyImportedTypeAlias } from './typesUtils'
export type { ReExportedInterface } from './typesUtils'
export type MyExportedTypeAlias = { a: number }
type MyTypeAlias = { a: number }
export interface MyExportedInterface {
  a: number
}
interface MyInterface {
  a: number
}

/**
 * This is the description of the Button component's props
 */
export interface ButtonProps<TestGenerics extends string> extends Base {
  /**
   * the type of button
   * @defaultValue 'default'
   */
  type?: 'primary' | 'default' | 'text'
  /**
   * the size of button
   * @defaultValue 'middle'
   */
  size?: 'large' | 'middle' | 'small' | TestGenerics
  /**
   * loading state of button
   * @defaultValue false
   */
  loading?: boolean
  /**
   * click handler
   */
  onClick?: (event: React.MouseEvent) => void
  /** test method declaration */
  testMethod(param: MyExportedTypeAlias): MyTypeAlias
  /** test required property */
  testRequired: boolean
  myExportedTypeAlias: MyExportedTypeAlias
  myTypeAlias: MyTypeAlias
  myExportedInterface: MyExportedInterface
  myInterface: MyInterface
  myImportedTypeAlias: MyImportedTypeAlias
  /** test call signatures */
  (options?: { ignorePending?: true }): Array<string | Promise<string>>
  (options: { ignorePending: false }): string[]
  /** test construct signatures */
  new (options: string): MyInterface
  new (): MyInterface
}

interface Base {
  /**
   * children content
   */
  children: React.ReactNode
}

export type SomeObjectLiteralType<TestGenerics> = {
  /**
   * the type of button
   * @defaultValue 'default'
   */
  type?: 'primary' | 'default' | 'text'
  /**
   * the size of button
   * @defaultValue 'middle'
   */
  size?: 'large' | 'middle' | 'small' | TestGenerics
  /**
   * loading state of button
   * @defaultValue false
   */
  loading?: boolean
  /**
   * click handler
   */
  onClick?: (event: React.MouseEvent) => void
  /** test method declaration */
  testMethod(param: MyInterface): MyExportedInterface
  /** test required property */
  testRequired: boolean
  myExportedTypeAlias: MyExportedTypeAlias
  myTypeAlias: MyTypeAlias
  myExportedInterface: MyExportedInterface
  myInterface: MyInterface
  myImportedTypeAlias: MyImportedTypeAlias
  /** test call signatures */
  (options?: { ignorePending?: true }): Array<string | Promise<string>>
  (options: { ignorePending: false }): string[]
  /** test construct signatures */
  new (options: string): MyInterface
  new (): MyInterface
}

/**
 * Description of SomeComplexType ...
 */
export type SomeComplexType = 0 | 1 | 'a' | 'b' | { key: string }
`,u={type:"interface",name:"ButtonProps",description:"This is the description of the Button component's props",properties:[{name:"type",description:"the type of button",type:'"primary" | "default" | "text"',defaultValue:"'default'",optional:!0},{name:"size",description:"the size of button",type:'TestGenerics | "large" | "middle" | "small"',defaultValue:"'middle'",optional:!0},{name:"loading",description:"loading state of button",type:"boolean",defaultValue:"false",optional:!0},{name:"onClick",description:"click handler",type:"(event: React.MouseEvent) => void",defaultValue:"",optional:!0},{name:"testMethod",description:"test method declaration",type:"(param: MyExportedTypeAlias) => MyTypeAlias",defaultValue:"",optional:!1},{name:"testRequired",description:"test required property",type:"boolean",defaultValue:"",optional:!1},{name:"myExportedTypeAlias",description:"",type:"MyExportedTypeAlias",defaultValue:"",optional:!1},{name:"myTypeAlias",description:"",type:"MyTypeAlias",defaultValue:"",optional:!1},{name:"myExportedInterface",description:"",type:"MyExportedInterface",defaultValue:"",optional:!1},{name:"myInterface",description:"",type:"MyInterface",defaultValue:"",optional:!1},{name:"myImportedTypeAlias",description:"",type:"MyImportedTypeAlias",defaultValue:"",optional:!1},{name:"children",description:"children content",type:"React.ReactNode",defaultValue:"",optional:!1}],callSignatures:[{description:"test call signatures",type:"(options?: { ignorePending?: true }): Array<string | Promise<string>>"},{description:"",type:"(options: { ignorePending: false }): string[]"}],constructSignatures:[{description:"test construct signatures",type:"new (options: string): MyInterface"},{description:"",type:"new (): MyInterface"}]},y=Object.freeze(Object.defineProperty({__proto__:null,data:u},Symbol.toStringTag,{value:"Module"})),m={type:"object-literal",name:"SomeObjectLiteralType",description:"",properties:[{name:"type",description:"the type of button",type:'"primary" | "default" | "text"',defaultValue:"'default'",optional:!0},{name:"size",description:"the size of button",type:'TestGenerics | "large" | "middle" | "small"',defaultValue:"'middle'",optional:!0},{name:"loading",description:"loading state of button",type:"boolean",defaultValue:"false",optional:!0},{name:"onClick",description:"click handler",type:"(event: React.MouseEvent) => void",defaultValue:"",optional:!0},{name:"testMethod",description:"test method declaration",type:"(param: MyInterface) => MyExportedInterface",defaultValue:"",optional:!1},{name:"testRequired",description:"test required property",type:"boolean",defaultValue:"",optional:!1},{name:"myExportedTypeAlias",description:"",type:"MyExportedTypeAlias",defaultValue:"",optional:!1},{name:"myTypeAlias",description:"",type:"MyTypeAlias",defaultValue:"",optional:!1},{name:"myExportedInterface",description:"",type:"MyExportedInterface",defaultValue:"",optional:!1},{name:"myInterface",description:"",type:"MyInterface",defaultValue:"",optional:!1},{name:"myImportedTypeAlias",description:"",type:"MyImportedTypeAlias",defaultValue:"",optional:!1}],callSignatures:[{description:"test call signatures",type:"(options?: { ignorePending?: true }): Array<string | Promise<string>>"},{description:"",type:"(options: { ignorePending: false }): string[]"}],constructSignatures:[{description:"test construct signatures",type:"new (options: string): MyInterface"},{description:"",type:"new (): MyInterface"}]},f=Object.freeze(Object.defineProperty({__proto__:null,data:m},Symbol.toStringTag,{value:"Module"})),h={type:"other",name:"SomeComplexType",description:"Description of SomeComplexType ...",text:"0 | 1 | 'a' | 'b' | { key: string }"},x=Object.freeze(Object.defineProperty({__proto__:null,data:h},Symbol.toStringTag,{value:"Module"})),g=()=>e.jsx("button",{children:"demo1"}),j=`

import React from 'react'

const Demo1 = () => {
  return <button>demo1</button>
}

export default Demo1
`,b="Button Demo1 Title",T="Button demo1 description",I={code:j,title:b,desc:T},M=!0,A=Object.freeze(Object.defineProperty({__proto__:null,default:g,demoMeta:I,isDemo:M},Symbol.toStringTag,{value:"Module"}));function s(n){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",...l(),...n.components},{Demo:i,FileText:a,TsInfo:o}=t;return i||r("Demo",!0),a||r("FileText",!0),o||r("TsInfo",!0),e.jsxs(e.Fragment,{children:[e.jsx(t.h1,{id:"library-documentation-tools",children:"Library Documentation Tools"}),`
`,e.jsx(t.p,{children:"Vite-pages provides some tools to reduce the maintenance costs for library authors and make their documents easier to read."}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsx(t.p,{children:"These tools are mostly for library authors."}),`
`]}),`
`,e.jsx(t.h2,{id:"demos",children:"Demos"}),`
`,e.jsxs(t.p,{children:[`Demos (or stories) are the fixtures that you use when you are developing your library locally.
Vite-pages allows you to render demos into your app (which can be the document of your library). Using this feature, vite-pages app can not only serve as your `,e.jsx(t.strong,{children:"local develop environment"})," (so that you can debug your demos and your libary code locally), but also the ",e.jsx(t.strong,{children:"document for your library"})," (so that the users of your library can see your demos and lean how to use it)."]}),`
`,e.jsx(t.p,{children:"The following markdown"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`<Demo src="./demos/demo1.tsx" />
`})}),`
`,e.jsx(t.p,{children:"which will result in:"}),`
`,e.jsx(i,{...A}),`
`,e.jsx(t.h3,{id:"using-demo-api-in-js-files",children:"Using Demo API in JS files"}),`
`,e.jsx(t.p,{children:"In jsx page, You can import and render demos like this:"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`import demoData from '../demos/demo1.tsx?demo'
import { Demo } from 'vite-pages-theme-doc'

export default function Page() {
  return <Demo {...demoData} />
}
`})}),`
`,e.jsx(t.h2,{id:"extract-type-info-from-typescript-code",children:"Extract Type info from Typescript code"}),`
`,e.jsxs(t.p,{children:["Vite-pages can help you to extract Typescript type info and render it. With this feature, you ",e.jsx(t.strong,{children:"no longer need to manually maintain API information in your documents"}),"! You can reuse your interfaces (and comments in them) from your source code! This is very convenient for API documentation."]}),`
`,e.jsx(t.h3,{id:"render-interface",children:"Render Interface"}),`
`,e.jsx(t.p,{children:"The following markdown"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`<TsInfo src="./types.ts" name="ButtonProps" />
`})}),`
`,e.jsxs(t.blockquote,{children:[`
`,e.jsxs(t.p,{children:["The ",e.jsx(t.code,{children:"name"})," should be the export name of the Typescript interface."]}),`
`]}),`
`,e.jsx(t.p,{children:"will result in:"}),`
`,e.jsx(o,{...y}),`
`,e.jsx(t.h3,{id:"render-type-alias",children:"Render Type Alias"}),`
`,e.jsx(t.p,{children:"Besides interfaces, TsInfo API also supports type aliases."}),`
`,e.jsx(t.p,{children:"SomeObjectLiteralType (Object Literal):"}),`
`,e.jsx(o,{...f}),`
`,e.jsx(t.p,{children:"SomeComplexType (Complex Type):"}),`
`,e.jsx(o,{...x}),`
`,e.jsx(t.h3,{id:"using-tsinfo-api-in-js-files",children:"Using TsInfo API in JS files"}),`
`,e.jsx(t.p,{children:"In a JSX page, You can import and render tsInfo like this:"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`import tsInfoData from './types.ts?tsInfo=ButtonProps'
import { TsInfo } from 'vite-pages-theme-doc'

export default function Page() {
  return <TsInfo {...tsInfoData} />
}
`})}),`
`,e.jsx(t.h2,{id:"render-text-from-files",children:"Render text from files"}),`
`,e.jsx(t.p,{children:'You can also render text from any file. So that these files can be both "code" and "documentation".'}),`
`,e.jsx(t.p,{children:"The following markdown"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`<FileText src="./types.ts" syntax="ts" />
`})}),`
`,e.jsx(t.p,{children:"will result in:"}),`
`,e.jsx(a,{text:c,syntax:"ts"}),`
`,e.jsx(t.p,{children:"In a JSX page, You can render file text like this:"}),`
`,e.jsx(t.pre,{children:e.jsx(t.code,{className:"language-tsx",children:`// https://vitejs.dev/guide/assets.html#importing-asset-as-string
import text from './types.ts?raw'
import { FileText } from 'vite-pages-theme-doc'

export default function Page() {
  return <FileText text={text} syntax="ts" />
}
`})}),`
`,e.jsx(t.h2,{id:"examples",children:"Examples"}),`
`,e.jsxs(t.p,{children:["You can check out ",e.jsx(t.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/create-project/template-lib/src/Button/README.md",children:"template-lib"})," as an example. (You can ",e.jsx(t.a,{href:"https://stackblitz.com/fork/github/vitejs/vite-plugin-react-pages/tree/main/packages/create-project/template-lib?file=src%2FButton%2FREADME.md&terminal=dev",children:"view it online"})," or ",e.jsx(t.a,{href:"https://vitejs.github.io/vite-plugin-react-pages/",children:"init this project locally"}),")"]})]})}function v(n={}){const{wrapper:t}={...l(),...n.components};return t?e.jsx(t,{...n,children:e.jsx(s,{...n})}):s(n)}function r(n,t){throw new Error("Expected "+(t?"component":"object")+" `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}const E=Object.freeze(Object.defineProperty({__proto__:null,default:v},Symbol.toStringTag,{value:"Module"})),p={};p.outlineInfo=d;p.main=E;export{p as default};
