export function mergeModules(modulePaths: string[]) {
  const importModule = modulePaths.map(
    (m, idx) => `
  import * as m${idx} from "${m}";
  modules.push(m${idx});`
  )
  return `
  const modules = [];
  ${importModule.join('\n')}
  export default modules;`
}
