/**
 * Use top-of-file comment to define static data for this page.
 *
 * @title page1 title
 */

import React from 'react'
import './style.scss'

const Page1 = () => {
  return (
    <div>
      <p className="page">Page1</p>
    </div>
  )
}

export default Page1

/**
 * You can also export any runtime data value for this page.
 */
export const runtimeDataForPage1 = 1 + 1
