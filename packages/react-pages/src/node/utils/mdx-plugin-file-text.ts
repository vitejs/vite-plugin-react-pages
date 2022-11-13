/// <reference types="remark-mdx" />
import type { Root } from 'mdast'
import type { MdxjsEsm, MdxJsxFlowElement } from 'mdast-util-mdx'
import { createDefaultImportNode } from './mdastUtils'

export function FileTextMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: MdxjsEsm[] = []

    children.forEach((child, index) => {
      // find jsx node like: <FileText src="srcValue" syntax="syntaxValue" />
      if (child.type === 'mdxJsxFlowElement' && child.name === 'FileText') {
        const srcAttr = child.attributes.find(
          (attr) =>
            attr.type === 'mdxJsxAttribute' &&
            attr.name === 'src' &&
            typeof attr.value === 'string'
        )
        const srcValue = srcAttr?.value as string

        const syntaxAttr = child.attributes.find(
          (attr) =>
            attr.type === 'mdxJsxAttribute' &&
            attr.name === 'syntax' &&
            typeof attr.value === 'string'
        )
        const syntaxValue = syntaxAttr?.value as string

        if (srcValue && syntaxValue) {
          const nextIndex = addImports.length
          const varName = `_fileText${nextIndex}`
          // add import:
          // import varName from "${srcValue}?raw"
          addImports.push(
            createDefaultImportNode({
              name: varName,
              from: `${srcValue}?raw`,
            })
          )
          // replace this node with:
          // <FileText text={varName} syntax="syntaxValue" />
          children.splice(
            index,
            1,
            createFileTextJSXNode({
              text: varName,
              syntax: syntaxValue,
            })
          )
        }
      }
    })

    children.unshift(...addImports)
  }
}

/**
 * create mdast node for expression:
 * <FileText text={text} syntax="syntax" />
 */
function createFileTextJSXNode({
  text,
  syntax,
}: {
  text: string
  syntax: string
}): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'FileText',
    data: {
      _mdxExplicitJsx: true,
    },
    children: [],
    attributes: [
      {
        type: 'mdxJsxAttribute',
        name: 'text',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: text,
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: {
                    type: 'Identifier',
                    name: text,
                  },
                },
              ],
            },
          },
        },
      },
      {
        type: 'mdxJsxAttribute',
        name: 'syntax',
        value: syntax,
      },
    ],
  }
}
