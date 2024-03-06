import{p as i}from"./official-theme_-MUJZInIc.js";import{u as a,j as n}from"./ssg-client-Q8WOSgrZ.js";const c=`import type { MenuConfig } from './Layout/renderMenu'
import type { FooterConfig, FooterColumn, FooterLink } from './Layout/Footer'
import type {
  PagesStaticData,
  ThemeProps,
} from 'vite-plugin-react-pages/clientTypes'
import type { PageGroups } from './analyzeStaticData'

export interface ThemeConfig {
  /**
   * Logo at top bar
   */
  logo?: React.ReactNode | ((ctx: ThemeContextValue) => React.ReactNode)
  /**
   * Logo link path
   * @defaultValue "/"
   */
  logoLink?:
    | string
    | null
    | undefined
    | ((ctx: ThemeContextValue) => string | null | undefined)
  /**
   * Navigation menu at top bar.
   */
  topNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: ThemeContextValue) => ReadonlyArray<MenuConfig> | null | undefined)
  /**
   * Side menu.
   */
  sideNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: ThemeContextValue) => ReadonlyArray<MenuConfig> | null | undefined)
  /**
   * Extra area at top bar.
   */
  TopBarExtra?: React.ComponentType<React.PropsWithChildren<unknown>>
  /**
   * Footer
   */
  footer?:
    | FooterConfig
    | ((ctx: ThemeContextValue) => FooterConfig | null | undefined)
  /**
   * Component to be rendered when app in 404 state
   * (url not matching any page)
   */
  Component404?: React.ComponentType<React.PropsWithChildren<unknown>>
  /**
   * Component to be rendered when app is loading js bundle
   */
  ComponentLoading?: React.ComponentType<React.PropsWithChildren<unknown>>
  /**
   * Wrap the App with custom Component.
   * You can use \`useThemeCtx()\` in it to get context info
   */
  AppWrapper?: React.ComponentType<React.PropsWithChildren<unknown>>
  /**
   * i18n metadata
   */
  i18n?: I18nConfig
  /**
   * Whether enable search feature
   * @defaultValue true
   */
  search?: boolean
}

export interface I18nConfig {
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

export interface LocalConfig {
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

export type ThemeContextValue = ThemeProps & {
  themeConfig: ThemeConfig
  staticData: PagesStaticData
  /**
   * The resolved locale data of the current page
   */
  resolvedLocale: {
    /**
     * the locale config object that is currently activated
     */
    locale?: LocalConfig
    /**
     * The key of the locale config object inside \`I18nConfig.locales\` object
     */
    localeKey?: string
    /**
     * Current pagePath without locale routePrefix.
     * For example, page \`/zh/foo\` will have pagePathWithoutLocalePrefix \`/foo\`
     */
    pagePathWithoutLocalePrefix?: string
  }
  pageGroups: PageGroups
}

export type { MenuConfig, FooterConfig, FooterColumn, FooterLink }
`;function r(o){const e={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...a(),...o.components},{FileText:t}=e;return t||h("FileText",!0),n.jsxs(n.Fragment,{children:[n.jsx(e.h1,{id:"official-theme",children:"Official Theme"}),`
`,n.jsxs(e.p,{children:[n.jsx(e.code,{children:"vite-pages-theme-doc"})," is an official theme of vite-pages. It should satisfy most users' needs. This document site is powered by this theme."]}),`
`,n.jsx(e.h2,{id:"how-to-use",children:"How to use"}),`
`,n.jsxs(e.p,{children:["You should config the theme in ",n.jsx(e.code,{children:"_theme.tsx"}),":"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{className:"language-tsx",children:`// _theme.tsx
import React from 'react'
import { createTheme } from 'vite-pages-theme-doc'

export default createTheme({
  topNavs: [
    { label: 'index', path: '/' },
    { label: 'Vite', href: 'https://github.com/vitejs/vite' },
  ],
  logo: 'Vite Pages',
  // Other configs...
})
`})}),`
`,n.jsxs(e.p,{children:[n.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/tree/main/packages/playground/use-theme-doc",children:"Here is a complete example"}),"."]}),`
`,n.jsx(e.h2,{id:"auto-side-menu-generation",children:"Auto side menu generation"}),`
`,n.jsx(e.p,{children:"Doc theme can generate a side menu automatically, based on the pages information."}),`
`,n.jsxs(e.p,{children:["You can control the title/sorting/grouping of the side menu, by notating these ",n.jsx(e.a,{href:"/page-data#static-data",children:"page static data"}),":"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsx(e.li,{children:"title"}),`
`,n.jsx(e.li,{children:"order (default order is 1)"}),`
`,n.jsx(e.li,{children:"group (explain later)"}),`
`,n.jsx(e.li,{children:"subGroup (explain later)"}),`
`]}),`
`,n.jsx(e.h3,{id:"how-side-menu-generation-works",children:"How side menu generation works"}),`
`,n.jsx(e.p,{children:"For example, if your site has these pages:"}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{children:`/
/playground
/components
/components/button
/components/card
/references/glossary
/references/apis/api1
/references/apis/api2
/references/error-codes/code1
/references/error-codes/code2
`})}),`
`,n.jsxs(e.p,{children:["Firstly, the theme will divide pages into ",n.jsx(e.code,{children:"group"}),"s based on the ",n.jsx(e.strong,{children:"first segment"})," of the page path:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{children:`group /:
  /
  /playground

group components:
  /components
  /components/button
  /components/card

group references:
  /references/glossary
  /references/apis/api1
  /references/apis/api2
  /references/error-codes/code1
  /references/error-codes/code2
`})}),`
`,n.jsxs(e.p,{children:["You can customize ",n.jsx(e.code,{children:"group"})," in page static data. For example:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{children:`Put this at the top of a markdown page:
---
group: references
---
Or put this at the top of a TSX/JSX page:
/**
 * @group references
 */
`})}),`
`,n.jsxs(e.p,{children:["Then, the theme will divide pages into ",n.jsx(e.code,{children:"subGroup"}),"s based on the ",n.jsx(e.strong,{children:"second segment"})," of pages' path:"]}),`
`,n.jsx(e.pre,{children:n.jsx(e.code,{children:`group /:
  subGroup /:
    /
    /playground

group components:
  subGroup /:
    /components
    /components/button
    /components/card

group references:
  subGroup /:
    /references/glossary
  subGroup apis:
    /references/apis/api1
    /references/apis/api2
  subGroup error-codes:
    /references/error-codes/code1
    /references/error-codes/code2
`})}),`
`,n.jsxs(e.p,{children:[n.jsx(e.code,{children:"subGroup"})," can also be customized in page static data, just like ",n.jsx(e.code,{children:"group"})," does."]}),`
`,n.jsxs(e.p,{children:["What is the meaning of ",n.jsx(e.code,{children:"group"})," and ",n.jsx(e.code,{children:"subGroup"}),"?"]}),`
`,n.jsxs(e.ul,{children:[`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"group"})," is a site isolation boundary: we only display ",n.jsx(e.strong,{children:"one"})," ",n.jsx(e.code,{children:"group"})," at a time. If a user opens a page in the group ",n.jsx(e.code,{children:"references"}),", he/she will ",n.jsx(e.strong,{children:"only see side menu items from that group"}),". He/She will not see menu items from ",n.jsx(e.code,{children:"components"})," group."]}),`
`,n.jsxs(e.li,{children:[n.jsx(e.code,{children:"subGroup"})," decides how the theme sorts the side menu items. All side menu items with the same ",n.jsx(e.code,{children:"subGroup"})," will be rendered adjacently. This document site is an example."]}),`
`]}),`
`,n.jsx(e.h2,{id:"theme-configs",children:"Theme configs"}),`
`,n.jsxs(e.p,{children:["The ",n.jsx(e.code,{children:"createTheme"})," exported by ",n.jsx(e.code,{children:"vite-pages-theme-doc"})," accepts ",n.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/theme-doc/src/index.tsx",children:"these options"}),":"]}),`
`,n.jsx(t,{text:c,syntax:"ts"}),`
`,n.jsx(e.h2,{id:"fully-theme-customization",children:"Fully theme customization"}),`
`,n.jsxs(e.p,{children:["If the basic theme doesn't satisfy your needs, you can ",n.jsx(e.a,{href:"/theme-customization",children:"create your own theme"}),"."]}),`
`,n.jsxs(e.blockquote,{children:[`
`,n.jsxs(e.p,{children:["Contributions to ",n.jsx(e.a,{href:"https://github.com/vitejs/vite-plugin-react-pages/tree/main/packages/theme-doc",children:"the theme"})," are always welcomed."]}),`
`]})]})}function l(o={}){const{wrapper:e}={...a(),...o.components};return e?n.jsx(e,{...o,children:n.jsx(r,{...o})}):r(o)}function h(o,e){throw new Error("Expected "+(e?"component":"object")+" `"+o+"` to be defined: you likely forgot to import, pass, or provide it.")}const d=Object.freeze(Object.defineProperty({__proto__:null,default:l},Symbol.toStringTag,{value:"Module"})),s={};s.outlineInfo=i;s.main=d;export{s as default};
