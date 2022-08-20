import fs from 'fs-extra'

const rootPath = new URL('../', import.meta.url)

fs.ensureDirSync(new URL('./dist/node-esm', rootPath))

fs.writeFileSync(
  new URL('./dist/node-esm/package.json', rootPath),
  JSON.stringify({ type: 'module' }, null, 2)
)
