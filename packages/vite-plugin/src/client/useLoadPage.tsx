import React, { useState, useEffect } from 'react'
import { wrapMdxModule } from '@alicloud/console-components-doc-runtime'

export default function useLoadPage(docPath: string) {
  const [PageComp, setPageComp] = useState<null | React.ComponentType>(null)
  const [frontmatter, setFrontmatter] = useState<any>(null)
  const [pageConfig, setPageConfig] = useState<any>(null)
  useEffect(() => {
    ;(async () => {
      let LoadedDocComp: React.ComponentType | null = null
      let loadedFrontmatter: object | null = null
      try {
        let docModule = await import(`/proxy-module?path=${docPath}`)
        if (docModule.default.isMDXComponent) {
          docModule = wrapMdxModule(docModule)
        }
        LoadedDocComp = docModule.default
        loadedFrontmatter = docModule.frontmatter
      } catch (error) {
        console.error(`Fetch docPath:"${docPath}" fail.`)
        console.error(error)
      }
      if (LoadedDocComp) setPageComp(() => LoadedDocComp)
      if (loadedFrontmatter) setFrontmatter(loadedFrontmatter)
    })()
    ;(async () => {
      let loadedPageConfig: any = null
      try {
        loadedPageConfig = await import(`/page-config?path=${docPath}`)
      } catch (error) {
        console.error(`Fail to fetch page config for:"${docPath}".`)
        console.error(error)
      }
      if (loadedPageConfig) setPageConfig(loadedPageConfig)
    })()
  }, [docPath])
  return { PageComp, frontmatter, pageConfig }
}
