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
})
