import React, { useState, useEffect, useContext } from 'react'
import type { IPageLoaded, IPagesInternal } from './types'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'

interface IProps {
  pages: IPagesInternal
  path: string
}

const PageLoader: React.FC<IProps> = ({ pages, path }) => {
  const { _importFn, theme } = pages[path]
  const _pageStaticData = { ...pages[path].staticData, _path: path }

  const dataCache = useContext(dataCacheCtx)
  const setDataCache = useContext(setDataCacheCtx)
  const [loadState, setLoadState] = useState<ILoadState>(() => {
    if (dataCache.pages[path]) {
      // we already have the data in ssr
      // don't need to dynamic load it
      return {
        type: 'loaded',
        pageData: { ..._pageStaticData, ...dataCache.pages[path] },
      }
    }
    return {
      type: 'initial-loading',
      pageStaticData: _pageStaticData,
    }
  })

  useEffect(() => {
    if (dataCache.pages[path]) {
      // we already have the data in ssr
      // don't need to dynamic load it
      setLoadState({
        type: 'loaded',
        pageData: { ..._pageStaticData, ...dataCache.pages[path] },
      })
      return
    }

    // state machine transition
    switch (loadState.type) {
      case 'initial-loading':
        setLoadState({
          type: 'initial-loading',
          pageStaticData: _pageStaticData,
        })
        break
      case 'loaded':
        setLoadState({
          type: 'transition-loading',
          pageStaticData: _pageStaticData,
          prevPageData: loadState.pageData,
        })
        break
      case 'transition-loading':
        setLoadState({
          type: 'transition-loading',
          prevPageData: loadState.prevPageData,
          pageStaticData: _pageStaticData,
        })
        break
      case 'load-error':
        setLoadState({
          type: 'initial-loading',
          pageStaticData: _pageStaticData,
        })
        break
      default:
        throw new Error(`unknown loadState.type`)
    }

    // FIXME handle race condition of this async setState
    _importFn()
      .then((pageLoaded) => {
        setDataCache((prev) => ({
          ...prev,
          pages: {
            ...prev.pages,
            [path]: pageLoaded.pageData,
          },
        }))
        setLoadState({
          type: 'loaded',
          pageData: { ..._pageStaticData, ...pageLoaded.pageData },
        })
      })
      .catch((error) => {
        setLoadState({
          type: 'load-error',
          pageStaticData: _pageStaticData,
          error,
        })
        throw error
      })
  }, [path])

  switch (loadState.type) {
    case 'initial-loading':
      return theme.initialLoading(loadState.pageStaticData, pages)
    case 'loaded':
      return theme.loaded(loadState.pageData, pages)
    case 'transition-loading':
      if (theme.transitionLoading)
        return theme.transitionLoading(
          loadState.pageStaticData,
          pages,
          loadState.prevPageData
        )
      return theme.initialLoading(loadState.pageStaticData, pages)
    case 'load-error':
      return theme.loadError(loadState.error, loadState.pageStaticData, pages)
    default:
      throw new Error(`unknown loadState.type`)
  }
}

export default PageLoader

type ILoadState =
  | {
      type: 'initial-loading'
      pageStaticData: any
    }
  | {
      type: 'loaded'
      pageData: IPageLoaded
    }
  | {
      type: 'transition-loading'
      pageStaticData: any
      prevPageData: IPageLoaded
    }
  | {
      type: 'load-error'
      pageStaticData: any
      error?: any
    }
