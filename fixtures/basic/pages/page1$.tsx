/**
 * Use top-of-file commonet to define static data for this page.
 *
 * @title page1 title
 */

import React from 'react'
import './style.scss'

interface IProps {}

const Page1: React.FC<IProps> = (props) => {
  return <p className="page">Page1. This page should have red border.</p>
}

export default Page1

/**
 * You can also export any runtime data value for this page.
 */
export const runtimeDataForPage1 = 1 + 1
