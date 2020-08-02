import { useState, useEffect, useContext } from 'react'
import type { IPagesInternal, ILoadState } from './types'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'

export default function useAppState(
  pages: IPagesInternal,
  latestRoutePath: string
) {
  const dataCache = useContext(dataCacheCtx)
  const setDataCache = useContext(setDataCacheCtx)
  const [loadState, setLoadState] = useState<ILoadState>(() => {
    return {
      type: 'loading',
      routePath: latestRoutePath,
    }
  })
  const { routePath } = loadState

  if (routePath !== latestRoutePath) {
    // if routePath has changed,
    // update loadState and rerender this component
    setLoadState({
      type: 'loading',
      routePath: latestRoutePath,
    })
  } else if (dataCache[routePath] && loadState.type !== 'loaded') {
    // if we have the data in cache (.e.g during ssr or loaded done)
    // update loadState and rerender this component
    setLoadState({
      type: 'loaded',
      routePath,
    })
  }

  useEffect(() => {
    // FIXME handle race condition of this async setState
    if (loadState.type === 'loading') {
      const { data: dataImporter } = pages[routePath]
      dataImporter()
        .then(({ default: pageLoaded }) => {
          setDataCache((prev) => ({
            ...prev,
            [routePath]: pageLoaded,
          }))
        })
        .catch((error) => {
          setLoadState({
            type: 'load-error',
            routePath,
            error,
          })
          throw error
        })
    }
  }, [routePath])

  return loadState
}
