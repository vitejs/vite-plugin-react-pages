import { useMemo, useEffect, useState } from 'react'
import { dequal } from 'dequal'
import type { SetAtom } from 'jotai/core/atom'
import { atom, useAtom } from 'jotai'
import { atomFamily, useAtomValue, useUpdateAtom } from 'jotai/utils'
import type {
  PageLoaded,
  UseStaticData,
  Theme,
  UseAllPagesOutlines,
} from '../../clientTypes'

export let useTheme: () => Theme
export let usePagePaths: () => string[]
export let usePageModule: (path: string) => Promise<PageModule> | undefined
export let useStaticData: UseStaticData
export let useAllPagesOutlines: UseAllPagesOutlines

interface PageModule {
  ['default']: PageLoaded
}

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
  let setTheme: SetAtom<{ Theme: Theme }, void> | undefined
  import.meta.hot!.accept('/@react-pages/theme', (module) => {
    // console.log('@@hot update /@react-pages/theme', module)
    if (!module) {
      console.error('unexpected hot module', module)
      return
    }
    setTheme?.({ Theme: module.default })
  })

  const themeAtom = atom({ Theme: initialTheme })
  useTheme = () => {
    const [{ Theme }, set] = useAtom(themeAtom)
    setTheme = set
    return Theme
  }

  let setPages: SetAtom<any, void> | undefined
  import.meta.hot!.accept('/@react-pages/pages', (module) => {
    // console.log('@@hot update /@react-pages/pages', module)
    if (!module) {
      console.error('unexpected hot module', module)
      return
    }
    setPages?.(module.default)
  })

  // let setAllPagesOutlines: SetAtom<any, void> | undefined
  // import.meta.hot!.accept('/@react-pages/allPagesOutlines', (module) => {
  //   // console.log('@@hot update /@react-pages/allPagesOutlines', module)
  //   if (!module) {
  //     console.error('unexpected hot module', module)
  //     return
  //   }
  //   setAllPagesOutlines?.(module)
  // })

  const pagesAtom = atom(initialPages)
  const pagePathsAtom = atom(initialPagePaths.sort())
  const staticDataAtom = atom(toStaticData(initialPages))
  const allPagesOutlinesAtom = atom(initialPages)

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

  const dataAtoms = atomFamily((path: string) =>
    atom((get) => {
      const pages = get(pagesAtom)
      return pages[path]
    })
  )

  const staticDataAtoms = atomFamily((path: string) =>
    atom((get) => {
      const pages = get(pagesAtom)
      const page = pages[path]
      return page?.staticData
    })
  )

  usePagePaths = () => {
    setPages = useUpdateAtom(setPagesAtom)
    return useAtomValue(pagePathsAtom)
  }

  usePageModule = (pagePath) => {
    const data = useAtomValue(dataAtoms(pagePath))
    return useMemo(() => data?.data(), [data])
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

  useAllPagesOutlines = (timeout: number) => {
    const [data, set] = useAtom(allPagesOutlinesAtom)
    // setAllPagesOutlines = set
    useEffect(() => {
      setTimeout(() => {
        import('/@react-pages/allPagesOutlines').then((mod) => {
          set(mod)
        })
      }, timeout)
    }, [])
    return data
  }
}

// Static mode
else {
  useTheme = () => initialTheme
  usePagePaths = () => initialPagePaths
  usePageModule = (path) => {
    const page = initialPages[path]
    return useMemo(() => page?.data(), [page])
  }
  useStaticData = (path?: string, selector?: Function) => {
    if (path) {
      const page = initialPages[path]
      const staticData = page?.staticData || {}
      return selector ? selector(staticData) : staticData
    }
    return toStaticData(initialPages)
  }
  useAllPagesOutlines = (timeout: number) => {
    const [data, set] = useState<any>()
    useEffect(() => {
      setTimeout(() => {
        import('/@react-pages/allPagesOutlines').then((mod) => {
          set(mod)
        })
      }, timeout)
    }, [])
    return data
  }
}

function toStaticData(pages: Record<string, any>) {
  const staticData: Record<string, any> = {}
  for (const path in pages) {
    staticData[path] = pages[path].staticData
  }
  return staticData
}

if ((globalThis as any)['__vite_pages_use_static_data']) {
  throw new Error(
    `[vite-pages] global hooks (.e.g useStaticData) already exists on window. It means there are multiple vite-pages runtime in this page. Please report this to vite-pages.`
  )
} else {
  // make them available in vite-plugin-react-pages/client
  ;(globalThis as any)['__vite_pages_use_static_data'] = useStaticData
  ;(globalThis as any)['__vite_pages_use_all_pages_outlines'] =
    useAllPagesOutlines
}
