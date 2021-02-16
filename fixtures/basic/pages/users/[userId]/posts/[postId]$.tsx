/**
 * @title dynamic route page
 */

import React from 'react'
import { useParams } from 'react-router-dom'

interface IProps {}

const IndexPage: React.FC<IProps> = (props) => {
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
