import React from 'react'
import Layout from '/@layout/index'
import type { IRenderPage } from 'vite-plugin-react-pages/client'

const render: IRenderPage = (pageData, pages) => {
  console.log('pageData', pageData)
  console.log('pages', pages)
  const { default: PageComponent } = pageData
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

export default render
