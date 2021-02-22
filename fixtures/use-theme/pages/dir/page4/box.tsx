import React from 'react'
import s from './box.module.css'

const Box = () => {
  console.log('children', props.children)
  return <div className={s.box}>React Box</div>
}

export default Box
