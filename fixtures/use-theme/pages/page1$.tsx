/**
 * @title page1 title
 * @sort 1
 */

import React from 'react'
import s from './page1.module.css'

interface IProps {}

const Page: React.FC<IProps> = (props) => {
  return (
    <p className={s.box}>
      This is page1. This is a page defined with React component.
    </p>
  )
}

export default Page
