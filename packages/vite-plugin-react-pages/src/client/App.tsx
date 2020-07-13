/// <reference types="vite/dist/ImportMeta" />

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import PageLoader from './PageLoader'
import type { IPagesInternal } from './types'
import pages from '/@generated/pages'

import routes from '/@generated/routes'

// let routes = getRoutesFromPagesData(pages)
// let fallbackRoute = getFallbackRoute(pages)

const App: React.FC = () => {
  return (
    <Switch>
      {routes}
      {/* {fallbackRoute} */}
    </Switch>
  )
}

export default App

// function getRoutesFromPagesData(pages: IPagesInternal) {
//   return Object.keys(pages)
//     .filter((path) => path !== '/404')
//     .map((path) => {
//       return (
//         <Route
//           // avoid re-mount layout component
//           // https://github.com/ReactTraining/react-router/issues/3928#issuecomment-284152397
//           key="same"
//           exact
//           path={path}
//         >
//           <PageLoader pages={pages} path={path} />
//         </Route>
//       )
//     })
// }

// function getFallbackRoute(pages: IPagesInternal) {
//   let content
//   if ('/404' in pages) {
//     content = <PageLoader pages={pages} path="/404" />
//   } else {
//     content = <p>Route Not Found</p>
//   }
//   return <Route path="*">{content}</Route>
// }

// if (import.meta.hot) {
//   // @ts-ignore
//   import.meta.hot.acceptDeps('/@generated/pages', (newModule) => {
//     routes = getRoutesFromPagesData(newModule.default)
//     fallbackRoute = getFallbackRoute(newModule.default)
//   })
// }
