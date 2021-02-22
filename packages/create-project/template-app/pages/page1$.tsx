/**
 * @title page1 title
 * @sort 1
 */

import React from 'react'
import {Link} from 'react-router-dom'

const Page = () => {
  return <div>
    <p>This is page1. This is a page defined with React component.</p>
    <div>
      dynamic routes: <br/>
      <Link to="/users/aaa">/users/aaa</Link><br/>
      <Link to="/users/bbb">/users/bbb</Link><br/>
      <Link to="/users/aaa/posts/111">/users/aaa/posts/111</Link><br/>
      <Link to="/users/bbb/posts/222">/users/bbb/posts/222</Link>
    </div>
    </div>
}

export default Page
