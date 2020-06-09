import React from 'react'
import Layout from '/@layout/index'

export default function render(
  PageComponent: React.ComponentType,
  pageData: any,
  pages: any
) {
  console.log('pageData', pageData)
  console.log('pages', pages)
  return (
    <Layout
      Content={PageComponent}
      pages={pages}
      // get type checking when configuring layout
      sideMenuData={[
        {
          text: 'index',
          path: '/',
        },
        {
          text: 'page2 custom layout data',
          path: '/page2',
        },
      ]}
    />
  )
}
