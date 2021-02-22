/**
 * @title dynamic route page
 */

import React from 'react'
import { useParams } from 'react-router-dom'

const IndexPage = () => {
  const { userId } = useParams<{ userId: string }>()
  return (
    <div>
      <div>User Main Page</div>
      <div>userId: {userId}</div>
    </div>
  )
}

export default IndexPage
