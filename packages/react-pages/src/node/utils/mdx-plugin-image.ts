import type { Root } from 'mdast'
import { visit } from 'unist-util-visit'

// After we migrating to mdx@2.x, we should probably use:
// https://github.com/remcohaszing/remark-mdx-images

export function ImageMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: string[] = []

    visit(tree, 'image', (node, index, parent) => {
      if (index === null) return
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
