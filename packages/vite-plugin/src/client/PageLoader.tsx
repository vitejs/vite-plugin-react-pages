import React, { useState, useEffect } from 'react'
import type { IPageLoaded, IPagesInternal } from './App'

// This should be the only file that is blocking SSR
// because it is using useEffect

interface IProps {
  pages: IPagesInternal
  path: string
}

const PageLoader: React.FC<IProps> = ({ pages, path }) => {
  const { staticData: pageStaticData, _importFn } = pages[path]
  const [loadState, setLoadState] = useState<ILoadState>(() => ({
    type: 'loading',
  }))
  useEffect(() => {
    _importFn()
      .then((pageLoaded) => {
        setLoadState({
          type: 'loaded',
          pageLoaded,
        })
      })
      .catch((error) => {
        setLoadState({
          type: 'error',
          error,
        })
        throw error
      })
  }, [_importFn])

  // TODO: let user or theme config renderLoading and renderError
  if (loadState.type === 'loading') {
    return <p>Loading...</p>
  }
  if (loadState.type === 'error') {
    return <p>Error: {loadState?.error?.message ?? 'no error message'}</p>
  }

  const { renderPage, pageData } = loadState.pageLoaded
  const view = renderPage(
    {
      ...pageStaticData,
      ...pageData,
      path,
    },
    pages
  )
  return view
}

export default PageLoader

type ILoadState =
  | {
      type: 'loading'
    }
  | {
      type: 'loaded'
      pageLoaded: IPageLoaded
    }
  | {
      type: 'error'
      error?: any
    }
