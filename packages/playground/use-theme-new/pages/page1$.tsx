/**
 * @title page1 title
 * @sort 1
 */

import React from 'react'
import s from './page1.module.css'

const Page = () => {
  return (
    <p className={'page ' + s.box}>
      This is page1. This is a page defined with React component.
    </p>
  )
}

export default Page
