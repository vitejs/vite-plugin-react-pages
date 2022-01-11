import type { Root } from 'mdast'
import visit from 'unist-util-visit'

export function ImageMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: string[] = []

    visit(tree, 'image', (node, index, parent) => {
      const { url = '', alt, title } = node as any
      if (url.startsWith('./') || url.startsWith('../')) {
        const nextIndex = addImports.length
        const varName = `_img${nextIndex}`
        addImports.push(`import ${varName} from "${url}";`)
        const altAttr = alt ? `alt="${alt}"` : ''
        const titleAttr = title ? `title="${title}"` : ''
        parent?.children.splice(index, 1, {
          type: 'jsx',
          value: `<img src={${varName}} ${altAttr} ${titleAttr} />`,
        } as any)
      }
    })

    children.unshift(
      ...addImports.map((importStr) => {
        return {
          type: 'import',
          value: importStr,
        } as any
      })
    )
  }
}
