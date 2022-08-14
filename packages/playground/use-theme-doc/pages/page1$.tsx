/**
 * @title page1 title
 * @subGroup sub-group
 */

import React from 'react'
import s from './page1.module.css'
import { useIntl } from './themeConfig/i18n'

const Page = () => {
  const intl = useIntl()
  return <p className={'page ' + s.box}>{intl['page.page1.content']}</p>
}

export default Page
