import React from 'react'
import Layout from '/@layout/index'

export default (PageComponent: React.ComponentType, pageData: any) => {
  return (
    <Layout
      Content={PageComponent}
      sideMenuData={[
        {
          text: 'page1',
          path: '/page1',
        },
        {
          text: 'page2 custom layout data',
          path: '/page2',
        },
      ]}
    />
  )
}
