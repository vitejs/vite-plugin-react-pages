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
 * You can also export dynamic data for this page.
 */
export const dynamicDataForPage1 = 1 + 1

/**
 * Both static data and dynamic data will be passed to _render.js
 * so you can use them to render layout.
 *
 * Difference:
 * - static data of all pages is loaded when the app bootstrap. So you should try to keep the static data small.
 * - dynamic data is loaded when user navigate to the page.
 *
 * - the value of static data is always string.
 * - the value of dynamic data can be anything (.e.g a React component).
 */
