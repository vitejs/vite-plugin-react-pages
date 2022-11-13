import type { MdxjsEsm, MdxJsxFlowElement } from 'mdast-util-mdx'

/**
 * create mdast node for expression:
 * import * as name from 'from'
 */
export function createNameSpaceImportNode({
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

/**
 * create mdast node for expression:
 * import name from 'from'
 */
export function createDefaultImportNode({
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
                type: 'ImportDefaultSpecifier',
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

/**
 * create mdast node for expression:
 * <Component {...props} />
 */
export function createJSXWithSpreadPropsNode({
  Component,
  props,
}: {
  Component: string
  props: string
}): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name: Component,
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
                        name: props,
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
