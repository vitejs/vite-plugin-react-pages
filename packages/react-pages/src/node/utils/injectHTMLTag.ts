const bodyInjectRE = /<\/body>/
export function injectHTMLTag(html: string, tagHtml: string) {
  if (bodyInjectRE.test(html)) {
    return html.replace(bodyInjectRE, `${tagHtml}\n$&`)
  }
  // if no body, append
  return html + `\n` + tagHtml
}
