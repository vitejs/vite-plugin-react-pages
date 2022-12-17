import { createTheme } from 'vite-pages-theme-doc'

export default createTheme({
  topNavs: [
    { label: 'index', path: '/' },
    { label: 'sub-path', path: '/sub-path', activeIfMatch: '/sub-path' },
    { label: 'Vite', href: 'https://github.com/vitejs/vite' },
    {
      label: 'Vite Pages',
      href: 'https://github.com/vitejs/vite-plugin-react-pages',
    },
  ],
  logo: 'Vite Pages',
})
