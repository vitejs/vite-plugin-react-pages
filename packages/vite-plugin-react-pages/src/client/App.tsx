/// <reference types="vite/dist/importMeta" />

import React, { useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'
import type { IRenderPage } from './types'

import pages from '/@generated/pages'
import Theme from '/@generated/theme'

const App: React.FC = () => {
  return useMemo(() => {
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
        {/* <Route
          key="same"
          path="*"
          render={() => {
            if (Theme.noPageMatch) {
              return Theme.noPageMatch(renderPage)
            }
            return <p>Page Not Found</p>
          }}
        /> */}
      </Switch>
    )
  }, [pages])
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
