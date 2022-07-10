import { test, expect } from '~utils'

test('index page', async ({ page }) => {
  await page.pause()
  await expect(page.locator('.vp-local-sider')).toContainText(
    'index page title'
  )
  await expect(page.locator('.vp-local-header')).toContainText([
    'Vite Pages',
    'Guide',
    'Links',
    'Extra',
  ])
  await page.locator('text=Jump to page1').click()
  await page.waitForURL('/page1')
})