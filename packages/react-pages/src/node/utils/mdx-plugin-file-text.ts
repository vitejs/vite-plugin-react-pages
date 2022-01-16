import visit from 'unist-util-visit'
import type { Root } from 'mdast'

export function FileTextMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const addImports: string[] = []

    visit(tree, 'jsx', (child: any, index, parent) => {
      const regexp = /<FileText\s+src=["'](.*?)["']\s+syntax=["'](.*?)["']/
      const match = (child.value as string).match(regexp)
      if (match) {
        const [, src, syntax] = match
        const nextIndex = addImports.length
        const varName = `_fileText${nextIndex}`
        addImports.push(`import ${varName} from "${src}?raw";`)
        child.value = `<FileText text={${varName}} syntax="${syntax}" />`
      }
    })

    tree.children.unshift(
      ...addImports.map((importStr) => {
        return {
          type: 'import',
          value: importStr,
        } as any
      })
    )
  }
}
