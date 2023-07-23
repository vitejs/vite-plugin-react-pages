import invariant from 'tiny-invariant'
import { dequal } from 'dequal'

import { ProxyModulesManager } from '../../utils/virtual-module'
import { extractOutlineInfo } from './extractOutlineInfo'

// mark demo proxy files as virtual files to avoid vite warning "missing source files"
// https://github.com/vitejs/vite/blob/60721ac53a1bf326d1cac097f23642faede234ff/packages/vite/src/node/server/sourcemap.ts#L39
// https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention
export const OUTLINE_INFO_MODULE_ID_PREFIX = '\0/@react-pages/outline-info'

export class OutlineInfoModuleManager {
  private pmm = new ProxyModulesManager(OUTLINE_INFO_MODULE_ID_PREFIX)

  registerProxyModule(datasourceFilePath: string) {
    return this.pmm.registerProxyModule(datasourceFilePath, async (file) => {
      const content = await file.read()
      const { outline } = await extractOutlineInfo(content)
      return {
        datasourceFilePath,
        outline,
        // content,
      }
    })
  }

  isProxyModuleId = this.pmm.isProxyModuleId.bind(this.pmm)

  async loadProxyModule(proxyModuleId: string) {
    const data = await this.pmm.getProxyModuleData(proxyModuleId)
    const { outline } = data ?? {}
    if (!outline)
      throw new Error(`assertion fail: invalid outline data: ${proxyModuleId}`)

    return `export const outline = ${JSON.stringify(outline)};
export let onUpdate;
if (import.meta.hot) {
  const d = import.meta.hot.data;
  if (!d.listeners) d.listeners = [];
  onUpdate = (cb) => {
    d.listeners.push(cb);
    return () => {
      d.listeners = d.listeners.filter(l => l !== cb);
    }
  };
  import.meta.hot.accept((_newMod) => {
    const newMod = {..._newMod, onUpdate: undefined};
    d.listeners.forEach((cb) => cb(newMod));
  })
}
`
  }

  onUpdate(cb: (reloadPath: string) => void) {
    this.pmm.onProxyModuleUpdate((proxyModuleId: string, data, prevData) => {
      invariant(data.length <= 1)
      invariant(prevData.length <= 1)
      const outline = data[0]?.outline
      const prevOutline = prevData[0]?.outline
      if (dequal(outline, prevOutline)) {
        // outline hasn't changed. skip update
        return
      }
      cb(proxyModuleId)
    })
  }

  close() {
    this.pmm.close()
  }
}
