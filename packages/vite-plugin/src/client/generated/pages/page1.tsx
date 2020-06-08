import { Layout } from '/@configs/index'
import Page1 from '/@root/page1$'

import React from 'react'

interface IProps {}

const Page: React.FC<IProps> = (props) => {
  return <Layout Content={Page1} />
}

export default Page
