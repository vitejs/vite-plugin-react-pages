import postcss from 'postcss'

export const postcssSelectorReplace = postcss.plugin(
  'postcss-css-selector-replace',
  function (transform) {
    return function (css) {
      css.walkRules(function (rule) {
        const newSelectors = rule.selectors.map((selector) => {
          const res = transform(selector)
          if (res) return res
          return selector
        })
        rule.selectors = newSelectors
      })
    }
  }
)
