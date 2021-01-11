import React from 'react'
import vid from '../hmr.mp4'

interface IProps {}

const Component: React.FC<IProps> = (props) => {
  return (
    <video width="640" controls>
      <source src={vid} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default Component
