import{p as i}from"./i18n_-a_As-G4O.js";import{u as o,j as e}from"./ssg-client-Q8WOSgrZ.js";function a(t){const n={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...o(),...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h1,{id:"internationalization",children:"Internationalization"}),`
`,e.jsxs(n.p,{children:["i18n support can be provided by theme. For example, ",e.jsx(n.a,{href:"/official-theme",children:"the official theme(vite-pages-theme-doc)"})," supports i18n. This document shows how to create a multi-lingual site with it."]}),`
`,e.jsx(n.h2,{id:"define-i18n-metadata-in-the-theme-config",children:"Define i18n metadata in the theme config"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.a,{href:"/official-theme",children:"the official theme(vite-pages-theme-doc)"})," accepts 1i8n config like this:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { createTheme } from 'vite-pages-theme-doc'

export default createTheme({
  i18n: {
    defaultLocale: 'en',
    topBarLocaleSelector: true,
    locales: {
      en: {
        label: 'English',
        lang: 'en', // this will be set as the \`lang\` attribute on <html>
        routePrefix: '/',
      },
      zh: {
        label: '中文',
        lang: 'zh-CN',
        routePrefix: '/zh',
      },
    },
  },
  /** Other configs... */
})
`})}),`
`,e.jsxs(n.p,{children:["Here is the type definition of the ",e.jsx(n.code,{children:"i18n"})," property (",e.jsx(n.code,{children:"I18nConfig"}),"):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`interface I18nConfig {
  /**
   * The localeKey of default locale
   * If a page have pagePath that doesn't match any \`LocalConfig.routePrefix\`,
   *  the \`I18nConfig.defaultLocale\` will apply to it
   */
  defaultLocale: string
  /**
   * If true, this theme will render a locale selector at topbar
   * Only matters when you have more than one locales
   * @defaultValue true
   */
  topBarLocaleSelector?: boolean
  /**
   * Define all locales that your site supports
   * Map localeKey to locale config
   */
  locales: Record<string, LocalConfig>
}

interface LocalConfig {
  /**
   * This will be set as the lang attribute on <html>
   */
  lang?: string
  /**
   * This label will be used when rendering the locale
   * in the locale selector
   */
  label?: string
  /**
   * If a page have pagePath with this prefix, this locale will apply to it
   * If a page have pagePath that doesn't match any routePrefix,
   *  the \`I18nConfig.defaultLocale\` will apply to it
   */
  routePrefix?: string
}
`})}),`
`,e.jsxs(n.p,{children:["With this i18n metadata, the theme can decide which locale to apply. For any specific page, it matches its pagePath with each ",e.jsx(n.code,{children:"LocalConfig.routePrefix"}),":"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["If the pagePath matches with a ",e.jsx(n.code,{children:"LocalConfig.routePrefix"}),", this locale will apply to the page"]}),`
`,e.jsxs(n.li,{children:["If the pagePath doesn't match any routePrefix, the ",e.jsx(n.code,{children:"I18nConfig.defaultLocale"})," will apply to the page"]}),`
`]}),`
`,e.jsxs(n.p,{children:["With the example config above, page ",e.jsx(n.code,{children:"/foo$.tsx"})," will have the locale keyed with ",e.jsx(n.code,{children:"en"}),". Page ",e.jsx(n.code,{children:"/zh/foo$.tsx"})," will have the locale keyed with ",e.jsx(n.code,{children:"zh"}),"."]}),`
`,e.jsx(n.p,{children:'What does it mean when we say "the page P has locale L" (or "locale L applies to page P")? It means two things:'}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Most site-level theme configs can decide their value based on the currently applied locale. So that you can render ",e.jsx(n.code,{children:"topNavs"})," and ",e.jsx(n.code,{children:"sideNavs"})," with the correct language."]}),`
`,e.jsxs(n.li,{children:["In any React Component, you can get the currently applied locale from ",e.jsx(n.code,{children:"useThemeCtx()"})," so that you can decide which i18n translated message to render."]}),`
`]}),`
`,e.jsx(n.p,{children:"We will talk about these techniques in the following sections."}),`
`,e.jsx(n.h2,{id:"return-theme-config-according-to-the-current-locale",children:"Return theme config according to the current locale"}),`
`,e.jsxs(n.p,{children:["All ",e.jsx(n.a,{href:"/official-theme#theme-configs",children:"theme config"})," (",e.jsx(n.code,{children:"topNavs"}),", ",e.jsx(n.code,{children:"sideNavs"}),", ",e.jsx(n.code,{children:"logo"}),", etc.) ",e.jsx(n.strong,{children:"that accepts a value"})," can also accept a config function, so that you can get the current locale info from the function argument(",e.jsx(n.code,{children:"ThemeContextValue"}),"). For example, here is the type definition of the theme config ",e.jsx(n.code,{children:"topNavs"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`interface ThemeConfig {
  /** ... */
  topNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: ThemeContextValue) => ReadonlyArray<MenuConfig> | null | undefined)
}

type ThemeContextValue = {
  /** ... */
  resolvedLocale: {
    locale?: LocalConfig
    localeKey?: string
    pagePathWithoutLocalePrefix?: string
  }
}
`})}),`
`,e.jsxs(n.p,{children:["To make topNavs support multiple languages, you can define ",e.jsx(n.code,{children:"topNavs"})," like this:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-ts",children:`import { createTheme } from 'vite-pages-theme-doc'
import type { MenuConfig } from 'vite-pages-theme-doc'

