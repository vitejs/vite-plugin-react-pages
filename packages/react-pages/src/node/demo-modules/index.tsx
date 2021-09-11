import { strip } from 'jest-docblock'
import { VirtualModulesManager } from '../utils/virtual-module'
import { extractStaticData } from '../utils/virtual-module/utils'

const DEMO_PROXY_PREFIX = '/@react-pages/demos'
const getDemoProxyId = (demoPath: string) => DEMO_PROXY_PREFIX + demoPath
const getDemoPath = (demoProxyId: string) =>
  demoProxyId.startsWith(DEMO_PROXY_PREFIX)
    ? demoProxyId.slice(DEMO_PROXY_PREFIX.length)
    : demoProxyId

export class DemoModuleManager {
  private vmm = new VirtualModulesManager()
  private register: { [demoProxyId: string]: boolean } = {}

  registerDemoProxy(demoPath: string) {
    const demoProxyId = getDemoProxyId(demoPath)
    if (this.register[demoProxyId]) return demoProxyId
    this.vmm.addFSWatcher('', [demoPath], async (file, api) => {
      const content = await file.read()
      const staticData = await extractStaticData(file)
      // strip staticData notation
      const code = strip(content)
      api.addModuleData(demoProxyId, {
        demoPath,
        code,
        staticData,
      })
    })
    this.register[demoProxyId] = true
    return demoProxyId
  }

  isDemoProxyId(path: string) {
    return path.startsWith(DEMO_PROXY_PREFIX)
  }

  async loadDemo(demoProxyId: string) {
    const demoPath = getDemoPath(demoProxyId)
    if (!this.register[demoProxyId])
      throw new Error(`assertion fail: demoPath is not registered: ${demoPath}`)
    return new Promise<string>((res, rej) => {
      this.vmm.getModule(demoProxyId, (moduleData) => {
        if (!moduleData || moduleData.length === 0)
          return rej(new Error(`assertion fail: demo not exists: ${demoPath}`))
        const { demoPath: _demoPath, code, staticData } = moduleData[0]
        if (_demoPath !== demoPath)
          return rej(new Error(`assertion fail: invalid demoProxy`))
        res(`export * from "${demoPath}";
          export { default } from "${demoPath}";
          
          const code = ${JSON.stringify(strip(code))};
          const title = ${JSON.stringify(staticData.title)};
          const desc = ${JSON.stringify(
            staticData.description || staticData.desc
          )};
          
          export const demoMeta = { code, title, desc };
          export const isDemo = true;`)
      })
    })
  }

  onDemoUpdate(cb: (reloadPath: string) => void) {
    this.vmm.addModuleListener((demoProxyId) => {
      cb(demoProxyId)
    })
  }

  close() {
    this.vmm.close()
  }
}
