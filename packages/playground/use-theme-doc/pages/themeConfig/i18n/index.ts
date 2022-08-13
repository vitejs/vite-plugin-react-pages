import { useThemeCtx } from '../../themeDev'
import { messages as zh } from './zh'
import { messages as en } from './en'

export type MessagesType = typeof en

// you can use any i18n library here, such as react-intl

export function useIntl(): MessagesType {
  const {
    resolvedLocale: { localeKey },
  } = useThemeCtx()
  if (localeKey === 'zh') return zh
  return en
}
