const { test, expect, beforeEach, describe } = require('@playwright/test')

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
    })
  })
})
