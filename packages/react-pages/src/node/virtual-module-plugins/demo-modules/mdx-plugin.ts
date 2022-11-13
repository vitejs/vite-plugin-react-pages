/// <reference types="remark-mdx" />
import type { Root } from 'mdast'
import type { MdxjsEsm, MdxJsxFlowElement } from 'mdast-util-mdx'

export function DemoMdxPlugin() {
  return transformer

  function transformer(tree: Root, file: any) {
    const children = tree.children

    const addImports: MdxjsEsm[] = []

    children.forEach((child, index) => {
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
          addImports.push(
            createNameSpaceImportNode({
              name: varName,
              from: `${srcValue}?demo`,
            })
          )
          children.splice(index, 1, createDemoNode(varName))
        }
      }
    })

    children.unshift(...addImports)
  }
}

/**
 * create mdast node for expression:
 * <Demo {...propsIdentifierName} />
 */
function createDemoNode(propsIdentifierName: string): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: 'Demo',
    data: {
      _mdxExplicitJsx: true,
    },
    children: [],
    attributes: [
      {
        type: 'mdxJsxExpressionAttribute',
        value: '',
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [
              {
                type: 'ExpressionStatement',
                expression: {
                  type: 'ObjectExpression',
                  properties: [
                    {
                      type: 'SpreadElement',
                      argument: {
                        type: 'Identifier',
                        name: propsIdentifierName,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  }
}

/**
 * create mdast node for expression:
 * import * as name from 'from'
 */
function createNameSpaceImportNode({
  name,
  from,
}: {
  name: string
  from: string
}): MdxjsEsm {
  return {
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        type: 'Program',
        sourceType: 'module',
        body: [
          {
            type: 'ImportDeclaration',
            specifiers: [
              {
                type: 'ImportNamespaceSpecifier',
                local: {
                  type: 'Identifier',
                  name,
                },
              },
            ],
            source: {
              type: 'Literal',
              value: from,
              raw: JSON.stringify(from),
            },
          },
        ],
      },
    },
  }
}
