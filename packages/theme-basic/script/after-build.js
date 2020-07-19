const fs = require('fs')
const path = require('path')

const bundlePath = path.resolve(__dirname, '../dist/index.js')
let bundle = fs.readFileSync(bundlePath, 'utf-8')
bundle = `import './index.css';\n` + bundle
fs.writeFileSync(bundlePath, bundle)
