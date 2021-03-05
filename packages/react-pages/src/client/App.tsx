import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { usePagePaths } from './state'
import PageLoader from './PageLoader'

const App = () => {
  const pageRoutes = usePagePaths()
    .filter((path) => path !== '/404')
    .map((path) => (
      // avoid re-mount layout component
      // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
      <Route key="same" exact path={path}>
        <PageLoader routePath={path} />
      </Route>
    ))

  return (
    <Switch>
      {pageRoutes}
      <Route
        key="same"
        path="*"
        render={({ match }) => {
          // 404
          return <PageLoader routePath={match.url} />
        }}
      />
    </Switch>
  )
}

export default App
