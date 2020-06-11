import React from 'react'
import Layout from '/@layout/index'
import type { IRenderPage } from 'vite-plugin-react-pages/client'

import * as rrd from "react-router-dom";

console.log('rrd', rrd)

const render: IRenderPage = (pageData, pages) => {
  console.log('pageData', pageData)
  console.log('pages', pages)
  const { default: PageComponent } = pageData
  return <Layout Content={PageComponent} pages={pages} />
}

export default render
