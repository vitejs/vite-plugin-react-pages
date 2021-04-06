// This module can be imported by theme, which may be optimized by vite
// so this module must be optimizable too.
// should not contains "import initialPages from '/@react-pages/pages'",
// otherwise vite will throw error when optimizing theme: Could not resolve "/@react-pages/pages"

import type { PageLoaded, UseStaticData, Theme } from './clientTypes'

export let useTheme: () => Theme
export let usePagePaths: () => string[]
export let usePageModule: (path: string) => Promise<PageModule> | undefined
export let useStaticData: UseStaticData

interface PageModule {
  ['default']: PageLoaded
}

export const setUseTheme = (v: typeof useTheme) => (useTheme = v)
export const setUsePagePaths = (v: typeof usePagePaths) => (usePagePaths = v)
export const setUsePageModule = (v: typeof usePageModule) => (usePageModule = v)
export const setUseStaticData = (v: typeof useStaticData) => (useStaticData = v)

const key: any = '__vite-pages-state-declaration-singleton'
if (window[key]) {
  throw new Error(
    'There are multiple copies of vite-pages-state-declaration. Please report this issue to vite-plugin-react-pages.'
  )
}
;(window as any)[key] = true
