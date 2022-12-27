/// <reference types="remark-mdx" />
import type { Root } from 'mdast'
import type { MdxjsEsm } from 'mdast-util-mdx'
import {
  createJSXWithSpreadPropsNode,
  createNameSpaceImportNode,
} from '../../utils/mdastUtils'

export function TsInfoMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: MdxjsEsm[] = []

    children.forEach((child, index) => {
      // find jsx node like: <TsInfo src="srcValue" name="nameValue" />
      if (child.type === 'mdxJsxFlowElement' && child.name === 'TsInfo') {
        const srcAttr = child.attributes.find(
          (attr) =>
            attr.type === 'mdxJsxAttribute' &&
            attr.name === 'src' &&
            typeof attr.value === 'string'
        )
        const srcValue = srcAttr?.value

        const nameAttr = child.attributes.find(
          (attr) =>
            attr.type === 'mdxJsxAttribute' &&
            attr.name === 'name' &&
            typeof attr.value === 'string'
        )
        const nameValue = nameAttr?.value

        if (srcValue && nameValue) {
          const nextIndex = addImports.length
          const varName = `_tsInfo${nextIndex}`
          // add import:
          // import * as varName from "${srcValue}?tsInfo=${nameValue}"
          addImports.push(
            createNameSpaceImportNode({
              name: varName,
              from: `${srcValue}?tsInfo=${nameValue}`,
            })
          )
          // replace this node with:
          // <TsInfo {...varName} />
          children.splice(
            index,
            1,
            createJSXWithSpreadPropsNode({
              Component: 'TsInfo',
              props: varName,
            })
          )
        }
      }
    })

    children.unshift(...addImports)
  }
}
