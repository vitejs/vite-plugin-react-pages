/// <reference types="vite/dist/importMeta" />

import React, { useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'
import type { IRenderPage, ITheme } from './types'

import pages from '/@generated/pages'
import createTheme from '/@generated/theme'

let theme: ITheme = createTheme(pages)

const App: React.FC = () => {
  return useMemo(() => {
    const renderPage: IRenderPage = (path: string) => {
      if (!pages[path]) {
        throw new Error(`page not exist. path: ${path}`)
      }
      return <PageLoader theme={theme} pages={pages} path={path} />
    }

    const pageRoutes = Object.keys(pages)
      .filter((path) => path !== '/404')
      .map((path) => getPageRoute(path, renderPage))

    return (
      <Switch>
        {pageRoutes}
        <Route path="*" render={() => theme.noPageMatch(renderPage)} />
      </Switch>
    )
  }, [pages])
}

export default App

function getPageRoute(path: string, renderPage: IRenderPage) {
  return (
    <Route
      // avoid re-mount layout component
      // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
      key="same"
      exact
      path={path}
    >
      {renderPage(path)}
    </Route>
  )
}

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.acceptDeps(
    ['/@generated/pages', '/@generated/theme'],
    ([newPages, newCreateTheme]) => {
      theme = newCreateTheme(newPages)
    }
  )
}
