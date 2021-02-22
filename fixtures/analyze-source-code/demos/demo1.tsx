import React, { useState, useEffect, useCallback } from 'react'
// This is an external library used by demo
import { Button } from 'antd'
import 'antd/dist/antd.css'

import util from './dir/util'
import util2 from '../util2'
import style from './demo1.module.css'
import './demo1.scss'

const Demo1 = () => {
  useEffect(() => {
    util('demo1')
    util2('demo1')
  }, [])

  return (
    <div className={style.box}>
      <h1 className="title">This demo use a library</h1>
      <Button type="primary">Primary Button</Button>
    </div>
  )
}

export default Demo1
