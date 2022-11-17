/// <reference types="remark-mdx" />
import type { Root } from 'mdast'
import type { MdxjsEsm } from 'mdast-util-mdx'
import {
  createJSXWithSpreadPropsNode,
  createNameSpaceImportNode,
} from '../../utils/mdastUtils'

export function DemoMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: MdxjsEsm[] = []

    children.forEach((child, index) => {
      // find jsx node like: <Demo src="srcValue" />
      if (child.type === 'mdxJsxFlowElement' && child.name === 'Demo') {
        const srcAttr = child.attributes.find(
          (attr) =>
            attr.type === 'mdxJsxAttribute' &&
            attr.name === 'src' &&
            typeof attr.value === 'string'
        )
        const srcValue = srcAttr?.value
        if (srcValue) {
          const nextIndex = addImports.length
          const varName = `_demo${nextIndex}`
          // add import:
          // import * as varName from "${srcValue}?tsInfo=${nameValue}"
          addImports.push(
            createNameSpaceImportNode({
              name: varName,
              from: `${srcValue}?demo`,
            })
          )
          // replace this node with:
          // <Demo {...varName} />
          children.splice(
            index,
            1,
            createJSXWithSpreadPropsNode({ Component: 'Demo', props: varName })
          )
        }
      }
    })

    children.unshift(...addImports)
  }
}
