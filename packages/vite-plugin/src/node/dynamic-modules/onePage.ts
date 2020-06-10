import * as fs from 'fs-extra'

import { resolvePageFile } from './utils/resolvePageFile'
import { resolvePageLayout } from './utils/resolvePageLayout'

export default async function onePage(
  pagePublicPath: string,
  pagesDirPath: string,
  fileToRequest: (file: string) => string
) {
  let page = pagePublicPath
  // resolvePageFile will correctly resolve '' into /$.tsx or /$/index.tsx
  if (page === '__rootIndex__') page = ''
  const pageFilePath = await resolvePageFile(page, pagesDirPath)
  if (!pageFilePath || !fs.existsSync(pageFilePath)) {
    // ctx.status = 404
    return null
  }
  const layoutFilePath = await resolvePageLayout(pageFilePath, pagesDirPath)
  const layoutPublicPath = fileToRequest(layoutFilePath)
  const pageFilePublicPath = fileToRequest(pageFilePath)

  return `
import * as pageData from "${pageFilePublicPath}";
import renderPage from "${layoutPublicPath}";
export {
  pageData,
  renderPage,
};
`
}
