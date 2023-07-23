import { File, VirtualModulesManager } from '.'

/**
 * built upon VirtualModulesManager.
 * map each sourceFile into a proxyModule, which is a virtual module.
 * when the sourceFile is updated, it will emit update event for the proxyModule.
 */
export class ProxyModulesManager {
  private vmm = new VirtualModulesManager()
  private register: Map<string, { loaded: boolean; sourceFilePath: string }> =
    new Map()

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
    if (this.register.has(proxyModuleId)) return proxyModuleId
    this.vmm.addFSWatcher('', [sourceFilePath], async (file, api) => {
      const proxyModuleData = await getProxyModuleData(file)
      api.addModuleData(proxyModuleId, proxyModuleData)
    })
    this.register.set(proxyModuleId, { loaded: false, sourceFilePath })
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
        // set loaded flag after a timeout to avoid some race condition
        // (onProxyModuleUpdate cb is triggered before this load event)
        setTimeout(() => {
          const registerItem = this.register.get(proxyModuleId)
          if (registerItem && !registerItem.loaded) {
            this.register.set(proxyModuleId, { ...registerItem, loaded: true })
          }
        }, 50)
      })
    })
  }

  /**
   * emit event when a proxyModule is updated since loaded
   */
  onProxyModuleUpdate(
    cb: (proxyModuleId: string, data: any[], prevData: any[]) => void
  ) {
    this.vmm.addModuleListener((proxyModuleId, data, prevData) => {
      const registerItem = this.register.get(proxyModuleId)
      const notLoaded = registerItem && !registerItem.loaded
      // bail out if this is the first-load event
      if (notLoaded && prevData.length === 0) return
      cb(proxyModuleId, data, prevData)
    })
  }

  close() {
    this.vmm.close()
  }

  private getProxyModuleId(sourceFilePath: string, key?: string) {
    let prefix = this.proxyModulePrefix
    if (key) prefix += `--${key}--`
    return prefix + sourceFilePath
  }

  isProxyModuleId(id: string) {
    return id.startsWith(this.proxyModulePrefix) && this.register.has(id)
  }

  getSourceFilePath(id: string) {
    return this.register.get(id)?.sourceFilePath
  }
}
