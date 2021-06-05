import React from 'react'

interface Props {}

const Component: React.FC<Props> = (props) => {
  return (
    <div style={{ border: '1px solid red', height: 2400 }}>
      Components Overview
      <p>Long React content...</p>
    </div>
  )
}

export default Component
