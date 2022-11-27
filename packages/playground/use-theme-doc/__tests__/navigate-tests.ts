import { test as baseTest, expect, type Page } from '~utils'
import { userPages } from './snapshots'

// reuse test declaration
export function declareTests({
  javaScriptEnabled = true,
  test = baseTest,
}: {
  javaScriptEnabled?: boolean
  test?: typeof baseTest
} = {}) {
  test('test options', async ({ javaScriptEnabled: javaScriptEnabledOpt }) => {
    await expect(javaScriptEnabledOpt).toBe(javaScriptEnabled)
  })

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

    // test dynamic routes
    // (it doesn't work when javaScript is disabled)
    if (javaScriptEnabled !== false) {
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
    }
  })

  test('i18n', async ({ page }) => {
    await testIndexPageSider(page)
    await testHeader(page)

    // switch locale
    if (javaScriptEnabled) {
      await page
        .locator('.vp-local-header .vp-local-localeSelectorCtn button')
        .hover()
      await page.locator('.vp-antd-dropdown:visible >> text="中文"').click()
    } else {
      page.goto('/zh')
    }

    await page.waitForURL('/zh')
    testIndexPageSider(page, { currentLocale: '中文' })
    await testHeader(page, { currentLocale: '中文' })

    await page.locator('.vp-local-sider >> text="页面2标题"').click()

    await page.waitForURL('/zh/page2')
    testIndexPageSider(page, { currentLocale: '中文' })
    await testHeader(page, { currentLocale: '中文' })
    await expect(page.locator('.vp-local-content')).toContainText(
      '这是页面 2。'
    )

    await page.locator('.vp-local-content >> text="前往页面 1"').click()

    await page.waitForURL('/zh/page1')
    testIndexPageSider(page, { currentLocale: '中文' })
    await testHeader(page, { currentLocale: '中文' })
    await expect(page.locator('.vp-local-content')).toContainText('这是页面1。')

    // switch locale
    if (javaScriptEnabled) {
      await page
        .locator('.vp-local-header .vp-local-localeSelectorCtn button')
        .hover()
      await page.locator('.vp-antd-dropdown:visible >> text="English"').click()
    } else {
      page.goto('/page1')
    }

    await page.waitForURL('/page1')
    testIndexPageSider(page, { currentLocale: 'English' })
    await testHeader(page, { currentLocale: 'English' })
    await expect(page.locator('.vp-local-content')).toContainText(
      'This is page1.'
    )

    await page.locator('.vp-local-header >> text="Guide"').click()

    await page.waitForURL('/guide/introduce')
    // testGuideGroupSider(page, { currentLocale: 'English' })
    await testHeader(page, { currentLocale: 'English' })

    // switch locale
    if (javaScriptEnabled) {
      await page
        .locator('.vp-local-header .vp-local-localeSelectorCtn button')
        .hover()
      await page.locator('.vp-antd-dropdown:visible >> text="中文"').click()
      // translated page /zh/guide/introduce doesn't exists
      // so should navigate to index page of the selected locale
      await page.waitForURL('/zh')
    } else {
      await page.goto('/zh')
    }
  })

  async function testIndexPageSider(
    page: Page,
    { currentLocale = 'English' }: { currentLocale?: 'English' | '中文' } = {}
  ) {
    if (currentLocale === 'English') {
      await expect(page.locator('.vp-local-sider')).toContainText([
        'index page title',
        'resources',
        'sub-group',
        'page1 title',
        'page2 title',
      ])
    } else {
      await expect(page.locator('.vp-local-sider')).toContainText([
        '首页标题',
        '资源',
        '小分组',
        '页面1标题',
        '页面2标题',
      ])
    }
  }

  async function testHeader(
    page: Page,
    { currentLocale = 'English' }: { currentLocale?: 'English' | '中文' } = {}
  ) {
    if (currentLocale === 'English') {
      await expect(page.locator('.vp-local-header')).toContainText([
        'Vite Pages',
        'Guide',
        'Links',
        'Extra',
      ])
    } else {
      await expect(page.locator('.vp-local-header')).toContainText([
        'Vite Pages',
        '首页',
        '组件',
        '链接',
        'Extra',
      ])
    }

    // locale selector
    await expect(
      page.locator('.vp-local-header .vp-local-localeSelectorCtn')
      // antd 5.x injects inline <style> into DOM, which mess up with element.textContent
      // when disableJS=true
    ).toHaveText(currentLocale, { useInnerText: true })

    if (javaScriptEnabled !== false) {
      // hover menu only works when javaScriptEnabled===true
      // hover on header nav drop down menu
      await expect(
        page.locator('.vp-antd-menu-submenu-popup:visible')
      ).toHaveCount(0)
      if (currentLocale === 'English') {
        await page.locator('.vp-local-header >> text="Links"').hover()
      } else {
        await page.locator('.vp-local-header >> text="链接"').hover()
      }
      await expect(
        page.locator('.vp-antd-menu-submenu-popup:visible')
      ).toHaveCount(1)
      if (currentLocale === 'English') {
        await expect(
          page.locator('.vp-antd-menu-submenu-popup:visible')
        ).toContainText(['Resources', 'Vite', 'Ant Design'])
      } else {
        await expect(
          page.locator('.vp-antd-menu-submenu-popup:visible')
        ).toContainText(['资源', 'Vite', 'Ant Design'])
      }
      await page.locator('body').hover({
        position: {
          x: 0,
          y: 0,
        },
      })
      await expect(
        page.locator('.vp-antd-menu-submenu-popup:visible')
      ).toHaveCount(0)

      // hover on locale selector
      await expect(page.locator('.vp-antd-dropdown:visible')).toHaveCount(0)
      await page
        .locator('.vp-local-header .vp-local-localeSelectorCtn button')
        .hover()
      await expect(page.locator('.vp-antd-dropdown:visible')).toHaveCount(1)
      await expect(page.locator('.vp-antd-dropdown:visible')).toContainText([
        '中文',
        'English',
      ])
      await page.locator('body').hover({
        position: {
          x: 0,
          y: 0,
        },
      })
      await expect(page.locator('.vp-antd-dropdown:visible')).toHaveCount(0)
    }
  }
}
