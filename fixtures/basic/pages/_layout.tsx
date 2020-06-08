import React from 'react'
import Layout from '../layout'

export default (PageComponent: React.ComponentType, pageData: any) => {
  return <Layout Content={PageComponent} />
}
