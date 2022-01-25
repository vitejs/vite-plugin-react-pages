import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import mdx from 'vite-plugin-mdx'
import pages, {
  PageStrategy,
  FileHandler,
  File,
  extractStaticData,
} from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [
    react(),
    mdx(),
    pages({
      pagesDir: __dirname,
      // custom pageStrategy
      pageStrategy: new PageStrategy(function findPages(pagesDir, helpers) {
        helpers.watchFiles(
          pagesDir,
          '**/index.{md,mdx,js,jsx,ts,tsx}',
          fileHandler
        )
      }),
    }),
  ],
})

const fileHandler: FileHandler = async (file: File, fileHandlerAPI) => {
  const pagePublicPath = getPagePublicPath(file.relative)
  fileHandlerAPI.addPageData({
    pageId: pagePublicPath,
    dataPath: file.path,
    staticData: await extractStaticData(file),
  })
}

/**
 * turn `sub-path/page2/index.tsx` into `/sub-path/page2`
 */
function getPagePublicPath(relativePageFilePath: string) {
  console.log('getPagePublicPath', relativePageFilePath)
  let pagePublicPath = relativePageFilePath.replace(
    /index\.(md|mdx|js|jsx|ts|tsx)$/,
    ''
  )
  // remove ending slash
  pagePublicPath = pagePublicPath.replace(/\/$/, '')
  // add starting slash
  pagePublicPath = `/${pagePublicPath}`
  return pagePublicPath
}
