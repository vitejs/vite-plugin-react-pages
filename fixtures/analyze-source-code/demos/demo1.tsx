import React, { useState, useEffect, useCallback } from 'react'
// This is an external library used by demo
import { Button } from 'antd'
import 'antd/dist/antd.css'

import util from './dir/util'
import style from './demo1.module.css'

interface IProps {}

const Demo1: React.FC<IProps> = (props) => {
  useEffect(() => {
    util('demo1')
  }, [])

  return (
    <div className={style.box}>
      <h1 className={style.title}>This demo use a library</h1>
      <Button type="primary">Primary Button</Button>
    </div>
  )
}

export default Demo1
