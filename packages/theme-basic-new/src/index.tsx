// import the build output css
import './index.css'
import React from 'react'
import type { ThemeProps } from 'vite-plugin-react-pages/clientTypes'
import { useStaticData } from 'vite-plugin-react-pages/client'

import s from './style.module.css'
import AppLayout from './Layout'

export function createTheme() {
  const ThemeComp = ({ loadState, loadedData }: ThemeProps) => {
    const staticData = useStaticData()
    console.log('theme', loadState, loadedData, staticData)

    return <AppLayout />
  }
  return ThemeComp
}
