import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'

function createPlugin(
  pagesDirPath: string = path.join(process.cwd(), 'pages')
): Plugin {
  return {
    configureServer: configureServer(pagesDirPath),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
    rollupInputOptions: {
      plugins: [rollupPlugin(pagesDirPath)],
    },
  }
}

export default createPlugin
