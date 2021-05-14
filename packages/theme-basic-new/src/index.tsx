import React from 'react'
import type { ThemeProps } from 'vite-plugin-react-pages/clientTypes'
import { useStaticData } from "vite-plugin-react-pages/client";

export function createTheme() {
  const ThemeComp = ({ loadState, loadedData }: ThemeProps) => {
    const staticData = useStaticData();
    console.log('theme', loadState, loadedData, staticData)
    
    return <div>Basic theme</div>
  }
  return ThemeComp
}
