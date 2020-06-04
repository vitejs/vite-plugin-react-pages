import React from 'react'
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import DocList from './DocList'
import PageRenderer from './PageRenderer'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/workspace">
          <DocList />
        </Route>
        <Route path="/workspace">
          <PageRenderer />
        </Route>
        <Route>
          <Redirect to="/workspace" />
        </Route>
      </Switch>
    </BrowserRouter>
  )
}

export default App
