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
  testMethod(param: string): void
  /** test required property */
  testRequired: boolean
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
  testMethod(param: string): void
  /** test required property */
  testRequired: boolean
}

/**
 * Description of SomeComplexType ...
 */
export type SomeComplexType = 0 | 1 | 'a' | 'b' | { key: string }
