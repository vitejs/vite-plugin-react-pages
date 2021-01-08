/// <reference types="vite" />

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'
import type { IRenderPage } from './types'

import pages from '@!virtual-modules/pages'
import Theme from '@!virtual-modules/theme'

const App: React.FC = () => {
  const renderPage: IRenderPage = (routePath: string) => {
    if (!pages[routePath]) {
      throw new Error(`page not exist. routePath: ${routePath}`)
    }
    return <PageLoader Theme={Theme} pages={pages} routePath={routePath} />
  }

  const pageRoutes = Object.keys(pages)
    .filter((path) => path !== '/404')
    .map((path) => getPageRoute(path, pages[path].staticData, renderPage))

  return (
    <Switch>
      {pageRoutes}
      <Route
        key="same"
        path="*"
        render={({ match }) => {
          // 404
          return (
            <PageLoader Theme={Theme} pages={pages} routePath={match.url} />
          )
        }}
      />
    </Switch>
  )
}

export default App

function getPageRoute(path: string, staticData: any, renderPage: IRenderPage) {
  return (
    <Route
      // avoid re-mount layout component
      // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
      key="same"
      exact
      path={path}
      {...staticData._routeConfig}
    >
      {renderPage(path)}
    </Route>
  )
}
