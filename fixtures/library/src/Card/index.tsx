import React from 'react'
import s from './style.module.css'

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

const Card = (props: Props) => {
  return (
    <div
      {...props}
      className={[s.card, props.className].filter(Boolean).join(' ')}
    />
  )
}

export default Card
