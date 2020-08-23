// copy and watch non-ts files in src/client
const fs = require('fs-extra')
const chokidar = require('chokidar')
const { addCSSImport } = require('./add-css-import')

chokidar
  .watch('dist/index.js')
  .on('change', (file) => addCSSImport())
  .on('add', (file) => addCSSImport())
