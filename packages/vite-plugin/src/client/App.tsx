import React from 'react'
import loadable from '@loadable/component'
import { BrowserRouter } from 'react-router-dom'
import { Switch, Route } from 'react-router-dom'
// import DocList from './DocList'
// import PageRenderer from './PageRenderer'
// import { routes } from '/@generated/routes'
import pages from '/@generated/pages'

const routes = Object.entries<any>(pages).map(([path, { importFn }]) => {
  const Component = loadable(importFn)
  return (
    <Route exact path={path} key={path}>
      <Component />
    </Route>
  )
})

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>{routes}</Switch>
      {/* <Route>
          <Redirect to="/" />
        </Route> */}
    </BrowserRouter>
  )
}

export default App
