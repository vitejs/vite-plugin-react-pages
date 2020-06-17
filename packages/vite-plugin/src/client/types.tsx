import React from 'react'

export interface IPages {
  [path: string]: {
    staticData: any
    /** The nearest _theme.tsx from the page module */
    theme: ITheme
  }
}
export interface IPagesInternal {
  [path: string]: {
    _importFn: () => Promise<IPageLoaded>
    staticData: any
    /** The nearest _theme.tsx from the page module */
    theme: ITheme
  }
}
export type IPageLoaded = any
export type IRenderPage = (
  pageData: any,
  pages: IPages
) => React.ReactElement | null

export interface ITheme {
  // this will not be used if user is doing ssr
  initialLoading: (
    pageStaticData: any,
    pages: IPages
  ) => React.ReactElement | null
  loaded: (pageData: IPageLoaded, pages: IPages) => React.ReactElement | null
  /**
   * if transitionLoading is not provided, fallback to initialLoading
   */
  transitionLoading?: (
    pageStaticData: any,
    pages: IPages,
    prevPageData: IPageLoaded
  ) => React.ReactElement | null
  loadError: (
    error: any,
    pageStaticData: any,
    pages: IPages
  ) => React.ReactElement | null
}
