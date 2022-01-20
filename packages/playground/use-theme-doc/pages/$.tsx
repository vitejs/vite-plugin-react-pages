/**
 * @title index page title
 * @sort 0
 */

import React from 'react'
import { Link } from 'react-router-dom'

const Page = () => {
  return (
    <div
      className="page"
      style={{ margin: 40, border: '2px solid black', height: 1200 }}
    >
      Index page
      <p>
        <Link to="/page1">Jump to page1</Link>
      </p>
    </div>
  )
}

export default Page
