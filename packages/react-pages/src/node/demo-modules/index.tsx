import fs from 'fs-extra'
// strip staticData notation
import { strip, extract, parse } from 'jest-docblock'

export async function demoModule(demoPath: string) {
  // TODO: if the demoPath file changed,
  // this code will not be updated by hmr
  const code = await fs.readFile(demoPath, 'utf8')

  const staticData = parse(extract(code))

  return `
export * from "${demoPath}";
export { default } from "${demoPath}";

const code = ${JSON.stringify(strip(code))};
const title = ${JSON.stringify(staticData.title)};
const desc = ${JSON.stringify(staticData.description || staticData.desc)};

export const demoMeta = { code, title, desc };
export const isDemo = true;
`
}
