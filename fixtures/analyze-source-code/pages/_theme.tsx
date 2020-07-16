import React from 'react'
import type { ICreateTheme } from 'vite-plugin-react-pages'

const theme: ICreateTheme = (pages) => {
  return {
    initialLoading() {
      return <p>Loading</p>
    },
    loaded(pageData) {
      const Component = pageData.default
      return <Component />
    },
    loadError(error, pageStaticData) {
      console.error('load error!', { error, pageStaticData, pages })
      return <p>Load error, see console.error</p>
    },
    noPageMatch() {
      return <p>Page Not Found.</p>
    },
  }
}

export default theme
