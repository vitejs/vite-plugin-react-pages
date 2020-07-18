import React, { useState, useEffect, useContext } from 'react'
import type { IPageLoaded, IPagesInternal, ITheme } from './types'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'

interface IProps {
  theme: ITheme
  pages: IPagesInternal
  path: string
}

const PageLoader: React.FC<IProps> = ({ pages, path, theme }) => {
  const { _importFn, staticData } = pages[path]
  staticData._path = path

  const dataCache = useContext(dataCacheCtx)
  const setDataCache = useContext(setDataCacheCtx)
  const [loadState, setLoadState] = useState<ILoadState>(() => {
    if (dataCache.pages[path]) {
      // we already have the data in ssr
      // don't need to dynamic load it
      return {
        type: 'loaded',
        pageData: { ...staticData, ...dataCache.pages[path] },
      }
    }
    return {
      type: 'initial-loading',
      pageStaticData: staticData,
    }
  })

  useEffect(() => {
    if (dataCache.pages[path]) {
      // we already have the data in ssr
      // don't need to dynamic load it
      setLoadState({
        type: 'loaded',
        pageData: { ...staticData, ...dataCache.pages[path] },
      })
      return
    }

    // state machine transition
    switch (loadState.type) {
      case 'initial-loading':
        setLoadState({
          type: 'initial-loading',
          pageStaticData: staticData,
        })
        break
      case 'loaded':
        setLoadState({
          type: 'transition-loading',
          prevPageData: loadState.pageData,
          pageStaticData: staticData,
        })
        break
      case 'transition-loading':
        setLoadState({
          type: 'transition-loading',
          prevPageData: loadState.prevPageData,
          pageStaticData: staticData,
        })
        break
      case 'load-error':
        setLoadState({
          type: 'initial-loading',
          pageStaticData: staticData,
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
          pageData: { ...staticData, ...pageLoaded.pageData },
        })
      })
      .catch((error) => {
        setLoadState({
          type: 'load-error',
          pageStaticData: staticData,
          error,
        })
        throw error
      })
  }, [path])

  switch (loadState.type) {
    case 'initial-loading':
      return theme.initialLoading(loadState.pageStaticData)
    case 'loaded':
      return theme.loaded(loadState.pageData)
    case 'transition-loading':
      if (theme.transitionLoading)
        return theme.transitionLoading(
          loadState.pageStaticData,
          loadState.prevPageData
        )
      return theme.initialLoading(loadState.pageStaticData)
    case 'load-error':
      return theme.loadError(loadState.error, loadState.pageStaticData)
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
