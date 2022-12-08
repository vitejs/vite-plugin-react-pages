/**
 * This is the entry for static-site-generation(ssg)'s client side hydration.
 * Used in: "ssr mode"
 * ("ssr" is used in many places in this project to refer to "ssg". Should have called it ssg mode...)
 */

import React from 'react'
import { hydrateRoot } from 'react-dom/client'

import type { PageLoaded } from '../../../clientTypes'
import App from '../App'
import ClientAppWrapper from './ClientAppWrapper'
import pages from '/@react-pages/pages'

declare global {
  interface Window {
    _vitePagesSSR: {
      routePath: string
    }
  }
}

const routePath = window._vitePagesSSR?.routePath

if (!routePath) {
  console.error(
    `[vite-pages]: window._vitePagesSSR?.routePath should be defined`
  )
}

const pageDataImporter = pages[routePath]?.data
if (pageDataImporter) {
  // load current page data before hydrate
  pageDataImporter().then(({ default: pageLoaded }: any) => {
    const initCache: PageLoaded = {
      [routePath]: { ...pageLoaded },
    }
    hydrate(initCache)
  })
} else {
  // there is no page data for current page
  hydrate({})
}

function hydrate(initCache: PageLoaded) {
  const container = document.getElementById('root')!
  hydrateRoot(
    container,
    <ClientAppWrapper initCache={initCache}>
      <App />
    </ClientAppWrapper>
  )
}
