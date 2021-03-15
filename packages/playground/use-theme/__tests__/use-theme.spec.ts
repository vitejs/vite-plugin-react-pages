import { editFile, untilUpdated, removeFile, getColor } from '../../testUtils'

test('should render theme pages', async () => {
  await page.waitForLoadState('networkidle')
  expect(await page.textContent('.page')).toBe('Index pageJump to page1')

  await Promise.all([
    page.click('text=Jump to page1'),
    page.waitForLoadState('networkidle'),
  ])
  expect(await page.textContent('.page')).toBe(
    'This is page1. This is a page defined with React component.'
  )

  await Promise.all([
    page.click('text=page4 title'),
    page.waitForLoadState('networkidle'),
  ])
  await page.waitForSelector('text=React Box')
  expect(await getColor('text=React Box')).toBe('blue')
})

test('static data hmr', async () => {
  await page.goto(viteTestUrl)
  const sideNav = await page.$('.vp-theme-aside-navigation .vp-theme-menu')

  expect(await sideNav.textContent()).toBe(
    'index page titlepage1 titlepage2 titlepage3 titlepage4 title'
  )
  // update static data
  editFile('pages/page1$.tsx', (code) =>
    code.replace('@title page1 title', '@title page1 updated title')
  )
  await untilUpdated(
    () => sideNav.textContent(),
    'index page titlepage1 updated titlepage2 titlepage3 titlepage4 title'
  )
  // put it before page1
  editFile('pages/page2$.md', (code) => code.replace('sort: 2', 'sort: 0.5'))
  await untilUpdated(
    () => sideNav.textContent(),
    'index page titlepage2 titlepage1 updated titlepage3 titlepage4 title'
  )

  // delete page2
  await removeFile('pages/page2$.md')
  await untilUpdated(
    () => sideNav.textContent(),
    'index page titlepage1 updated titlepage3 titlepage4 title'
  )
})
