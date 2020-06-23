import React from 'react'
import type { ITheme } from 'vite-plugin-react-pages/client'

const theme: ITheme = {
  initialLoading() {
    return <p>Loading</p>
  },
  loaded(pageData) {
    const Component = pageData.default
    return <Component />
  },
  loadError(error, pageStaticData, pages) {
    console.error('load error!', { error, pageStaticData, pages })
    return <p>Load error, see console.error</p>
  },
}

export default theme
