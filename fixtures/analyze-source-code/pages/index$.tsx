import React, { useEffect } from 'react'
import { LiveProvider, LiveEditor } from 'react-live'

import s from './index.module.css'
import Demo from '../demos/demo1'
import demoSource from '../demos/demo1?analyzeSource'

const IndexPage = () => {
  useEffect(() => {
    console.log('Source code analysis result', demoSource)
  }, [])

  return (
    <div>
      <p>Load and render "demos/demo1":</p>
      <Demo />
      <p style={{ marginTop: 48 }}>Here is source code for "demos/demo1":</p>
      {Object.entries(demoSource.modules)
        .sort(([moduleNameA], [moduleNameB]) =>
          moduleNameA.localeCompare(moduleNameB)
        )
        .map(([moduleName, module]: any) => {
          return (
            <div key={moduleName}>
              <p className={s.moduleName}>{moduleName}</p>
              <LiveProvider code={module.code}>
                <LiveEditor />
              </LiveProvider>
            </div>
          )
        })}
    </div>
  )
}

export default IndexPage
