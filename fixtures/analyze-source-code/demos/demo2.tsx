import React, { useEffect } from 'react'

import util from './dir/util'

const Demo2 = () => {
  useEffect(() => {
    util('demo2')
  }, [])
  return <div>demo2</div>
}

export default Demo2
