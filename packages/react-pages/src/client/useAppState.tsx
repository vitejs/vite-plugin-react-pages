import { useState, useLayoutEffect, useContext, useRef } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import type { LoadState } from '../../client'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'
import { usePageModule } from './state'

export default function useAppState(routePath: string) {
  const dataCache = useContext(dataCacheCtx)
  const setDataCache = useContext(setDataCacheCtx)

  const [loadState, setLoadState] = useState<LoadState>(() => ({
    type: 'loading',
    routePath,
  }))

  const onLoadState = (
    type: LoadState['type'],
    routePath: string,
    error?: any
  ) =>
    (type !== loadState.type || routePath !== loadState.routePath) &&
    setLoadState({ type, routePath, error })

  const loading = usePageModule(routePath)
  const loadingRef = useRef<Promise<any> | undefined>()
  useLayoutEffect(() => {
    loadingRef.current = loading
    if (!loading) {
      onLoadState('404', routePath)
    } else {
      if (dataCache[routePath]) {
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
