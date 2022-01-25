import { File, VirtualModulesManager } from '.'

/**
 * built upon VirtualModulesManager.
 * map each sourceFile into a proxyModule, which is a virtual module.
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
   *
   * to create multiple proxy modules for one sourceFilePath,
   * you can pass in keys to differentiate between them.
   */
  registerProxyModule(
    sourceFilePath: string,
    getProxyModuleData: (sourceFile: File) => any,
    key?: string
  ) {
    const proxyModuleId = this.getProxyModuleId(sourceFilePath, key)
    if (this.register[proxyModuleId]) return proxyModuleId
    this.vmm.addFSWatcher('', [sourceFilePath], async (file, api) => {
      const proxyModuleData = await getProxyModuleData(file)
      api.addModuleData(proxyModuleId, proxyModuleData)
    })
    this.register[proxyModuleId] = true
    return proxyModuleId
  }

  /**
   * get proxy module data by proxyModuleId
   */
  async getProxyModuleData(proxyModuleId: string) {
    return new Promise<any>((res, rej) => {
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
        res(moduleData[0])
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

  getProxyModuleId(sourceFilePath: string, key?: string) {
    let prefix = this.proxyModulePrefix
    if (key) prefix += `--${key}--`
    return prefix + sourceFilePath
  }

  isProxyModuleId(id: string) {
    return id.startsWith(this.proxyModulePrefix) && this.register[id]
  }
}
