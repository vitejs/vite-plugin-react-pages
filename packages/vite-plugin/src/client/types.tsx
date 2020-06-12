import React from 'react'

export interface IPages {
  [path: string]: {
    staticData: any
  }
}
export interface IPagesInternal {
  [path: string]: {
    _importFn: () => Promise<IPageLoaded>
    staticData: any
  }
}
export interface IPageLoaded {
  /** All exports of page module. */
  pageData: any
  /** The nearest _render.tsx from the page module */
  renderPage: IRenderPage
}
export type IRenderPage = (
  pageData: any,
  pages: IPages
) => React.ReactElement | null
