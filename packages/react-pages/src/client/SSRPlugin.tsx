import React, { createContext, useContext } from 'react'
import ReactDOM from 'react-dom/server'

import { isSSR } from './utils'
import type { SSRPlugin } from '../../clientTypes'
export type { SSRPlugin } from '../../clientTypes'

export const SSRPluginContext = createContext<SSRPluginMap>(new Map())

export type SSRPluginMap = Map<string, SSRPlugin>

/**
 * render React tree on the server to get the server plugins that are declared by themes or users
 */
export function collectSSRPlugins(app: React.ReactNode): SSRPlugin[] {
  const map: SSRPluginMap = new Map()
  ReactDOM.renderToString(
    <SSRPluginContext.Provider value={map}>{app}</SSRPluginContext.Provider>
  )
  return [...map.values()]
}

/**
 * Users or themes use this function to declare SSR plugin.
 * This function is exported from vite-plugin-react-pages/client
 */
export function useSSRPlugin(plugin: SSRPlugin) {
  if (isSSR) {
    const ctxVal = useContext(SSRPluginContext)
    ctxVal?.set(plugin.id, plugin)
  }
}

;(globalThis as any)['__vite_pages_useSSRPlugin'] = useSSRPlugin
