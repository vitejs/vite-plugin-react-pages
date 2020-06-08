import React from 'react'
import { Link } from 'react-router-dom'

import navData from './nav-data'
import logo from './logo'
import './topbar.css'

interface IProps {}

const TopBar: React.FC<IProps> = (props) => {
  return (
    <div className="top-bar">
      <div className="logo">{logo}</div>
      <ul className="navs">
        {navData.map((item, index) => {
          let content: React.ReactElement
          if ('href' in item) {
            content = <a href={item.href}>{item.text}</a>
          } else {
            content = <Link to={item.path}>{item.text}</Link>
          }
          return <li key={index}>{content}</li>
        })}
      </ul>
    </div>
  )
}

export default TopBar
