import { ElementHandle } from 'playwright-chromium'
import { editFile, untilUpdated, isBuild, getColor } from '../../testUtils'

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
