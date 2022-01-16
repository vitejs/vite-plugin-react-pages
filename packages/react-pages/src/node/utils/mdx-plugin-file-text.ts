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
      } else {
        const basicRegexp = /<FileText\s+(?:.+?\s)?src=/
        const basicMatch = child.value.match(basicRegexp)
        if (basicMatch) {
          // detect invalid usage of FileText
          // for example: props.syntax missing
          throw new Error(
            `Invalid usage of <FileText />: ${child.value}.
            Correct Syntax: <FileText src="./path/to/file" syntax="ts|tsx|text" />`
          )
        }
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
