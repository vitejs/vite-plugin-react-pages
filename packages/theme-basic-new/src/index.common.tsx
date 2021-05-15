import React from 'react'
import type { ThemeProps } from 'vite-plugin-react-pages/clientTypes'
import { useStaticData } from 'vite-plugin-react-pages/client'

import AppLayout from './Layout'
import { themeConfigCtx, themePropsCtx } from './ctx'

export function createTheme(themeConfig: any) {
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
