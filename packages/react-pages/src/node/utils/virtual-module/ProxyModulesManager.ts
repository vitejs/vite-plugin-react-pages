import { File, VirtualModulesManager } from '.'

/**
 * built upon VirtualModulesManager.
 * map each sourceFile into a proxyModule, which is a virtule module.
 * when the sourceFile is updated, it will emit update event for the proxyModule.
 */
export class ProxyModulesManager {
  private vmm = new VirtualModulesManager()
  private register: { [proxyModuleId: string]: boolean } = {}

  constructor(public readonly proxyModulePrefix: string) {
    if (!proxyModulePrefix)
      throw new Error(`invalid proxyModulePrefix: ${proxyModulePrefix}`)
  }

  /**
   * register a source file to watch,
   * map its data into a proxy module,
   * return the proxyModuleId
   */
  registerProxyModule(
    sourceFilePath: string,
    getProxyModuleData: (sourceFile: File) => any
  ) {
    const proxyModuleId = this.getProxyModuleId(sourceFilePath)
    if (this.register[proxyModuleId]) return proxyModuleId
    this.vmm.addFSWatcher('', [sourceFilePath], async (file, api) => {
      const proxyModuleData = await getProxyModuleData(file)
      api.addModuleData(proxyModuleId, proxyModuleData)
    })
    this.register[proxyModuleId] = true
    return proxyModuleId
  }

  /**
   * get proxy module by proxyModuleId
   */
  async getProxyModule(proxyModuleId: string) {
    const sourceFilePath = this.getSourceFilePath(proxyModuleId)
    return new Promise<{ sourceFilePath: string; data: any }>((res, rej) => {
      this.vmm.getModule(proxyModuleId, (moduleData) => {
        if (!Array.isArray(moduleData) || moduleData.length === 0)
          return rej(
            new Error(`assertion fail: proxy module is empty: ${proxyModuleId}`)
          )
        if (moduleData.length !== 1)
          return rej(
            new Error(
              `assertion fail: proxy module has multiple data: ${proxyModuleId}`
            )
          )
        res({ sourceFilePath, data: moduleData[0] })
      })
    })
  }

  /**
   * emit event when a proxyModule has been updated
   */
  onProxyModuleUpdate(cb: (proxyModuleId: string) => void) {
    this.vmm.addModuleListener((proxyModuleId) => {
      cb(proxyModuleId)
    })
  }

  close() {
    this.vmm.close()
  }

  getProxyModuleId(sourceFilePath: string) {
    return this.proxyModulePrefix + sourceFilePath
  }

  getSourceFilePath(proxyModuleId: string) {
    if (!this.isProxyModuleId(proxyModuleId))
      throw new Error(`assertion fail: not a proxyModuleId: ${proxyModuleId}`)
    return proxyModuleId.slice(this.proxyModulePrefix.length)
  }

  isProxyModuleId(id: string) {
    return id.startsWith(this.proxyModulePrefix) && this.register[id]
  }
}
