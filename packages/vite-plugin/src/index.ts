import { Plugin } from 'vite'
import { configureServer } from './configureServer'

function createPlugin(pagesDirPath: string): Plugin {
  return {
    configureServer: configureServer(pagesDirPath),
  }
}

export default createPlugin
