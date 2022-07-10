import { test, expect, type Page } from '~utils'
import { userPages } from './snapshots'

test('index page', async ({ page }) => {
  await testIndexPageSider(page)
  await testHeader(page)
  await expect(page.locator('.vp-local-content')).toContainText([
    'Index page',
    'Jump to page1',
  ])
})

test('navigate', async ({ page }) => {
  await page.locator('text=Jump to page1').click()
  await page.waitForURL('/page1')
  await testIndexPageSider(page)
  await testHeader(page)
  await expect(page.locator('.vp-local-content')).toContainText(
    'This is page1.'
  )

  await page.locator('.vp-local-sider >> text="page2 title"').click()
  await page.waitForURL('/page2')
  await testIndexPageSider(page)
  await testHeader(page)
  await expect(page.locator('.vp-local-content')).toContainText(
    'This is page2.'
  )

  await page.locator('.vp-local-header >> text="Users"').click()
  await page.waitForURL('/users')
  await testHeader(page)
  await expect(page.locator('.vp-local-sider')).toBeHidden()

  await expect(page.locator('.vp-local-content a')).toHaveCount(6)
  // click over each user page and verify it
  let i = 0
  const len = await page.locator('.vp-local-content a').count()
  while (i < len) {
    await Promise.all([
      page.waitForNavigation(),
      page.locator('.vp-local-content a').nth(i).click(),
    ])
    await expect(page.locator('.vp-local-content')).toContainText(
      userPages[i].split('\n')
    )
    i++
    await page.goBack()
  }
})

async function testIndexPageSider(page: Page) {
  await expect(page.locator('.vp-local-sider')).toContainText([
    'index page title',
    'resources',
    'sub-group',
    'page1 title',
    'page2 title',
  ])
}

async function testHeader(page: Page) {
  await expect(page.locator('.vp-local-header')).toContainText([
    'Vite Pages',
    'Guide',
    'Links',
    'Extra',
  ])
  // hover on header drop down menu
  await expect(page.locator('.vp-antd-menu-submenu-popup:visible')).toHaveCount(
    0
  )
  await page.locator('.vp-local-header >> text="Links"').hover()
  await expect(page.locator('.vp-antd-menu-submenu-popup:visible')).toHaveCount(
    1
  )
  await expect(
    page.locator('.vp-antd-menu-submenu-popup:visible')
  ).toContainText(['Resources', 'Vite', 'Ant Design'])
  await page.locator('body').hover({
    position: {
      x: 0,
      y: 0,
    },
  })
  await expect(page.locator('.vp-antd-menu-submenu-popup:visible')).toHaveCount(
    0
  )
}
