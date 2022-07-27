export function withClsPrefix(cls: string) {
  return `vp-theme-${cls}`
}

export function removeStartSlash(s: string) {
  return s.replace(/^\//, '')
}

export function removeTrailingSlash(s: string) {
  return s.replace(/\/$/, '')
}

export function ensureStartSlash(s: string) {
  return '/' + removeStartSlash(s)
}
