/// <reference types="vite/hmr" />

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'
import pages from '/@generated/pages'

let routes = getRouteFromPagesData(pages)

const App: React.FC = () => {
  return <Switch>{routes}</Switch>
}

export default App

function getRouteFromPagesData(pages: any) {
  return Object.entries<any>(pages).map(
    ([path, { importFn, staticData }]) => {
      return (
        <Route
          // avoid re-mount layout component
          // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
          key="same"
          exact
          path={path}
        >
          <PageLoader importFn={importFn} pages={pages} path={path} />
        </Route>
      )
    }
  )
}

if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.acceptDeps('/@generated/pages', (mod) => {
    // FIXME pages->mod ?
    routes = getRouteFromPagesData(pages)
  })
}
