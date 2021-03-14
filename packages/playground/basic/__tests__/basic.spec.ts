import { ElementHandle } from 'playwright-chromium'
import { editFile, untilUpdated, isBuild, getColor } from '../../testUtils'

test('should render pages', async () => {
  await untilUpdated(() => page.textContent('#root'), 'IndexPage')

  await page.goto(viteTestUrl + '/page1')
  await untilUpdated(() => page.textContent('.page'), 'Page1')
  expect(await getColor('.page')).toBe('blue')

  await page.goto(viteTestUrl + '/page2')
  await untilUpdated(() => page.textContent('.page'), 'Page2')
  expect(await getColor('.page')).toBe('blue')

  await page.goto(viteTestUrl + '/dir/page3')
  const el: ElementHandle = await page.waitForSelector(
    `text="Markdown is intended to be as easy-to-read and easy-to-write as is feasible."`
  )
  expect(await el.evaluate((node: Element) => node.tagName)).toBe('P')

  await page.goto(viteTestUrl + '/users/abc')
  await page.waitForSelector(`text="User Main Page"`)
  expect(await page.textContent('#root')).toMatch('User Main PageuserId: abc')

  await page.goto(viteTestUrl + '/users/123/posts/456')
  await page.waitForSelector(`text="User Post Page"`)
  expect(await page.textContent('#root')).toMatch(
    'User Post PageuserId: 123postId: 456'
  )
})

test('hmr', async () => {
  await untilUpdated(() => page.textContent('#root'), 'IndexPage')
  editFile('pages/index$.tsx', (code) =>
    code.replace(`<div>IndexPage</div>`, `<div>hmr works!</div>`)
  )
  await untilUpdated(() => page.textContent('#root'), 'hmr works!')

  await page.goto(viteTestUrl + '/page1')
  await untilUpdated(() => page.textContent('.page'), 'Page1')
  const el = await page.$('.page')
  await untilUpdated(() => getColor(el), 'blue')
  editFile('pages/style.scss', (code) => code.replace(`color: blue`, `color: red`))
  await untilUpdated(() => getColor(el), 'red')
})
