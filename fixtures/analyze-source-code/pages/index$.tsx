import React from 'react'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'

import s from './index.module.css'
import Demo from '../demos/demo1'
import demoSource from '../demos/demo1?analyzeSource'

interface IProps {}

const IndexPage: React.FC<IProps> = (props) => {
  return (
    <div>
      <p>Load and render "demos/demo1":</p>
      <Demo />
      <hr/>
      <p>Here is source code for "demos/demo1":</p>
      {Object.entries(demoSource.modules).map(([moduleName, module]: any) => {
        return (
          <div key={moduleName}>
            <p className={s.moduleName}>{moduleName}</p>
            <LiveProvider code={module.code}>
              <LiveEditor />
            </LiveProvider>
          </div>
        )
      })}
      <hr/>
      <p>Source code analysis data:</p>
      <pre>{JSON.stringify(demoSource, null, 2)}</pre>
    </div>
  )
}

export default IndexPage
