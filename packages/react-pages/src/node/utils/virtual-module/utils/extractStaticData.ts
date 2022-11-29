import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { File } from './File'

export async function extractStaticData(
  file: File
): Promise<{ sourceType: string; [key: string]: any }> {
  const code = await file.read()
  switch (file.extname) {
    case 'md':
    case 'mdx':
      const { data: frontmatter } = grayMatter(code)
      const staticData: any = {
        ...frontmatter,
        sourceType: 'md',
        __sourceFilePath: file.path,
      }
      if (staticData.title === undefined) {
        staticData.title = extractMarkdownTitle(code)
      }
      return staticData
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return { ...parse(extract(code)), sourceType: 'js' }
    default:
      throw new Error(`unexpected extension name "${file.extname}"`)
  }
}
function extractMarkdownTitle(code: string) {
  const match = code.match(/^# (.*)$/m)
  return match?.[1]
}
