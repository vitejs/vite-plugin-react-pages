/**
 * @title page2 title
 */

import React from 'react'
import '../style.scss'

interface IProps {}

const Page2: React.FC<IProps> = (props) => {
  return <p className="page">Page2. This page should have red border.</p>
}

export default Page2
