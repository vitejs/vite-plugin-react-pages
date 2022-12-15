import type { Plugin } from 'vite'
import { resolve } from 'path'
import { _dirname } from './utils.js'

const PKG_ROOT = resolve(_dirname, '../..')
const SSR_PLUGIN_PATH = resolve(PKG_ROOT, 'dist/ssrPlugin.js')

export default function createPlugin(): Plugin {
  return {
    name: 'vite-pages-theme-doc/vitePlugin',
    configResolved(config) {
      const vitePagesPlugin = config.plugins?.find((plugin) => {
        return (
          plugin.name === 'vite-plugin-react-pages' &&
          typeof (plugin as any).registerSSRPlugin === 'function'
        )
      })
      if (vitePagesPlugin) {
        ;(vitePagesPlugin as any).registerSSRPlugin(SSR_PLUGIN_PATH)
      }
    },
  }
}
