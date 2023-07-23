import React, { useState } from 'react'

interface Props {}

const Counter: React.FC<Props> = (props) => {
  const [count, setCount] = useState(0)
  return (
    <div data-testid="counter">
      <span>Counter component: {count}.</span>
      <button onClick={() => setCount((v) => v + 1)}>add count</button>
    </div>
  )
}

export default Counter
