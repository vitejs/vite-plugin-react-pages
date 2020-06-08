import React from 'react'
import { Link } from 'react-router-dom'
import data from './data'

const SideMenu: React.FC = () => {
  return (
    <ul>
      {data.map((item, index) => {
        return (
          <li key={index}>
            <Link to={item.text}>{item.path}</Link>
          </li>
        )
      })}
    </ul>
  )
}

export default SideMenu
