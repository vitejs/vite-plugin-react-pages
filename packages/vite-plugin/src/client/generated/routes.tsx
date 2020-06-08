import React from 'react'
import loadable from '@loadable/component'
import { Switch, Route } from 'react-router-dom'
// import PageRenderer from '/@dynamic-module/PageRenderer?'

// @generated 是一个 动态生成的文件夹，里面的每个page粘合PageRenderer 和用户的PageComponent
const Page1 = loadable(() => import('/@generated/pages/page1'))
const Page2 = loadable(() => import('/@generated/pages/page2'))

export const routes = (
  <Switch>
    <Route exact path="/page1">
      <Page1 />
    </Route>
    <Route exact path="/page2">
      <Page2 />
    </Route>
  </Switch>
)
