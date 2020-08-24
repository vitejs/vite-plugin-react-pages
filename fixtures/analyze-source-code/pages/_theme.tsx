import React from 'react'
import type { ITheme } from 'vite-plugin-react-pages'

const theme: ITheme = ({ loadedData, loadState }) => {
  if (loadState.type !== 'loaded') return <p>Loading</p>
  const Component = loadedData[loadState.routePath].main.default
  return <Component />
}

export default theme
