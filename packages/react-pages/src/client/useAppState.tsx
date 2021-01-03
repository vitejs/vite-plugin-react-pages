import { useState, useEffect, useContext, useCallback } from 'react'
import type { IPagesInternal, ILoadState } from './types'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'

export default function useAppState(
  pages: IPagesInternal,
  latestRoutePath: string
) {
  const dataCache = useContext(dataCacheCtx)
  const setDataCache = useContext(setDataCacheCtx)
  const [loadState, _setLoadState] = useState<ILoadState>(() => {
    return {
      type: 'loading',
      routePath: latestRoutePath,
    }
  })

  const setLoadState = (newLoadState: ILoadState) => {
    if (
      newLoadState.type === loadState.type &&
      newLoadState.routePath === loadState.routePath
    ) {
      // don't set state if prev is already what I want
    } else {
      _setLoadState(newLoadState)
    }
  }

  const { routePath } = loadState

  if (!pages[latestRoutePath]) {
    if (pages['/404'] && !dataCache['/404']) {
      // load /404 page
      setLoadState({
        type: 'loading',
        routePath: latestRoutePath,
      })
    } else {
      setLoadState({
        type: '404',
        routePath: latestRoutePath,
      })
    }
  } else if (routePath !== latestRoutePath) {
    // if routePath has changed,
    // update loadState and rerender this component
    setLoadState({
      type: 'loading',
      routePath: latestRoutePath,
    })
  } else if (dataCache[routePath]) {
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
      let loadPath = routePath
      if (!pages[routePath]) {
        // loading a non-exist page
        if (pages['/404']) {
          loadPath = '/404'
        }
      }
      const { data: dataImporter } = pages[loadPath]
      dataImporter()
        .then(({ default: pageLoaded }) => {
          setDataCache((prev) => ({
            ...prev,
            [loadPath]: pageLoaded,
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
