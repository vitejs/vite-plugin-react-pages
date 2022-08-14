import { useThemeCtx } from '../../themeDev'
import { messages as zh } from './zh'
import { messages as en } from './en'

export type MessagesType = typeof en

/**
 * In a more complex app, you can use i18n library like `react-intl`
 * to make a React Component support multiple languages
 */
export function useIntl(): MessagesType {
  const {
    resolvedLocale: { localeKey },
  } = useThemeCtx()
  if (localeKey === 'zh') return zh
  return en
}
