import React from 'react'

/** The type of a theme. */
export type ITheme = React.ComponentType<IThemeProps>

export interface IThemeProps {
  staticData: IPagesStaticData
  loadedData: IPagesLoaded
  loadState: ILoadState
}

/**
 * All pages' static data.
 */
export interface IPagesStaticData {
  /**
   * For each page, its static data is indexed by keys.
   */
  [routePath: string]: Record<string, any>
}

/**
 * All runtime data that is already loaded.
 */
export interface IPagesLoaded {
  [routePath: string]: IPageLoaded
}

/**
 * For each page, its runtime data can be composed of multile modules.
 * These modules are indexed by keys.
 *
 * Normally, a page only contains one module, with the key being `main`.
 * And the default export of the main module is a React component,
 * which will render the page.
 */
export type IPageLoaded = Record<string, any>

/**
 * The current loading state of the app.
 */
export type ILoadState =
  | {
      type: 'loading' | 'loaded' | '404'
      routePath: string
    }
  | {
      type: 'load-error'
      routePath: string
      error?: any
    }

export type IRenderPage = (routePath: string) => React.ReactElement
export interface IPagesInternal {
  [routePath: string]: {
    data: () => Promise<IPageLoaded>
    staticData: any
  }
}
