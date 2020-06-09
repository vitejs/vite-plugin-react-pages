import React from 'react'
import Layout from '/@layout/index'

export default function render(
  PageComponent: React.ComponentType,
  pageData: any,
  pages: any
) {
  console.log('pageData', pageData)
  console.log('pages', pages)
  return <Layout Content={PageComponent} />
}
