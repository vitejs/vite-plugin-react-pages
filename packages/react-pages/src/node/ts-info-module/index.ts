import { collectInterfaceInfo } from './extract'

export function tsInfoModule(sourcePath: string, exportName: string) {
  const tsInfo = collectInterfaceInfo(sourcePath, exportName)
  return `export const data = ${JSON.stringify(tsInfo)};`
}
