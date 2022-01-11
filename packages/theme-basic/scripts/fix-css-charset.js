const fs = require('fs')
const path = require('path')

const cssPath = path.resolve(__dirname, '../dist/index.css')

/**
 * ensure there is only one "@charset" rule
 * at the top of the css file
 */
function fixCssCharset() {
  let css = fs.readFileSync(cssPath, 'utf-8')
  css = css.replace(/@charset "UTF-8";/gi, '')
  css = '@charset "UTF-8";\n' + css
  fs.writeFileSync(cssPath, css)
}

module.exports.fixCssCharset = fixCssCharset

if (require.main === module) {
  fixCssCharset()
}
