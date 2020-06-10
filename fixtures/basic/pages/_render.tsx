import React from 'react'
import Layout from '/@layout/index'
import type { IRenderPage } from 'vite-plugin-react-pages/client'

const render: IRenderPage = (pageData, pages) => {
  console.log('pageData', pageData)
  console.log('pages', pages)
  const { default: PageComponent } = pageData
  return <Layout Content={PageComponent} pages={pages} />
}

export default render
