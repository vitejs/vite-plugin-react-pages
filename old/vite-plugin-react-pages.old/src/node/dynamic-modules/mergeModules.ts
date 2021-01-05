export function mergeModules(modules: { [key: string]: string }) {
  const importModule = Object.entries(modules).map(
    ([key, path], idx) => `
  import * as m${idx} from "${path}";
  modules["${key}"] = m${idx};`
  )
  return `
  const modules = {};
  ${importModule.join('\n')}
  export default modules;`
}
