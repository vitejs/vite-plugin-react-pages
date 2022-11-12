import fs from 'fs-extra'
import * as globby from 'globby'

function toDest(file) {
  return file.replace(/^src\//, 'lib/')
}

globby.globbySync('src/**/!(*.ts|*.tsx|tsconfig.json)').forEach((file) => {
  fs.copy(file, toDest(file))
})
