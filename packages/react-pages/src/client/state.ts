import { useMemo } from 'react'
import { dequal } from 'dequal'
import type { SetAtom } from 'jotai/core/types'
import { atom, useAtom } from 'jotai'
import { atomFamily, useAtomValue, useUpdateAtom } from 'jotai/utils'
import type { Theme } from '../../clientTypes'

// import state setter
import {
  setUseTheme,
  setUsePagePaths,
  setUsePageModule,
  setUseStaticData,
} from 'vite-plugin-react-pages/_state_declaration'
// re-export state
export {
  useTheme,
  usePagePaths,
  usePageModule,
  useStaticData,
} from 'vite-plugin-react-pages/_state_declaration'

import initialPages from '/@react-pages/pages'
import initialTheme from '/@react-pages/theme'

// TODO: simplify this
// there is no easy way to handle the hmr of module such as `/@react-pages/pages/page1` so stop trying it
// https://github.com/vitejs/vite-plugin-react-pages/pull/19#discussion_r604251258

const initialPagePaths = Object.keys(initialPages)

// This HMR code assumes that our Jotai atoms are always managed
// by the same Provider. It also mutates during render, which is
// generally discouraged, but in this case it's okay.
if (import.meta.hot) {
  let setTheme: SetAtom<{ Theme: Theme }> | undefined
  import.meta.hot!.accept('/@react-pages/theme', (module) => {
    setTheme?.({ Theme: module.default })
  })

  const themeAtom = atom({ Theme: initialTheme })
  setUseTheme(() => {
    const [{ Theme }, set] = useAtom(themeAtom)
    setTheme = set
    return Theme
  })

  let setPages: SetAtom<any> | undefined
  import.meta.hot!.accept('/@react-pages/pages', (module) => {
    setPages?.(module.default)
  })

  const pagesAtom = atom(initialPages)
  const pagePathsAtom = atom(initialPagePaths.sort())
  const staticDataAtom = atom(toStaticData(initialPages))

  const setPagesAtom = atom(null, (get, set, newPages: any) => {
    let newStaticData: Record<string, any> | undefined

    const pages = get(pagesAtom)
    for (const path in newPages) {
      const newPage = newPages[path]
      const page = pages[path]

      // Avoid changing the identity of `page.staticData` unless
      // a change is detected. This prevents unnecessary renders
      // of components that depend on `useStaticData(path)` call.
      if (page && dequal(page.staticData, newPage.staticData)) {
        newPage.staticData = page.staticData
      } else {
        newStaticData ??= {}
        newStaticData[path] = newPage.staticData
      }
    }

    // detect deleted pages
    for (const path in pages) {
      if (!newPages[path]) {
        newStaticData ??= {}
        newStaticData[path] = undefined
      }
    }

    // Update the `pagesAtom` every time, since no hook uses it directly.
    set(pagesAtom, newPages)

    // Avoid re-rendering `useStaticData()` callers if no data changed.
    if (newStaticData) {
      newStaticData = {
        ...get(staticDataAtom),
        ...newStaticData,
      }
      // filter out deleted paths
      newStaticData = Object.fromEntries(
        Object.entries(newStaticData).filter(([k, v]) => v !== undefined)
      )
      set(staticDataAtom, newStaticData)
    }

    // Avoid re-rendering `usePagePaths()` callers if no paths were added/deleted.
    const newPagePaths = Object.keys(newPages).sort()
    if (!dequal(get(pagePathsAtom), newPagePaths)) {
      set(pagePathsAtom, newPagePaths)
    }
  })

  const dataAtoms = atomFamily((path: string) => (get) => {
    const pages = get(pagesAtom)
    return pages[path]
  })

  const staticDataAtoms = atomFamily((path: string) => (get) => {
    const pages = get(pagesAtom)
    const page = pages[path]
    return page?.staticData
  })

  setUsePagePaths(() => {
    setPages = useUpdateAtom(setPagesAtom)
    return useAtomValue(pagePathsAtom)
  })

  setUsePageModule((pagePath) => {
    const data = useAtomValue(dataAtoms(pagePath))
    return useMemo(() => data?.data(), [data])
  })

  setUseStaticData((pagePath?: string, selector?: Function) => {
    const staticData = pagePath ? staticDataAtoms(pagePath) : staticDataAtom
    if (selector) {
      const selection = useMemo(
        () => atom((get) => selector(get(staticData))),
        [staticData]
      )
      return useAtomValue(selection)
    }
    return useAtomValue(staticData)
  })
}

// Static mode
else {
  setUseTheme(() => initialTheme)
  setUsePagePaths(() => initialPagePaths)
  setUsePageModule((path) => {
    const page = initialPages[path]
    return useMemo(() => page?.data(), [page])
  })
  setUseStaticData((path?: string, selector?: Function) => {
    if (path) {
      const page = initialPages[path]
      const staticData = page?.staticData || {}
      return selector ? selector(staticData) : staticData
    }
    return toStaticData(initialPages)
  })
}

function toStaticData(pages: Record<string, any>) {
  const staticData: Record<string, any> = {}
  for (const path in pages) {
    staticData[path] = pages[path].staticData
  }
  return staticData
}
