import React from 'react'
import {
  useRoutes,
  useLocation,
  type Location,
  type RouteObject,
} from 'react-router-dom'
import { usePagePaths } from './state'
import PageLoader from './PageLoader'

const App = () => {
  const pageRoutes = usePagePaths()
    .filter((path) => path !== '/404')
    .map((path) => {
      return { path, element: <PageLoader routePath={path} /> } as RouteObject
    })

  pageRoutes.push({
    path: '*',
    element: (
      <UseLocation>
        {(location) => <PageLoader routePath={location.pathname} />}
      </UseLocation>
    ),
  })

  const routesRender = useRoutes(pageRoutes)

  return routesRender
}

export default App

function UseLocation({ children }: { children: (location: Location) => any }) {
  const location = useLocation()
  // console.log('###UseLocation', location)
  return children(location)
}
