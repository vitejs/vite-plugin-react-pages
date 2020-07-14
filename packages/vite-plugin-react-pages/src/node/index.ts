import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'
import type { IPageFiles } from './dynamic-modules/pages'

function createPlugin(
  findPageFiles: string | (() => Promise<IPageFiles>) = path.join(process.cwd(), 'pages')
): Plugin {
  return {
    configureServer: configureServer(findPageFiles),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
    rollupInputOptions: {
      plugins: [rollupPlugin(findPageFiles)],
    },
  }
}

export default createPlugin

export { ssrBuild } from './build/ssr'
