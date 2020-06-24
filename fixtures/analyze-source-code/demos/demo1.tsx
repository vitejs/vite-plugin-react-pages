import React, { useState, useEffect, useCallback } from 'react'
// This is an external library used by demo
import Select from 'react-select'

import util from './dir/util'
import style from './demo1.module.css'

interface IProps {}

const Demo1: React.FC<IProps> = (props) => {
  useEffect(() => {
    util('demo1')
  }, [])

  const [selected, setSelected] = useState(null)
  const handleChange = useCallback((newSelected) => {
    setSelected(newSelected)
  }, [])

  return (
    <div className={style.box}>
      <h1 className={style.title}>Demo1</h1>
      <Select value={selected} onChange={handleChange} options={options} />
    </div>
  )
}

const options = [
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'vanilla', label: 'Vanilla' },
]

export default Demo1
