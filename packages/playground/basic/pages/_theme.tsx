import React, { useMemo } from 'react'
import type { Theme } from 'vite-plugin-react-pages'
import { useStaticData } from 'vite-plugin-react-pages/client'

const theme: Theme = ({ loadedData, loadState }) => {
  const staticData = useStaticData()
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

export default theme
