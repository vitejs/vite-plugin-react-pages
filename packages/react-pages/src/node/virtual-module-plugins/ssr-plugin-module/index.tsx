const SSR_PLUGIN_MODULE_ID = '/@react-pages/ssr-plugins'

export class SSRPluginModuleManager {
  private ssrPluginPaths: string[] = []

  registerSSRPlugin(pluginPath: string) {
    this.ssrPluginPaths.push(pluginPath)
  }

  isSSRPluginModule(id: string) {
    return id === SSR_PLUGIN_MODULE_ID
  }

  load() {
    const codeLines = this.ssrPluginPaths.map((path, index) => {
      return `
import plugin${index} from "${path}";
plugins.push(plugin${index});
`
    })
    return `export const plugins = [];
${codeLines.join('')}`
  }
}
