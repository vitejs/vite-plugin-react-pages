import { ProxyModulesManager } from '../../utils/virtual-module'
import { collectInterfaceInfo } from './extract'

const PROXY_PREFIX = '/@react-pages/tsInfo'

/**
 * TODO:
 * currently we only watch one sourceFilePath for each virtule module(proxyModule).
 * but if the sourceFilePath import other modules, and when that module has updated,
 * TsInfoModuleManager won't notice that.
 * we need a way to create virtule modules with dependencies.
 *
 * currently it is ok to tell users to write a whole type doc in a single file.
 * so supporting virtule modules with dependencies is not needed.
 * but supporting that feature would make our virtule module system more powerful.
 *
 * the same goes for DemoModuleManager.
 */

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

export * from './mdx-plugin'
