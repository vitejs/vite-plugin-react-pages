import { useMemo } from 'react'
import { dequal } from 'dequal'
import type { SetAtom } from 'jotai/core/types'
import { atom, useAtom } from 'jotai'
import { atomFamily, useAtomValue, useUpdateAtom } from 'jotai/utils'
import type { PageLoaded, UseStaticData, Theme } from '../../client'

export let useTheme: () => Theme
export let usePagePaths: () => string[]
export let usePageModule: (path: string) => Promise<PageModule> | undefined
export let useStaticData: UseStaticData

interface PageModule {
  ['default']: PageLoaded
}

import initialPages from '/@react-pages/pages'
import initialTheme from '/@react-pages/theme'

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
  useTheme = () => {
    const [{ Theme }, set] = useAtom(themeAtom)
    setTheme = set
    return Theme
  }

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
      const page = pages[path]
      const newPage = newPages[path]

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

    // Update the `pagesAtom` every time, since no hook uses it directly.
    set(pagesAtom, newPages)

    // Avoid re-rendering `useStaticData()` callers if no data changed.
    if (newStaticData) {
      set(staticDataAtom, {
        ...get(staticDataAtom),
        ...newStaticData,
      })
    }

    // Avoid re-rendering `usePagePaths()` callers if no paths were added/deleted.
    const newPagePaths = Object.keys(newPages).sort()
    if (!dequal(get(pagePathsAtom), newPagePaths)) {
      set(pagePathsAtom, newPagePaths)
    }
  })

  const dataPathAtoms = atomFamily((path: string) => (get) => {
    const pages = get(pagesAtom)
    const page = pages[path] || pages['/404']
    return page?.dataPath || null
  })

  const emptyData: any = {}
  const staticDataAtoms = atomFamily((path: string) => (get) => {
    const pages = get(pagesAtom)
    const page = pages[path] || pages['/404']
    return page?.staticData || emptyData
  })

  usePagePaths = () => {
    setPages = useUpdateAtom(setPagesAtom)
    return useAtomValue(pagePathsAtom)
  }

  // This hook uses dynamic import with a variable, which is not supported
  // by Rollup, but that's okay since HMR is for development only.
  usePageModule = (pagePath) => {
    const dataPath = useAtomValue(dataPathAtoms(pagePath))
    return useMemo(() => {
      return dataPath ? import(dataPath /* @vite-ignore */) : void 0
    }, [dataPath])
  }

  useStaticData = (pagePath?: string, selector?: Function) => {
    const staticData = pagePath ? staticDataAtoms(pagePath) : staticDataAtom
    if (selector) {
      const selection = useMemo(
        () => atom((get) => selector(get(staticData))),
        [staticData]
      )
      return useAtomValue(selection)
    }
    return useAtomValue(staticData)
  }
}

// Static mode
else {
  useTheme = () => initialTheme
  usePagePaths = () => initialPagePaths
  usePageModule = (path) => {
    const page = initialPages[path] || initialPages['/404']
    return useMemo(() => page?.data(), [page])
  }
  useStaticData = (path?: string, selector?: Function) => {
    if (path) {
      const page = initialPages[path] || initialPages['/404']
      const staticData = page?.staticData || {}
      return selector ? selector(staticData) : staticData
    }
    return toStaticData(initialPages)
  }
}

function toStaticData(pages: Record<string, any>) {
  const staticData: Record<string, any> = {}
  for (const path in pages) {
    staticData[path] = pages[path].staticData
  }
  return staticData
}
