/**
 * @title Users
 */

import React from 'react'
import { Link } from 'react-router-dom'

const Page = () => {
  return (
    <div>
      Test dynamic routes: <br />
      <Link to="/users/aaa">/users/aaa</Link>
      <br />
      <Link to="/users/bbb">/users/bbb</Link>
      <br />
      <Link to="/users/aaa/posts/111">/users/aaa/posts/111</Link>
      <br />
      <Link to="/users/bbb/posts/222">/users/bbb/posts/222</Link>
    </div>
  )
}

export default Page
