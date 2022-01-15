# Basic theme

**This theme is deprecated. Please use vite-pages-theme-doc instead.**

`vite-pages-theme-basic` provides a nice theme. It should satisfy most users' needs. This document site is powered by this theme.

## How to use

You should config the theme in `_theme.tsx`:

```tsx
// _theme.tsx
import React from 'react'
import { createTheme } from 'vite-pages-theme-basic'

export default createTheme({
  topNavs: [
    { text: 'index', path: '/' },
    { text: 'Vite', href: 'https://github.com/vitejs/vite' },
  ],
  logo: 'Vite Pages',
  // Other configs...
})
```

[Here is a complete example](https://github.com/vitejs/vite-plugin-react-pages/tree/main/packages/playground/use-theme).

## Auto menu generation

Basic theme can generation a side navigation menu automatically, based on the pages information.

You can control the label and sorting of the nav menu, by notating these _page static data_:

- title
- sort (default value is 1)

For **markdown pages**, notate the static data like this:

```text
---
title: Basic Theme
order: 0.5
---

markdown content...
```

For **jsx/tsx pages**, notate the static data like this:

```js
/**
 * @title page1 title
 * @sort 1
 */

// js code....
```

## Page search

Basic theme also generate a search box automatically. It help readers to filter pages by their titles. As an example, you can find the search box at the topbar of this document site.

> You can turn off the auto-generated search box in the theme configs. You can also customize the topbar operations area.

## Theme configs

The `createTheme` exported by `vite-pages-theme-basic` accepts [these options](https://github.com/vitejs/vite-plugin-react-pages/blob/main/packages/theme-basic/src/index.tsx):

```ts
interface Option {
  /**
   * Take fully control of side nav menu.
   */
  sideMenuData?: SideMenuData[]
  /**
   * Navigation menu at top bar.
   */
  topNavs?: TopNavData[]
  /**
   * Logo area at top bar.
   */
  logo?: React.ReactNode
  /**
   * Operation area at top bar.
   */
  topbarOperations?: React.ReactNode
  /**
   * Footer area.
   */
  footer?: React.ReactNode
  /**
   * Enable search.
   * @default true
   */
  search?: boolean
}

export type SideMenuData = { text: string; path: string }

export type TopNavData =
  | {
      text: string
      /**
       * The url.
       * @example 'https://www.google.com/'
       */
      href: string
    }
  | {
      text: string
      /**
       * The path in the current webapp.
       * @example '/posts/hello-world'
       */
      path: string
    }
```

## Fully theme customization

If the basic theme doesn't satisfy your need, you can [create your own theme](https://vitejs.github.io/vite-plugin-react-pages/#/theme-customization).

> Contributions to [the basic theme](https://github.com/vitejs/vite-plugin-react-pages/tree/main/packages/theme-basic) are always welcomed.
