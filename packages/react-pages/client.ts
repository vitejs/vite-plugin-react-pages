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

// export function useSSRPlugin(ssrPlugin: SSRPlugin) {
//   ;(globalThis as any)['__vite_pages_useSSRPlugin'](ssrPlugin)
// }
