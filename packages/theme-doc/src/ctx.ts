import { createContext, useContext } from 'react'
import type { ThemeConfig, LocalConfig } from '.'
import type { ThemeProps } from 'vite-plugin-react-pages/clientTypes'

export const themeConfigCtx = createContext<ThemeConfig>({})
export const themePropsCtx = createContext<ThemeProps>({
  loadState: { type: 'loading', routePath: '/' },
  loadedData: {},
})
export const localeCtx = createContext<LocalConfig | undefined>(undefined)
export function useLocaleCtx() {
  return useContext(localeCtx)
}
