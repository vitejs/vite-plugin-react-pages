import { editFile, untilUpdated, isBuild, getColor } from '../../testUtils'

test('should hmr', async () => {
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
