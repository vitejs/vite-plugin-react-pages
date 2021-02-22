import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'

import pages from '@!virtual-modules/pages'
import Theme from '@!virtual-modules/theme'

const App = () => {
  const pageRoutes = Object.keys(pages)
    .filter((path) => path !== '/404')
    .map((path) => getPageRoute(path, pages[path].staticData))

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

function getPageRoute(path: string, staticData: any) {
  if (!pages[path]) {
    throw new Error(`page not exist. route path: ${path}`)
  }
  return (
    <Route
      // avoid re-mount layout component
      // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
      key="same"
      exact
      path={path}
      // not used for now
      {...staticData._routeConfig}
    >
      <PageLoader Theme={Theme} pages={pages} routePath={path} />
    </Route>
  )
}
