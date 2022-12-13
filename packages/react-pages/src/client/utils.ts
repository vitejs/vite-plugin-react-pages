import { useLayoutEffect, useEffect } from 'react'

export const isSSR = import.meta.env.SSR

// fix warning of useLayoutEffect during ssr
// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
export const useIsomorphicLayoutEffect = isSSR ? useEffect : useLayoutEffect
