/**
 * 这是Button组件的props的描述
 */
export interface ButtonProps<TestGenerics extends string> {
  /**
   * button的类型
   * @defaultValue 'default'
   */
  type?: 'primary' | 'default' | 'text'
  /**
   * button的大小
   * @defaultValue 'middle'
   */
  size?: 'large' | 'middle' | 'small' | TestGenerics
  /**
   * button的加载中状态
   * @defaultValue false
   */
  loading?: boolean
  /**
   * 点击事件回调
   */
  onClick?: (event: React.MouseEvent) => void
  /**
   * button的内容
   */
  children: React.ReactNode
}
