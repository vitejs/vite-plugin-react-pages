type NavData =
  | {
      text: string
      href: string
    }
  | {
      text: string
      path: string
    }

const NavData: NavData[] = [{ text: 'React', href: 'https://reactjs.org/' }]

export default NavData
