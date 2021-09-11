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
      // notice that during hmr, dataCache[routePath] may exist
      if (dataCache[routePath] && !import.meta.hot) {
        // this is a ssr client render, not hmr
        onLoadState('loaded', routePath)
      } else {
        onLoadState('loading', routePath)
        loading.then(
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
    }
  }, [loading])

  return loadState
}
