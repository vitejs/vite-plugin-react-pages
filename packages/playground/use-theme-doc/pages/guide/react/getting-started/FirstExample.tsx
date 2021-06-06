import React from 'react'

interface Props {}

const FirstExample: React.FC<Props> = (props) => {
  return (
    <iframe
      src="https://codesandbox.io/embed/antd-reproduction-template-6e93z?autoresize=1&fontsize=14&hidenavigation=1&theme=dark"
      style={{
        width: '100%',
        height: '500px',
        border: '0',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
      title="antd reproduction template"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
  )
}

export default FirstExample
