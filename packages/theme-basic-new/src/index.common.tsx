import React from 'react'
import type { ThemeProps } from 'vite-plugin-react-pages/clientTypes'
import { useStaticData } from 'vite-plugin-react-pages/client'

import AppLayout from './Layout'
import { themeConfigCtx, themePropsCtx } from './ctx'
import { MenuConfig } from './Layout/renderMenu'

import './style.less'

export function createTheme(themeConfig: ThemeConfig) {
  const ThemeComp = (props: ThemeProps) => {
    const { loadState, loadedData } = props
    const staticData = useStaticData()
    console.log('theme', loadState, loadedData, staticData)

    return (
      <themeConfigCtx.Provider value={themeConfig}>
        <themePropsCtx.Provider value={props}>
          <AppLayout />
        </themePropsCtx.Provider>
      </themeConfigCtx.Provider>
    )
  }
  return ThemeComp
}

export interface ThemeConfig {
  topNavs?: ReadonlyArray<MenuConfig>
  sideNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: ThemeProps) => ReadonlyArray<MenuConfig> | null | undefined)
  TopBarExtra?: React.ComponentType
}
