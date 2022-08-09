import React from 'react'
import { useIntl } from './themeConfig/i18n'

interface Props {}

const Component: React.FC<Props> = (props) => {
  const intl = useIntl()
  return <div>{intl['page.resources.content']}</div>
}

export default Component
