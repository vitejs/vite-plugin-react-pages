export type MyImportedTypeAlias = { b: string }
/**
 * Comment for MyImportedInterface...
 */
export type ReExportedInterface = {
  /** Comment for MyImportedInterface.prop1 */
  prop1: MyImportedTypeAlias
}
