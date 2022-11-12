import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import type { Root } from 'mdast'

export function AnalyzeHeadingsMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const headings = [] as any[]

    visit(tree, 'heading', (node, index, parent) => {
      headings.push({ node, text: toString(node) })
    })

    console.log('headings', headings)

    file.headingsData = headings

    return
  }
}
