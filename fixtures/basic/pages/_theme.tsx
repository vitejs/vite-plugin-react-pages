import React, { useMemo } from 'react'
import type { ITheme } from 'vite-plugin-react-pages'

const Theme: ITheme = ({ staticData, loadedData, loadState }) => {
  console.log('#Theme', staticData, loadedData, loadState)

  // You can generate side nav menu from staticData
  // const sideMenuData = useMemo(() => generateSideMenu(staticData), [staticData])

  if (loadState.type === '404') return <p>Page not found.</p>
  if (loadState.type === 'load-error') return <p>Load error!</p>
  if (loadState.type === 'loading') return <p>Loading...</p>

  // loadState.type === 'loaded'
  // Runtime page data for current page
  const pageData = loadedData[loadState.routePath]
  // the default export of the main module
  const Component = pageData.main.default
  return <Component />
}

export default Theme
