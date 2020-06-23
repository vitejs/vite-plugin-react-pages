import React from 'react'

import Demo from '../demos/demo1'
import demoSource from '../demos/demo1?analyzeSource'

interface IProps {}

const IndexPage: React.FC<IProps> = (props) => {
  return (
    <div>
      <p>Load and render "demos/demo1":</p>
      <Demo />
      <p>Here is source code analysis for "demos/demo1":</p>
      <pre>{JSON.stringify(demoSource, null, 2)}</pre>
    </div>
  )
}

export default IndexPage
