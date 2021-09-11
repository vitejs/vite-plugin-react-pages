import type { Root } from 'mdast'

export function TsInfoMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: string[] = []

    children.forEach((child) => {
      if ((child.type as string) === 'jsx') {
        const regexp = /<TsInfo\s+src=["'](.*?)["']\s+name=["'](.*?)["']/
        const match = (child.value as string).match(regexp)
        if (match) {
          const src = match[1]
          const name = match[2]
          const nextIndex = addImports.length
          const varName = `_tsInfo${nextIndex}`
          addImports.push(
            `import * as ${varName} from "${src}?tsInfo=${name}";`
          )
          child.value = `<TsInfo {...${varName}} />`
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
