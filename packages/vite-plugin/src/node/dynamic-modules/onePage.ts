import * as fs from 'fs-extra'

import { resolvePageFile } from './utils/resolvePageFile'
import { resolvePageLayout } from './utils/resolvePageLayout'

export default async function onePage(
  pagePublicPath: string,
  pagesDirPath: string,
  fileToRequest: (file: string) => string
) {
  if (pagePublicPath === '/__rootIndex__') pagePublicPath = '/'
  const pageFilePath = await resolvePageFile(pagePublicPath, pagesDirPath)
  if (!pageFilePath || !fs.existsSync(pageFilePath)) {
    return null
  }
  const layoutFilePath = await resolvePageLayout(pageFilePath, pagesDirPath)
  const layoutPublicPath = fileToRequest(layoutFilePath)
  const pageFilePublicPath = fileToRequest(pageFilePath)

  return `
import renderPage from "${layoutPublicPath}";
import * as pageData from "${pageFilePublicPath}";
export {
  pageData,
  renderPage,
};
`
}
