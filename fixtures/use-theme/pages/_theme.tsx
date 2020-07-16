import { createTheme } from 'vite-pages-theme-basic'

export default createTheme({
  topNavs: [
    { text: 'index', path: '/' },
    { text: 'not-found-page', path: '/asd' },
    { text: 'React', href: 'https://reactjs.org/' },
    { text: 'Vite', href: 'https://github.com/vitejs/vite' },
  ],
  logo: 'Vite Pages',
})