const topNavsConfig: { [locale: string]: MenuConfig[] } = {
  en: [
    { label: 'Home', path: '/' },
    {
      label: 'Guide',
      path: '/guide/introduce',
    },
    {
      subMenu: 'Links',
      children: [
        {
          label: 'Resources',
          path: '/resources',
        },
        {
          label: 'Vite',
          href: 'https://vitejs.dev/',
        },
      ],
    },
  ],
  zh: [
    { label: '首页', path: '/zh' },
    {
      label: '指南',
      path: '/zh/guide/introduce',
    },
    {
      subMenu: '链接',
      children: [
        {
          label: '资源',
          path: '/zh/resources',
        },
        {
          label: 'Vite',
          href: 'https://vitejs.dev/',
        },
      ],
    },
  ],
}

export default createTheme({
  /** ... */
  topNavs: ({ resolvedLocale: { localeKey } }) => {
    // return config according to resolvedLocale
    return topNavsConfig[localeKey!]
  },
})
`})}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:[e.jsx(n.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/1a67c7c41f6fb488243183bf6814550d85ce5c23/packages/playground/use-theme-doc/pages/_theme.tsx#L27",children:"Here is a complete example project"}),"."]}),`
`]}),`
`,e.jsx(n.h2,{id:"create-pages-for-each-locale",children:"Create pages for each locale"}),`
`,e.jsx(n.p,{children:"Your project file structure should be like this:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-txt",children:`docs
├─ foo$.md
├─ bar$.tsx
├─ nested
│  └─ baz$.md
└─ zh
   ├─ foo$.md
   ├─ bar$.tsx
   └─ nested
      └─ baz.md
`})}),`
`,e.jsxs(n.p,{children:["Each page with the default locale should have its translated version. For example, ",e.jsx(n.code,{children:"/zh/foo$.md"})," should be the Chinese-translated version of ",e.jsx(n.code,{children:"/foo$.md"}),"."]}),`
`,e.jsx(n.h3,{id:"markdown-pages-translate-them-into-each-locale",children:"Markdown pages: translate them into each locale"}),`
`,e.jsxs(n.p,{children:["Here is a markdown page for the default locale (",e.jsx(n.code,{children:"/foo$.md"}),"):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-md",children:`---
title: This is the title written in the default locale
---

This is the markdown content written in the default locale.
`})}),`
`,e.jsxs(n.p,{children:["Here is the translated markdown page (",e.jsx(n.code,{children:"/zh/foo$.md"}),"):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-md",children:`---
title: This is the translated title
---

This is the translated markdown content.
`})}),`
`,e.jsx(n.h3,{id:"react-component-pages-support-all-locales-within-them",children:"React Component pages: support all locales within them"}),`
`,e.jsxs(n.p,{children:["If you define a page with React Component (",e.jsx(n.code,{children:".tsx"}),"), it is recommended to make it support all locales, instead of defining a new React Component for each locale."]}),`
`,e.jsxs(n.p,{children:["For example, here is a React Component page for default locale (",e.jsx(n.code,{children:"/bar$.tsx"}),"):"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`/**
 * @title This is the title written in default locale
 */

import React from 'react'
import { useThemeCtx } from 'vite-pages-theme-doc'

const Page = () => {
  const intl = useIntl()
  return <p>{messages['page.page1.content']}</p>
}

/**
 * In a more complex app, you can use i18n library like \`react-intl\`
 * to make a React Component support multiple languages
 */
function useIntl() {
  const {
    resolvedLocale: { localeKey },
  } = useThemeCtx()
  return messages[localeKey]
}

const messages = {
  en: {
    'page.page1.content': 'This is Page1 content',
  },
  zh: {
    'page.page1.content':
      'This is translated Page1 content for the locale \`zh\`',
  },
}

export default Page
`})}),`
`,e.jsxs(n.p,{children:["When defining the page for the other locale (",e.jsx(n.code,{children:"/zh/bar$.tsx"}),"), you can ",e.jsx(n.strong,{children:"re-export the React Component"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`/**
 * @title This is the translated title for the locale \`zh\`
 */

export { default } from '../bar$'
`})}),`
`,e.jsxs(n.p,{children:["Notice that we reuse the same React Component for multiple locales. And we define page static metadata(",e.jsx(n.code,{children:"@title"}),") with correct translation in each page file."]}),`
`,e.jsxs(n.blockquote,{children:[`
`,e.jsxs(n.p,{children:["When using i18n library like ",e.jsx(n.code,{children:"react-intl"}),", and you need to wrap your App with some custom React Component, you can use ",e.jsx(n.code,{children:"ThemeConfig.AppWrapper"}),"."]}),`
`]}),`
`,e.jsx(n.h3,{id:"get-the-current-locale-in-react-components-or-hooks",children:"Get the current locale in React Components or Hooks"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`import { useThemeCtx } from 'vite-pages-theme-doc'

function useI18nMeta() {
  const {
    resolvedLocale,
    themeConfig: { i18n },
  } = useThemeCtx()
  // get resolvedLocale and i18nConfig from \`useThemeCtx()\`
  return { resolvedLocale, i18nConfig: i18n }
}
`})})]})}function c(t={}){const{wrapper:n}={...o(),...t.components};return n?e.jsx(n,{...t,children:e.jsx(a,{...t})}):a(t)}const s=Object.freeze(Object.defineProperty({__proto__:null,default:c},Symbol.toStringTag,{value:"Module"})),l={};l.outlineInfo=i;l.main=s;export{l as default};
