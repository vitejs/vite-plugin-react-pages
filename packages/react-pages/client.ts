// This module can be imported by theme, which may be optimized by vite
// so this module must be optimizable too.
// should not contains "import initialPages from '/@react-pages/pages'",
// otherwise vite will throw error when optimizing theme: Could not resolve "/@react-pages/pages"

// users can import { useStaticData } from "vite-plugin-react-pages/client"

export type { Theme } from './clientTypes'
// we don't use ./_state_declaration because vite-plugin-react-pages/_state_declaration is an entry of vite optimization
export { useStaticData } from 'vite-plugin-react-pages/_state_declaration'
