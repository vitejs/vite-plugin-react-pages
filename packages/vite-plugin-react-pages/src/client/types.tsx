import React from 'react'

/**
 * all pages' static data.
 */
export interface IPagesStaticData {
  [routePath: string]: Record<string, any>
}
export interface IPagesInternal {
  [routePath: string]: {
    data: () => Promise<IPageLoaded>
    staticData: any
  }
}

// The dynamic data of a page can be any shape
export type IPageLoaded = any

export interface IPagesLoaded {
  [routePath: string]: IPageLoaded
}

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

export interface IThemeProps {
  staticData: IPagesStaticData
  loadedData: IPagesLoaded
  loadState: ILoadState
}

export type ITheme = React.FC<IThemeProps>

export type IRenderPage = (routePath: string) => React.ReactElement
