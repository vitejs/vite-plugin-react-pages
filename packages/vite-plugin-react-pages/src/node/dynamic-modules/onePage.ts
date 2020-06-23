import * as fs from 'fs-extra'

import { resolvePageFile } from './utils/resolvePageFile'

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
  const pageFilePublicPath = fileToRequest(pageFilePath)

  return `
import * as pageData from "${pageFilePublicPath}";
export {
  pageData,
};
`
}
