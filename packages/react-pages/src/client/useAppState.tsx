import { useState, useLayoutEffect, useContext, useRef } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import type { LoadState } from '../../clientTypes'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'
import { usePageModule } from './state'

export default function useAppState(routePath: string) {
  const dataCache = useContext(dataCacheCtx)
  const setDataCache = useContext(setDataCacheCtx)

  const [loadState, setLoadState] = useState<LoadState>(() => {
    if (dataCache[routePath]) {
      // this is a ssr or hydration
      // this page's data has already been loaded
      return {
        type: 'loaded',
        routePath,
      }
    }
    if (routePath === '/internal-404-page') {
      // this is a ssr or hydration
      // for the 404 page
      return {
        type: '404',
        routePath,
      }
    }
    return {
      type: 'loading',
      routePath,
    }
  })

  const onLoadState = (
    type: LoadState['type'],
    routePath: string,
    error?: any
  ) => setLoadState({ type, routePath, error })

  const loading = usePageModule(routePath)
  const loadingRef = useRef<Promise<any> | undefined>()
  useLayoutEffect(() => {
    loadingRef.current = loading
    if (!loading) {
      onLoadState('404', routePath)
    } else {
      if (dataCache[routePath]) {
        /**
         * Data already exists. Possible causes:
         * - User navigates back to a loaded page.
         * - This is a hmr update during dev. The dataCache[routePath] contains the old data. We need to load() the new data (but don't show loading state).
         * - This is a ssr client-side render. The page data is loaded before hydration.
         */
        onLoadState('loaded', routePath)
        if (import.meta.hot) {
          // If user navigates back to a loaded page during dev
          // this will also be executed.
          // But in this case, it will import() the same es module again,
          // which is handled by the browser es module cache.
          // So it won't load the module from dev server again and won't evaluate the module again.
          load()
        }
      } else {
        onLoadState('loading', routePath)
        load()
      }
    }

    function load() {
      loading!.then(
        (page) =>
          loading === loadingRef.current &&
          batchedUpdates(() => {
            onLoadState('loaded', routePath)
            setDataCache((prev) => ({
              ...prev,
              [routePath]: page.default,
            }))
          }),
        (error) =>
          loading === loadingRef.current &&
          onLoadState('load-error', routePath, error)
      )
    }
  }, [loading])

  return loadState
}
