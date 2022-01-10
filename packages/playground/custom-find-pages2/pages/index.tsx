/**
 * @title Index Page Title
 * @sort 0
 */

import React from 'react'
import img from './images/react.png'

const Page = () => {
  return (
    <div>
      <h1>Index page</h1>
      <p>You can put an introduction here.</p>
      <div>
        image demo: <img src={img} alt="react" />
      </div>
    </div>
  )
}

export default Page
