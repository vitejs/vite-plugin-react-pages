import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'
import type { IPageFiles } from './dynamic-modules/routes'

function createPlugin(
  pagesDirPath: string = path.join(process.cwd(), 'pages'),
  customGetPageFiles: () => IPageFiles,
  customGetDynamicRoutes: () => string
): Plugin {
  return {
    configureServer: configureServer(pagesDirPath, customGetPageFiles),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
    rollupInputOptions: {
      plugins: [rollupPlugin(pagesDirPath)],
    },
  }
}

export default createPlugin

export { ssrBuild } from './build/ssr'
