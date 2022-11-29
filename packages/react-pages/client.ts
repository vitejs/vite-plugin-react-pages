// this module exists so that users or themes can:
// import { useStaticData } from "vite-plugin-react-pages/client"

// This module can be imported by theme, which may be optimized by vite
// so this module must be optimizable too.
// So this module can't import vite-pages core.
// Otherwise vite will try to optimize vite-pages core during dev.

import type { UseStaticData } from './clientTypes'

// access globalThis['__vite_pages_use_static_data'] lazily
export const useStaticData: UseStaticData = (...params: any[]) => {
  const actualUseStaticData = (globalThis as any)[
    '__vite_pages_use_static_data'
  ]
  return actualUseStaticData(...params)
}

export function fetchAllPagesOutlines() {
  return import('/@react-pages/allPagesOutlines').then(
    ({ allPagesOutlines }) => allPagesOutlines
  )
}

export type { Theme } from './clientTypes'
