import React, { useEffect } from 'react'

import util from './dir/util'

interface IProps {}

const Demo2: React.FC<IProps> = (props) => {
  useEffect(() => {
    util('demo2')
  }, [])
  return <div>demo2</div>
}

export default Demo2
