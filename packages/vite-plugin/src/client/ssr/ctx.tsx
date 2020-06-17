import { createContext } from 'react'
import { IPages } from '../types'

/**
 * dynamic import don't work in ssr
 * to work around that, in ssr, we pass all the data needed by App
 * with this ctx
 * so the App can render the page data directly
 * instead of render the loading state
 */
export const dataCacheCtx = createContext<IDataCache>({ pages: {} })
export const setDataCacheCtx = createContext<
  React.Dispatch<React.SetStateAction<IDataCache>>
>(() => {
  throw new Error(`setDataCacheCtx not found`)
})

export interface IDataCache {
  pages: IPages
}
