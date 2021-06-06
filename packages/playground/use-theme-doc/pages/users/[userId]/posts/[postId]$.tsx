/**
 * @title dynamic route page
 */

import React from 'react'
import { useParams } from 'react-router-dom'

const IndexPage = () => {
  const { userId, postId } = useParams<{ userId: string; postId: string }>()
  return (
    <div>
      <div>User Post Page</div>
      <div>userId: {userId}</div>
      <div>postId: {postId}</div>
    </div>
  )
}

export default IndexPage
