import { ProxyModulesManager } from '../../utils/virtual-module'
import { collectInterfaceInfo } from './extract'

const PROXY_PREFIX = '/@react-pages/tsInfo'

export class TsInfoModuleManager {
  private pmm = new ProxyModulesManager(PROXY_PREFIX)

  registerProxyModule(sourcePath: string, exportName: string) {
    return this.pmm.registerProxyModule(
      sourcePath,
      async (file) => {
        const tsInfo = collectInterfaceInfo(sourcePath, exportName)
        return {
          sourcePath,
          exportName,
          tsInfo,
        }
      },
      exportName
    )
  }

  isProxyModuleId(id: string) {
    return this.pmm.isProxyModuleId(id)
  }

  async loadProxyModule(proxyModuleId: string) {
    const data = await this.pmm.getProxyModuleData(proxyModuleId)
    const { sourcePath, exportName, tsInfo } = data ?? {}
    if (!sourcePath || !exportName || !tsInfo)
      throw new Error(`assertion fail: invalid data: ${proxyModuleId}`)
    return `export const data = ${JSON.stringify(tsInfo)};`
  }

  onUpdate(cb: (reloadPath: string) => void) {
    this.pmm.onProxyModuleUpdate(cb)
  }

  close() {
    this.pmm.close()
  }
}
