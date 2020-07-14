import React, { useMemo } from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'
import type { IPagesInternal } from './types'

import pages from '/@generated/pages'

const App: React.FC = () => {
  const renderRoutes = useMemo(() => {
    const pageRoutes = Object.keys(pages)
      .filter((path) => path !== '/404')
      .map((path) => getPageRoute(path, pages))
    return (
      <Switch>
        {pageRoutes}
        {getFallbackRoute(pages)}
      </Switch>
    )
  }, [pages])
  return renderRoutes
}

export default App

function getPageRoute(path: string, pages: IPagesInternal) {
  return (
    <Route
      // avoid re-mount layout component
      // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
      key="same"
      exact
      path={path}
    >
      <PageLoader pages={pages} path={path} />
    </Route>
  )
}

function getFallbackRoute(pages: IPagesInternal) {
  let content
  if ('/404' in pages) {
    content = <PageLoader pages={pages} path="/404" />
  } else {
    content = <p>Route Not Found</p>
  }
  return <Route path="*">{content}</Route>
}
