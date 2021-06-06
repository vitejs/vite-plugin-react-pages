import React from 'react'
import style from './index.module.css'

interface Props {}

const FirstExample: React.FC<Props> = (props) => {
  return (
    <iframe
      className={style.example}
      src="https://codesandbox.io/embed/antd-reproduction-template-6e93z?autoresize=1&fontsize=14&hidenavigation=1&theme=dark"
      title="antd reproduction template"
      allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
      sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
    />
  )
}

export default FirstExample
