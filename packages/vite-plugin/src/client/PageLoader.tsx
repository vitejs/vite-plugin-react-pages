import React, { useState, useEffect } from 'react'

// This should be the only file that is blocking SSR

const PageLoader: React.FC<{ importFn: () => Promise<IPageLoaded> }> = ({
  importFn,
}) => {
  const [loadState, setLoadState] = useState<ILoadState>(() => ({
    type: 'loading',
  }))
  // console.log(loadState.type)
  useEffect(() => {
    importFn()
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
      })
  }, [importFn])

  if (loadState.type === 'loading') {
    return <p>Loading...</p>
  }

  if (loadState.type === 'error') {
    return <p>Error: {loadState?.error?.message ?? 'no error message'}</p>
  }

  const { renderPage, PageComponent, pageData } = loadState.pageLoaded
  const layout = renderPage(PageComponent, pageData)
  return <>{layout}</>
}

export default PageLoader

export interface IPageLoaded {
  PageComponent: React.ComponentType
  pageData: any
  renderPage: IGetLayout
}

export type IGetLayout = (
  PageComponent: React.ComponentType,
  pageData: any
) => React.ReactNode

export type ILoadState =
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
