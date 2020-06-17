/**
 * Use top-of-file commonet to define static data for this page.
 *
 * @title page1 title
 */

import React from 'react'

interface IProps {}

const Page1: React.FC<IProps> = (props) => {
  return <div>page1</div>
}

export default Page1

/**
 * You can also export any runtime data value for this page.
 */
export const runtimeDataForPage1 = 1 + 1
