// this module exists so that users or themes can import utils from it:
// import { useStaticData } from "vite-plugin-react-pages/client"

// This module can be imported by theme. So:
// - This module can't import vite-pages core. Otherwise vite will try to optimize vite-pages core during dev (when theme been optimized or built).
// - This module can be duplicated (due to dep optimization, or built step of themes) and been executed multiple times

import type {
  UseStaticData,
  UseAllPagesOutlines,
  SSRPlugin,
} from './clientTypes'

// access globalThis['__vite_pages_use_static_data'] lazily
export const useStaticData: UseStaticData = (...params: any[]) => {
  const actualUseStaticData = (globalThis as any)[
    '__vite_pages_use_static_data'
  ]
  return actualUseStaticData(...params)
}

export const useAllPagesOutlines: UseAllPagesOutlines = (...params) => {
  const actualHook = (globalThis as any)['__vite_pages_use_all_pages_outlines']
  return actualHook(...params)
}

export type { Theme } from './clientTypes'

export const IS_SSR = process.env.VITE_PAGES_IS_SSR === 'true'

/**
 * With ssr plugins, users can hook into the ssr process.
 *
 * For example, you can extract style from css-in-js tools to render it in ssr output(HTML):
 * https://ant.design/docs/react/customize-theme#server-side-render-ssr
 *
 * Register ssr plugin with dynamic import function,
 * so that your ssr code will not increase client bundle size.
 */
export function registerSSRPlugin(importSSRPlugin: () => Promise<SSRPlugin>) {
  const impl = (globalThis as any)['register_vite_pages_ssr_plugin']
  return impl?.(importSSRPlugin)
}
