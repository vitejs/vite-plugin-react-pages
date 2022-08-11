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

test.fixme('hmr: edit file (js static data notation)', async ({
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

test.fixme('hmr: edit file (md static data notation)', async ({
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

test.fixme('hmr: delete file, add file', async ({ page, fsUtils }) => {
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
