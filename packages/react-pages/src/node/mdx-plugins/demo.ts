import type { Root } from 'mdast'

export function demoTransform() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: string[] = []

    children.forEach((child) => {
      if ((child.type as string) === 'jsx') {
        const regexp = /<Demo src=["'](.*?)["']/
        const match = (child.value as string).match(regexp)
        if (match) {
          const src = match[1]
          const nextIndex = addImports.length
          const varName = `_demo${nextIndex}`
          addImports.push(`import * as ${varName} from "${src}?demo";`)
          child.value = `<Demo {...${varName}} />`
        }
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
