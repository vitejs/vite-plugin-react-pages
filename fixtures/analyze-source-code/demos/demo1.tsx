import React, { useEffect } from 'react'

import util from './dir/util'
import style from "./demo1.module.css";

interface IProps {}

const Demo1: React.FC<IProps> = (props) => {
  useEffect(() => {
    util('demo1')
  }, [])
  return <div className={style.box}>demo1</div>
}

export default Demo1
