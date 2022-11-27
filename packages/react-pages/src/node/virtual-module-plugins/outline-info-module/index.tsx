import { ProxyModulesManager } from '../../utils/virtual-module'
import { extractOutlineInfo } from './extractOutlineInfo'

// mark demo proxy files as virtual files to avoid vite warning "missing source files"
// https://github.com/vitejs/vite/blob/60721ac53a1bf326d1cac097f23642faede234ff/packages/vite/src/node/server/sourcemap.ts#L39
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
const PROXY_MODULE_ID_PREFIX = '\0/@react-pages/outline-info'

export class OutlineInfoModuleManager {
  private pmm = new ProxyModulesManager(PROXY_MODULE_ID_PREFIX)

  registerProxyModule(datasourceFilePath: string) {
    return this.pmm.registerProxyModule(datasourceFilePath, async (file) => {
      const content = await file.read()
      const { outline } = await extractOutlineInfo(content)
      return {
        datasourceFilePath,
        outline,
      }
    })
  }

  isProxyModuleId(id: string) {
    return this.pmm.isProxyModuleId(id)
  }

  async loadProxyModule(proxyModuleId: string) {
    const data = await this.pmm.getProxyModuleData(proxyModuleId)
    const { outline } = data ?? {}
    if (!outline)
      throw new Error(`assertion fail: invalid outline data: ${proxyModuleId}`)

    return `export const outline = ${JSON.stringify(outline)};`
  }

  onUpdate(cb: (reloadPath: string) => void) {
    this.pmm.onProxyModuleUpdate(cb)
  }

  close() {
    this.pmm.close()
  }
}
