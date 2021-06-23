type Variant = 'primary' | 'default' | 'text'

type Dimension = {
  w?: number
  h?: number
}

interface Location {
  x?: number
  y?: number
}

interface AsProp {
  as?: string
}

interface BaseProps {
  xy?: Location
  wh?: Dimension
}

/**
 * This is the description of the Button component's props
 */
export interface ButtonProps extends BaseProps, AsProp {
  /**
   * the type of button
   * @defaultValue 'default'
   */
  type?: Variant | 'link'
  /**
   * the size of button
   * @defaultValue 'middle'
   */
  size?: 'large' | 'middle' | 'small'
  /**
   * loading state of button
   * @defaultValue false
   */
  loading?: boolean
  /**
   * click handler
   */
  onClick?: (event: React.MouseEvent) => void
  /**
   * button content
   */
  children: React.ReactNode
}
