import ts from 'typescript'

import {
  TsInterfaceInfo,
  TsInterfacePropertyInfo,
} from '../../../../clientTypes'

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

  // inspired by
  // https://github.com/microsoft/rushstack/blob/6ca0cba723ad8428e6e099f12715ce799f29a73f/apps/api-extractor/src/analyzer/ExportAnalyzer.ts#L702
  // and https://stackoverflow.com/a/58885450
  const fileSymbol = checker.getSymbolAtLocation(sourceFile)
  if (!fileSymbol || !fileSymbol.exports) {
    throw new Error(`unexpected fileSymbol`)
  }
  const escapedExportName = ts.escapeLeadingUnderscores(exportName)
  const exportSymbol = fileSymbol.exports.get(escapedExportName)
  if (!exportSymbol) {
    throw new Error(`Named export ${exportName} is not found in file`)
  }
  const sourceDeclareSymbol = getAliasedSymbolIfNecessary(exportSymbol)
  const sourceDeclare = sourceDeclareSymbol.declarations?.[0]
  if (!sourceDeclare) {
    throw new Error(`Can't find sourceDeclare for ${exportName}`)
  }
  const interfaceInfo = collectInterfaceInfo(sourceDeclare, sourceDeclareSymbol)
  return interfaceInfo

  function getAliasedSymbolIfNecessary(symbol: ts.Symbol) {
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0)
      return checker.getAliasedSymbol(symbol)
    return symbol
  }

  function collectInterfaceInfo(node: ts.Declaration, symbol: ts.Symbol) {
    if (!ts.isInterfaceDeclaration(node))
      throw new Error(`target is not an InterfaceDeclaration`)

    const type = checker.getTypeAtLocation(node)
    if (!symbol) throw new Error(`can't find symbol`)

    const name = node.name.getText()
    const commentText =
      getComment(node, node.getSourceFile().getFullText()) ?? ''
    const description = ts.displayPartsToString(
      symbol.getDocumentationComment(checker)
    )

    const propertiesInfo: TsInterfacePropertyInfo[] = []

    // extract property info
    symbol.members?.forEach((symbol) => {
      const name = symbol.name
      const declaration = symbol.valueDeclaration
      if (
        !(
          declaration &&
          (ts.isPropertySignature(declaration) ||
            ts.isMethodSignature(declaration))
        )
      ) {
        // known member in interface symbol
        // that we don't handle
        if (symbol.getFlags() & ts.SymbolFlags.TypeParameter) return
        console.warn(
          `unexpected declaration type in interface. name: ${name}, kind: ${
            ts.SyntaxKind[declaration?.kind as any]
          }`
        )
        return
      }
      const commentText =
        getComment(declaration, declaration.getSourceFile().getFullText()) ?? ''
      const typeText = declaration.type?.getFullText() ?? ''
      const description = ts.displayPartsToString(
        symbol.getDocumentationComment(checker)
      )

      const isOptional = !!(symbol.getFlags() & ts.SymbolFlags.Optional)
      // get defaultValue from jsDocTags
      const jsDocTags = symbol.getJsDocTags()
      const defaultValueTag = jsDocTags.find(
        (t) => t.name === 'defaultValue' || 'default'
      )
      const defaultValue = defaultValueTag?.text?.[0].text

      propertiesInfo.push({
        name,
        // commentText,
        type: typeText,
        description,
        defaultValue,
        optional: isOptional,
        // fullText: declaration.getFullText(),
      })
    })

    const interfaceInfo: TsInterfaceInfo = {
      name,
      // commentText,
      description,
      properties: propertiesInfo,
      // fullText: node.getFullText(),
    }

    return interfaceInfo
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
