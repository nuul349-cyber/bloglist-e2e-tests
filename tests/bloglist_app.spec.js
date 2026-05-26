const { test, expect, beforeEach, describe } = require('@playwright/test')

const createBlog = async (content, page) => {
  await page.getByRole('button', { name: 'New note'}).click()
  await page.getByLabel('title').fill(content.title)
  await page.getByLabel('author').fill(content.author)
  await page.getByLabel('url').fill(content.url)

  await page.getByRole('button', { name: 'send'}).click()

  await page.getByText(`${content.title} by`).waitFor()

}

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users/', {
      data: {
        name: 'Admin',
        username: 'admin',
        password: 'passw'
      }
    })

    await request.post('/api/users/', {
      data: {
        name: 'Admin2',
        username: 'admin2',
        password: 'passw'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByLabel('username').fill('admin')
      await page.getByLabel('password').fill('passw')
      await page.getByRole('button', { name:'login' }).click()

      await expect(page.getByText('Admin logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await page.getByLabel('username').fill('admin')
      await page.getByLabel('password').fill('wrongpassw')
      await page.getByRole('button', { name:'login' }).click()

      await expect(page.getByText('wrong credentials')).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByLabel('username').fill('admin')
      await page.getByLabel('password').fill('passw')
      await page.getByRole('button', { name:'login' }).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name:'New note' }).click()

      await page.getByLabel('title').fill('Test Note Title')
      await page.getByLabel('author').fill('TestAuthor')
      await page.getByLabel('url').fill('TestURL.com')
      await page.getByRole('button', { name:'send' }).click()

      await expect(page.getByText('Test Note Title by TestAuthor')).toBeVisible()
    })

    describe('With a note', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name:'New note' }).click()

        await page.getByLabel('title').fill('Test Note Title')
        await page.getByLabel('author').fill('TestAuthor')
        await page.getByLabel('url').fill('TestURL.com')

        await page.getByRole('button', { name:'send' }).click()
      })

      test('Note can be liked', async ({ page }) => {
        await page.getByRole('button', { name:'view' }).click()
        await page.getByRole('button', { name:'like' }).click()
        await expect(page.getByText('Likes: 1')).toBeVisible()
      })

      test('Can delete blog', async ({ page }) => {
        page.on('dialog', dialog => dialog.accept());

        await page.getByRole('button', { name:'view' }).click()
        await page.getByRole('button', { name:'delete' }).click()

        await expect(page.getByText('Test Note Title succesfully deleted')).toBeVisible()
      })

      test('Can\'t delete blog if not the owner of the blog', async ({ page }) => {
        await page.getByRole('button', { name: 'Log out' }).click()

        await page.getByLabel('username').fill('admin2')
        await page.getByLabel('password').fill('passw')
        await page.getByRole('button', { name: 'login'}).click()

        await page.getByRole('button', { name: 'view'}).click()
        await expect(page.getByRole('button', { name:'delete' })).not.toBeVisible()
      })

      test('Blogs are arranged by likes', async ({ page }) => {
        await createBlog({
          title: 'Title1',
          author: 'Author 1',
          url: 'url1.com'
        }, page)

        await createBlog({
          title: 'Title2',
          author: 'Author 2',
          url: 'url2.com'
        }, page)

        await page.getByRole('button', { name: 'view' }).nth(1).click()
        await page.getByRole('button', { name: 'like' }).click()

        await page.getByText('Likes: 1').waitFor()
        await expect(page.locator('.blogs > div').first()).toContainText('Title1')
      })
    })
  })
})
