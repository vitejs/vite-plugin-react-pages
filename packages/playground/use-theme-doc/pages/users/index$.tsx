/**
 * @title Users
 */

import React from 'react'
import { Link } from 'react-router-dom'

const Page = () => {
  return (
    <div>
      Test dynamic routes: <br />
      <Link to="/users/userA">/users/userA</Link>
      <br />
      <Link to="/users/userA/posts/1">/users/userA/posts/1</Link>
      <br />
      <Link to="/users/userA/posts/2">/users/userA/posts/2</Link>
      <br />
      <Link to="/users/userB">/users/userB</Link>
      <br />
      <Link to="/users/userB/posts/1">/users/userB/posts/1</Link>
      <br />
      <Link to="/users/userB/posts/2">/users/userB/posts/2</Link>
    </div>
  )
}

export default Page
