/**
 * @title index page title
 * @sort 0
 */

import React from 'react'
import { Link } from 'react-router-dom'

interface IProps {}

const Page: React.FC<IProps> = (props) => {
  return (
    <div>
      Index page
      <p>
        <Link to="/page1">Jump to page1</Link>
      </p>
    </div>
  )
}

export default Page
