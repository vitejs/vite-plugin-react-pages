import React from 'react'
import { Switch, Route } from 'react-router-dom'
import pages from '/@generated/pages'
import PageLoader from './PageLoader'

const routes = Object.entries<any>(pages).map(([path, { importFn }]) => {
  return (
    <Route
      // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
      key="same"
      exact
      path={path}
      render={() => <PageLoader importFn={importFn} />}
    />
  )
})

const App: React.FC = () => {
  return <Switch>{routes}</Switch>
}

export default App
