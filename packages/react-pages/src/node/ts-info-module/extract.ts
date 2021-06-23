import * as ts from 'typescript'

import { TsInterfaceInfo, TsInterfacePropertyInfo } from '../../../clientTypes'

const defaultTsConfig: ts.CompilerOptions = {
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
}

export function collectInterfaceInfo(
  fileName: string,
  exportName: string,
  options: ts.CompilerOptions = defaultTsConfig
): TsInterfaceInfo {
  // Build a program using the set of root file names in fileNames
  let program = ts.createProgram([fileName], options)
  // Get the checker, we will use it to find more about classes
  let checker = program.getTypeChecker()

  const sourceFile = program.getSourceFile(fileName)!

  const [interfaceName, ...heritageNames] = exportName.split(':')

  // inspired by
  // https://github.com/microsoft/rushstack/blob/6ca0cba723ad8428e6e099f12715ce799f29a73f/apps/api-extractor/src/analyzer/ExportAnalyzer.ts#L702
  // and https://stackoverflow.com/a/58885450
  const fileSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!fileSymbol || !fileSymbol.exports) {
    throw new Error(`unexpected fileSymbol`)
  }
  const escapedExportName = ts.escapeLeadingUnderscores(interfaceName)
  const exportSymbol = fileSymbol.exports.get(escapedExportName)
  if (!exportSymbol) {
    throw new Error(`Named export ${interfaceName} is not found in file`)
  }
  const sourceDeclareSymbol = getAliasedSymbolIfNecessary(exportSymbol)
  const sourceDeclare = sourceDeclareSymbol.declarations?.[0]
  if (!sourceDeclare || !ts.isInterfaceDeclaration(sourceDeclare)) {
    throw new Error(`Can't find sourceDeclare for ${interfaceName}`)
  }

  const interfaceInfo = collectInterfaceInfo(sourceDeclare, sourceDeclareSymbol)

  if (heritageNames && heritageNames.length > 0) {
    const heritage = [...findHeritage(sourceDeclare)]
    const heritageToInclude =
      heritageNames[0] === '*'
        ? heritage
        : heritage.filter((x) => heritageNames.includes(x.name.text))

    heritageToInclude.forEach((decl) => {
      const { properties } = collectInterfaceInfo(decl)
      interfaceInfo.properties = [...interfaceInfo.properties, ...properties]
    })
  }

  return interfaceInfo

  function getAliasedSymbolIfNecessary(symbol: ts.Symbol) {
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0)
      return checker.getAliasedSymbol(symbol)
    return symbol
  }

  function collectInterfaceInfo(
    node: ts.InterfaceDeclaration,
    symbol?: ts.Symbol
  ): TsInterfaceInfo {
    const propertiesInfo: TsInterfacePropertyInfo[] = []

    for (const member of node.members) {
      if (ts.isPropertySignature(member) || ts.isMethodSignature(member)) {
        const name = member.name.getText()
        const type = member.type ? typeInfo(member.type) : ''
        const symbol = checker.getSymbolAtLocation(member.name)

        if (symbol) {
          const commentText =
            getComment(member, member.getSourceFile().getFullText()) ?? ''
          const description = ts.displayPartsToString(
            symbol.getDocumentationComment(checker)
          )
          const optional = !!(symbol.getFlags() & ts.SymbolFlags.Optional)

          // get defaultValue from jsDocTags
          const jsDocTags = symbol.getJsDocTags()
          const defaultValueTag = jsDocTags.find(
            (t) => t.name === 'defaultValue' || 'default'
          )
          const defaultValue = defaultValueTag?.text?.[0].text

          propertiesInfo.push({
            name: name,
            // commentText,
            type,
            description,
            defaultValue,
            optional,
            // fullText: member.getFullText(),
          })
        }
      }
    }

    const name = node.name.getText()
    const commentText =
      getComment(node, node.getSourceFile().getFullText()) ?? ''
    const description = symbol
      ? ts.displayPartsToString(symbol.getDocumentationComment(checker))
      : ''

    return {
      name,
      // commentText,
      description,
      properties: propertiesInfo,
      // fullText: node.getFullText(),
    }
  }

  function findHeritage(
    node: ts.InterfaceDeclaration
  ): Set<ts.InterfaceDeclaration> {
    const heritage = new Set<ts.InterfaceDeclaration>()
    const heritageTypes = node.heritageClauses?.[0]?.types ?? []

    for (const p of heritageTypes) {
      if (ts.isExpressionWithTypeArguments(p)) {
        var e = p.expression
        if (ts.isIdentifier(e)) {
          const t = checker.getTypeAtLocation(e)
          const d = t.symbol.declarations?.[0]
          if (d && ts.isInterfaceDeclaration(d)) {
            heritage.add(d)
            findHeritage(d).forEach((x) => heritage.add(d))
          }
        }
      }
    }

    return heritage
  }

  function typeInfo(node: ts.TypeNode): string {
    if (isLiteralsOnly(node)) {
      if (ts.isLiteralTypeNode(node)) return node.getText()
      if (ts.isTypeLiteralNode(node)) return objectString(node.members)
      if (ts.isUnionTypeNode(node)) return node.types.map(typeInfo).join(' | ')
      if (ts.isIntersectionTypeNode(node)) {
        return node.types.map(typeInfo).join(' & ')
      }
      if (ts.isTypeReferenceNode(node)) {
        var t = checker.getTypeAtLocation(node)
        var s = t.aliasSymbol || t.symbol
        var d = s?.declarations?.[0]
        if (d) {
          if (ts.isTypeAliasDeclaration(d)) return typeInfo(d.type)
          if (ts.isInterfaceDeclaration(d)) return objectString(d.members)
        }
      }
    }
    return node.getFullText()
  }

  function isKeyword(kind: ts.SyntaxKind): boolean {
    return (
      ts.SyntaxKind.FirstKeyword <= kind && kind <= ts.SyntaxKind.LastKeyword
    )
  }

  function isLiteralsOnly(node: ts.TypeNode): boolean {
    if (isKeyword(node.kind)) return true
    if (ts.isLiteralTypeNode(node)) return true
    if (ts.isTypeLiteralNode(node)) {
      return node.members.every(
        (m) => ts.isPropertySignature(m) && m.type && isLiteralsOnly(m.type)
      )
    }
    if (ts.isUnionTypeNode(node) || ts.isIntersectionTypeNode(node)) {
      return node.types.every(isLiteralsOnly)
    }
    if (ts.isTypeReferenceNode(node)) {
      var t = checker.getTypeAtLocation(node)
      var s = t.aliasSymbol || t.symbol
      var d = s?.declarations?.[0]
      if (d && ts.isTypeAliasDeclaration(d)) {
        return isLiteralsOnly(d.type)
      }
      if (d && ts.isInterfaceDeclaration(d)) {
        return d.members.every(
          (m) => ts.isPropertySignature(m) && m.type && isLiteralsOnly(m.type)
        )
      }
    }
    return false
  }

  function objectString(members: ts.NodeArray<ts.TypeElement>): string {
    const body = members
      .filter((m) => ts.isPropertySignature(m))
      .map((m) => {
        const p = m as ts.PropertySignature
        const n = p.name.getText()
        const t = p.type && typeInfo(p.type)
        return `${n}: ${t}`
      })
      .join(', ')

    return `{ ${body} }`
  }

  /** True if this is visible outside this file, false otherwise */
  function isNodeExported(node: ts.Node): boolean {
    return (
      (ts.getCombinedModifierFlags(node as ts.Declaration) &
        ts.ModifierFlags.Export) !==
        0 &&
      !!node.parent &&
      node.parent.kind === ts.SyntaxKind.SourceFile
    )
  }
}

function getJSDocCommentRanges(
  node: ts.Node,
  text: string
): ts.CommentRange[] | undefined {
  // Compiler internal:
  // https://github.com/microsoft/TypeScript/blob/66ecfcbd04b8234855a673adb85e5cff3f8458d4/src/compiler/utilities.ts#L1202
  return (ts as any).getJSDocCommentRanges.apply(ts, arguments)
}

function getComment(declaration: ts.Declaration, sourceFileFullText: string) {
  const ranges = getJSDocCommentRanges(declaration, sourceFileFullText)
  if (!ranges || !ranges.length) return
  const range = ranges[ranges.length - 1]
  if (!range) return
  const text = sourceFileFullText.slice(range.pos, range.end)
  return text
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
