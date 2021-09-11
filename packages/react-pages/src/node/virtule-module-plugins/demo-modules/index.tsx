import { strip } from 'jest-docblock'
import { ProxyModulesManager } from '../../utils/virtual-module'
import { extractStaticData } from '../../utils/virtual-module/utils'

const DEMO_PROXY_PREFIX = '/@react-pages/demos'

export class DemoModuleManager {
  private pmm = new ProxyModulesManager(DEMO_PROXY_PREFIX)

  registerProxyModule(demoPath: string) {
    return this.pmm.registerProxyModule(demoPath, async (file) => {
      const content = await file.read()
      const staticData = await extractStaticData(file)
      // strip staticData notation
      const code = strip(content)
      return {
        demoPath,
        code,
        staticData,
      }
    })
  }

  isProxyModuleId(id: string) {
    return this.pmm.isProxyModuleId(id)
  }

  async loadProxyModule(demoProxyId: string) {
    const data = await this.pmm.getProxyModuleData(demoProxyId)
    const { demoPath, code, staticData } = data ?? {}
    if (!demoPath || !code || !staticData)
      throw new Error(`assertion fail: invalid demo data: ${demoProxyId}`)

    return `export * from "${demoPath}";
    export { default } from "${demoPath}";
    
    const code = ${JSON.stringify(strip(code))};
    const title = ${JSON.stringify(staticData.title)};
    const desc = ${JSON.stringify(staticData.description || staticData.desc)};
    
    export const demoMeta = { code, title, desc };
    export const isDemo = true;`
  }

  onUpdate(cb: (reloadPath: string) => void) {
    this.pmm.onProxyModuleUpdate(cb)
  }

  close() {
    this.pmm.close()
  }
}

export * from './mdx-plugin'
