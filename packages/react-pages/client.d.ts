import React from 'react'

/** The type of a theme. */
export type Theme = React.ComponentType<ThemeProps>

export interface ThemeProps {
  readonly staticData: PagesStaticData
  readonly loadedData: PagesLoaded
  readonly loadState: LoadState
}

/**
 * All pages' static data.
 */
export interface PagesStaticData {
  /**
   * For each page, its static data is indexed by keys.
   */
  readonly [routePath: string]: Record<string, any>
}

/**
 * All runtime data that is already loaded.
 */
export interface PagesLoaded {
  readonly [routePath: string]: PageLoaded
}

/**
 * For each page, its runtime data can be composed of multile modules.
 * These modules are indexed by keys.
 *
 * Normally, a page only contains one module, with the key being `main`.
 * And the default export of the main module is a React component,
 * which will render the page.
 */
export type PageLoaded = Record<string, any>

/**
 * The current loading state of the app.
 */
export type LoadState =
  | {
      readonly type: 'loading' | 'loaded' | '404'
      readonly routePath: string
    }
  | {
      readonly type: 'load-error'
      readonly routePath: string
      readonly error?: any
    }

export interface PagesInternal {
  readonly [routePath: string]: {
    readonly data: () => Promise<PageLoaded>
    readonly staticData: any
  }
}
