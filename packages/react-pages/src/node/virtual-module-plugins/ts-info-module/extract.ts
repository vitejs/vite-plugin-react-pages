import {
  Project,
  TypeElementMemberedNode,
  Node,
  TypeChecker,
  ts,
} from 'ts-morph'

export type TsInfo =
  | {
      // example: type A = { k: v }
      type: 'object-literal'
      name: string
      description: string
      properties: TsPropertyOrMethodInfo[]
    }
  | {
      // example: interface MyInterface { k: v }
      type: 'interface'
      name: string
      description: string
      properties: TsPropertyOrMethodInfo[]
    }
  | {
      // complex type literal
      // example: type A = 'asd' | 123
      type: 'other'
      name: string
      description: string
      text: string
    }

export interface TsPropertyOrMethodInfo {
  name: string
  type: string
  description: string
  defaultValue: string | undefined
  optional: boolean
}

const defaultTsConfig: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  lib: ['lib.esnext.full.d.ts'],
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
}

export function collectInterfaceInfo(
  fileName: string,
  exportName: string,
  options: ts.CompilerOptions = {}
): TsInfo {
  const project = new Project({
    compilerOptions: {
      ...defaultTsConfig,
      ...options,
    },
  })

  const sourceFile = project.addSourceFileAtPath(fileName)
  const typeChecker = project.getTypeChecker()

  const exportedDeclarations = sourceFile
    .getExportedDeclarations()
    .get(exportName)
  if (!exportedDeclarations) {
    throw new Error(
      `Can not find export. ${JSON.stringify({ exportName, fileName })}`
    )
  }
  if (exportedDeclarations.length !== 1) {
    throw new Error(
      `Unexpected exportedDeclaration.length. ${JSON.stringify({
        exportName,
        fileName,
      })}`
    )
  }

  const node = exportedDeclarations[0]

  if (Node.isTypeAliasDeclaration(node)) {
    // type A = { k: v } (type literal)
    // or type A = 'asd' | 123 (complex type)
    const name = node.getName()
    const description = node
      .getJsDocs()
      .map((jsDoc) => {
        return jsDoc.getDescription().trim()
      })
      .join('\n\n')
    const typeNode = node.getTypeNode()

    if (Node.isTypeLiteral(typeNode)) {
      // example: type A = { k: v }
      const members = handleTypeElementMembered(typeNode, typeChecker)
      return {
        type: 'object-literal',
        name,
        description,
        properties: members,
      }
    } else {
      // example: type A = 'asd' | 123
      return {
        type: 'other',
        name,
        description,
        text:
          typeNode?.getText({
            includeJsDocComments: false,
            trimLeadingIndentation: true,
          }) || '',
      }
    }
  }

  if (Node.isInterfaceDeclaration(node)) {
    const name = node.getName()
    const description = node
      .getJsDocs()
      .map((jsDoc) => {
        return jsDoc.getDescription().trim()
      })
      .join('\n\n')
    const members = handleTypeElementMembered(node, typeChecker)
    return { type: 'interface', name, description, properties: members }
  }

  throw new Error('unexpected node type: ' + node.getKindName())
}

// handle Interface or TypeLiteral
// iterate members at type level
// which is higher than ast level, so that we can get inherited membered from a Interface
// https://github.com/dsherret/ts-morph/issues/457#issuecomment-427688926
function handleTypeElementMembered(
  node: TypeElementMemberedNode & Node,
  typeChecker: TypeChecker
): TsPropertyOrMethodInfo[] {
  const result: TsPropertyOrMethodInfo[] = []
  // or use node.getSymbol()?.getMembers() ?
  const nodeType = node.getType()
  const properties = nodeType.getProperties()
  for (const prop of properties) {
    const name = prop.getName()
    const description = ts.displayPartsToString(
      prop.compilerSymbol.getDocumentationComment(typeChecker.compilerObject)
    )
    const type = prop
      .getTypeAtLocation(node)
      // drop the `import('/path/to/file').` before the type text
      // https://github.com/dsherret/ts-morph/issues/453#issuecomment-667578386
      .getText(node, ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope)
    const defaultValue = (() => {
      let res = ''
      prop.getJsDocTags().find((tag) => {
        const match = ['defaultvalue', 'default'].includes(
          tag.getName().toLowerCase()
        )
        if (match) {
          res = ts.displayPartsToString(tag.getText())
          return true
        }
      })
      return res
    })()
    const optional = prop.isOptional()
    result.push({
      name,
      description,
      type,
      defaultValue,
      optional,
    })
  }
  return result
}

// an alternative way to implement handleTypeElementMembered
// iterate members at ast level
// not used. just for backup...
function handleTypeElementMembered2(
  node: TypeElementMemberedNode & Node,
  typeChecker: TypeChecker
): TsPropertyOrMethodInfo[] {
  const result: TsPropertyOrMethodInfo[] = []
  node.getMembers().forEach((member) => {
    if (Node.isPropertySignature(member) || Node.isMethodSignature(member)) {
      const memberSymbol = member.getSymbolOrThrow()

      const name = member.getName()

      // or use this to get description?
      // const description = ts.displayPartsToString(
      //   memberSymbol.compilerSymbol.getDocumentationComment(
      //     typeChecker.compilerObject
      //   )
      // )
      // My consideration: getJsDocs is newer than getDocumentationComment
      // and ts-morph docs recommend using getJsDocs:
      // https://github.com/dsherret/ts-morph/blob/cea07aa7759ecf5a1e9f90b628334b8bd617c624/docs/details/documentation.md#L59
      const description = member
        .getJsDocs()
        .map((jsDoc) => {
          return jsDoc.getDescription().trim()
        })
        .join('\n\n')

      const type = member.getType().getText()

      const defaultValue = (() => {
        let res = ''
        member.getJsDocs().find((jsDoc) =>
          jsDoc.getTags().find((tag) => {
            const match = ['defaultvalue', 'default'].includes(
              tag.getTagName().toLowerCase()
            )
            if (match) {
              res = tag.getCommentText() || ''
              return true
            }
          })
        )
        return res
      })()

      // or use member.hasQuestionToken()
      const optional = memberSymbol.isOptional()

      result.push({
        name,
        description,
        type,
        defaultValue,
        optional,
      })
    }
  })
  return result
}

/**
 * ref:
 *
 * https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
 *
 * https://stackoverflow.com/questions/59838013/how-can-i-use-the-ts-compiler-api-to-find-where-a-variable-was-defined-in-anothe
 *
 * https://stackoverflow.com/questions/60249275/typescript-compiler-api-generate-the-full-properties-arborescence-of-a-type-ide
 *
 * https://stackoverflow.com/questions/47429792/is-it-possible-to-get-comments-as-nodes-in-the-ast-using-the-typescript-compiler
 *
 * Instructions of learning ts compiler:
 * https://stackoverflow.com/a/58885450
 *
 * https://learning-notes.mistermicheels.com/javascript/typescript/compiler-api/
 */
