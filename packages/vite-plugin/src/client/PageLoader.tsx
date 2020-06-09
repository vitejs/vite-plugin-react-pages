import React, { useState, useEffect } from 'react'

// This should be the only file that is blocking SSR
// because it is using useEffect

interface IProps {
  importFn: () => Promise<IPageLoaded>
  pages: any
  path: string
}

const PageLoader: React.FC<IProps> = ({ importFn, pages, path }) => {
  const pageStaticData = pages[path].staticData
  const [loadState, setLoadState] = useState<ILoadState>(() => ({
    type: 'loading',
  }))
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

  if (typeof pageStaticData.title !== 'string') {
    return <p>Page should define title.</p>
  }
  if (loadState.type === 'loading') {
    return <p>Loading...</p>
  }

  if (loadState.type === 'error') {
    return <p>Error: {loadState?.error?.message ?? 'no error message'}</p>
  }

  const { renderPage, pageData } = loadState.pageLoaded
  const { default: PageComponent, ...actualPageData } = pageData
  const layout = renderPage(PageComponent, {
    ...pageStaticData,
    ...actualPageData,
  }, pages)
  return <>{layout}</>
}

export default PageLoader

export interface IPageLoaded {
  pageData: any
  renderPage: IRenderPage
}

export type IRenderPage = (
  PageComponent: React.ComponentType,
  pageData: any,
  pages: any
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
