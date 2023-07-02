import { test, expect } from '~utils'

test.skip(
  ({ vitePagesMode }) => vitePagesMode !== 'serve',
  'hmr tests run in serve mode only!'
)

test('hmr: edit file (js)', async ({ page, fsUtils, testPlayground }) => {
  // edit js content
  await expect(page.locator('text="Jump to page1"')).toHaveCount(1)
  await expect(page.locator('text="Modified content!"')).toHaveCount(0)
  fsUtils.editFile('pages/$.tsx', (str) => {
    return str.replace('Jump to page1', 'Modified content!')
  })
  await expect(page.locator('text="Jump to page1"')).toHaveCount(0)
  await expect(page.locator('text="Modified content!"')).toHaveCount(1)
  await testPlayground.restore()
  await expect(page.locator('text="Jump to page1"')).toHaveCount(1)
  await expect(page.locator('text="Modified content!"')).toHaveCount(0)
})

test('hmr: edit file (js static data notation)', async ({
  page,
  fsUtils,
  testPlayground,
}) => {
  await expect(
    page.locator('.vp-local-sider >> text="index page title"')
  ).toHaveCount(1)
  await expect(
    page.locator('.vp-local-sider >> text="modified title"')
  ).toHaveCount(0)
  fsUtils.editFile('pages/$.tsx', (str) => {
    return str.replace('@title index page title', '@title modified title')
  })
  await expect(
    page.locator('.vp-local-sider >> text="index page title"')
  ).toHaveCount(0)
  await expect(
    page.locator('.vp-local-sider >> text="modified title"')
  ).toHaveCount(1)
  await testPlayground.restore()
  await expect(
    page.locator('.vp-local-sider >> text="index page title"')
  ).toHaveCount(1)
  await expect(
    page.locator('.vp-local-sider >> text="modified title"')
  ).toHaveCount(0)
})

test('hmr: edit file (md static data notation)', async ({
  page,
  fsUtils,
  testPlayground,
}) => {
  await expect(
    page.locator('.vp-local-sider >> text="page2 title"')
  ).toHaveCount(1)
  await expect(
    page.locator('.vp-local-sider >> text="modified title"')
  ).toHaveCount(0)
  fsUtils.editFile('pages/page2$.md', (str) => {
    return str.replace('title: page2 title', 'title: modified title')
  })
  await expect(
    page.locator('.vp-local-sider >> text="page2 title"')
  ).toHaveCount(0)
  await expect(
    page.locator('.vp-local-sider >> text="modified title"')
  ).toHaveCount(1)
  await testPlayground.restore()
  await expect(
    page.locator('.vp-local-sider >> text="page2 title"')
  ).toHaveCount(1)
  await expect(
    page.locator('.vp-local-sider >> text="modified title"')
  ).toHaveCount(0)
})

test('hmr: edit md file content', async ({ page, fsUtils, testPlayground }) => {
  // prepare locators first
  const headingBeforeEdit = page
    .locator('.markdown-body')
    .getByRole('heading', { name: 'Heading one', exact: true })
  const headingAfterEdit = page
    .locator('.markdown-body')
    .getByRole('heading', { name: 'Heading edited', exact: true })
  // Also check the table-of-content
  const outlineLinkBeforeEdit = page
    .locator('.vp-local-outline')
    .getByRole('link', { name: 'Heading one', exact: true })
  const outlineLinkAfterEdit = page
    .locator('.vp-local-outline')
    .getByRole('link', { name: 'Heading edited', exact: true })
  const counter = page.locator('.markdown-body').getByTestId('counter')
  const counterStateText = counter.locator('span')
  const counterButton = counter.getByRole('button', { name: 'add count' })

  page.locator('.vp-local-sider >> text="Markdown Test Page1"').click()
  await page.waitForURL('/md-test1')

  // initial state
  await expect(headingBeforeEdit).toHaveCount(1)
  await expect(headingAfterEdit).toHaveCount(0)
  await expect(outlineLinkBeforeEdit).toHaveCount(1)
  await expect(outlineLinkAfterEdit).toHaveCount(0)
  // update component state
  await expect(counterStateText).toHaveText('Counter component: 0.')
  await counterButton.click()
  await expect(counterStateText).toHaveText('Counter component: 1.')

  fsUtils.editFile('pages/md-test1$.md', (str) => {
    return str.replace('# Heading one', '# Heading edited')
  })

  await expect(headingBeforeEdit).toHaveCount(0)
  await expect(headingAfterEdit).toHaveCount(1)
  await expect(outlineLinkBeforeEdit).toHaveCount(0)
  await expect(outlineLinkAfterEdit).toHaveCount(1)
  await expect(counterStateText).toHaveText('Counter component: 1.')

  await testPlayground.restore()

  await expect(headingBeforeEdit).toHaveCount(1)
  await expect(headingAfterEdit).toHaveCount(0)
  await expect(outlineLinkBeforeEdit).toHaveCount(1)
  await expect(outlineLinkAfterEdit).toHaveCount(0)
  await expect(counterStateText).toHaveText('Counter component: 1.')
})

test('hmr: delete file, add file', async ({ page, fsUtils }) => {
  const page2FileContent = fsUtils.readFile('pages/page2$.md')
  await expect(
    page.locator('.vp-local-sider >> text="page2 title"')
  ).toHaveCount(1)
  // delete file
  fsUtils.removeFile('pages/page2$.md')
  await expect(
    page.locator('.vp-local-sider >> text="page2 title"')
  ).toHaveCount(0)
  // re-add file
  fsUtils.addFile('pages/page2$.md', page2FileContent)
  await expect(
    page.locator('.vp-local-sider >> text="page2 title"')
  ).toHaveCount(1)
})
