import type { MyImportedTypeAlias } from './typesUtils'
export type { ReExportedInterface } from './typesUtils'
export type MyExportedTypeAlias = { a: number }
type MyTypeAlias = { a: number }
export interface MyExportedInterface {
  a: number
}
interface MyInterface {
  a: number
}

/**
 * This is the description of the Button component's props
 */
export interface ButtonProps<TestGenerics extends string> extends Base {
  /**
   * the type of button
   * @defaultValue 'default'
   */
  type?: 'primary' | 'default' | 'text'
  /**
   * the size of button
   * @defaultValue 'middle'
   */
  size?: 'large' | 'middle' | 'small' | TestGenerics
  /**
   * loading state of button
   * @defaultValue false
   */
  loading?: boolean
  /**
   * click handler
   */
  onClick?: (event: React.MouseEvent) => void
  /** test method declaration */
  testMethod(param: MyExportedTypeAlias): MyTypeAlias
  /** test required property */
  testRequired: boolean
  myExportedTypeAlias: MyExportedTypeAlias
  myTypeAlias: MyTypeAlias
  myExportedInterface: MyExportedInterface
  myInterface: MyInterface
  myImportedTypeAlias: MyImportedTypeAlias
  /** test call signatures */
  (options?: { ignorePending?: true }): Array<string | Promise<string>>
  (options: { ignorePending: false }): string[]
  /** test construct signatures */
  new (options: string): MyInterface
  new (): MyInterface
}

interface Base {
  /**
   * children content
   */
  children: React.ReactNode
}

export type SomeObjectLiteralType<TestGenerics> = {
  /**
   * the type of button
   * @defaultValue 'default'
   */
  type?: 'primary' | 'default' | 'text'
  /**
   * the size of button
   * @defaultValue 'middle'
   */
  size?: 'large' | 'middle' | 'small' | TestGenerics
  /**
   * loading state of button
   * @defaultValue false
   */
  loading?: boolean
  /**
   * click handler
   */
  onClick?: (event: React.MouseEvent) => void
  /** test method declaration */
  testMethod(param: MyInterface): MyExportedInterface
  /** test required property */
  testRequired: boolean
  myExportedTypeAlias: MyExportedTypeAlias
  myTypeAlias: MyTypeAlias
  myExportedInterface: MyExportedInterface
  myInterface: MyInterface
  myImportedTypeAlias: MyImportedTypeAlias
  /** test call signatures */
  (options?: { ignorePending?: true }): Array<string | Promise<string>>
  (options: { ignorePending: false }): string[]
  /** test construct signatures */
  new (options: string): MyInterface
  new (): MyInterface
}

/**
 * Description of SomeComplexType ...
 */
export type SomeComplexType = 0 | 1 | 'a' | 'b' | { key: string }
