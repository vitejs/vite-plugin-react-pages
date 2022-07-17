declare module '*.module.css'

declare module 'virtual:ssrUtils' {
  export function runBeforeSSR(cb: (ctx: any) => void): void
}
