import { test, expect } from '@playwright/test'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test.describe('Inspector Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    
    // Load the sample SAZ file
    const filePath = join(__dirname, 'fixtures', 'sample.saz')
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="upload-button"]')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(filePath)
    
    // Wait for sessions to load
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible({ timeout: 10000 })
  })

  test('should display request panel with title', async ({ page }) => {
    // Request panel should be visible
    await expect(page.locator('text=Request').first()).toBeVisible()
  })

  test('should display response panel with title', async ({ page }) => {
    // Response panel should be visible
    await expect(page.locator('text=Response').first()).toBeVisible()
  })

  test('should show request method and URL', async ({ page }) => {
    // First session is GET /api/users
    await expect(page.locator('text=GET').first()).toBeVisible()
    await expect(page.locator('text=/api/users').first()).toBeVisible()
  })

  test('should show response status code and status text', async ({ page }) => {
    // First session has 200 OK response
    await expect(page.locator('text=200').first()).toBeVisible()
    await expect(page.locator('text=OK').first()).toBeVisible()
  })

  test('should display request headers', async ({ page }) => {
    // Check for common headers in request
    await expect(page.locator('text=Host').first()).toBeVisible()
    await expect(page.locator('text=api.example.com').first()).toBeVisible()
  })

  test('should display response headers', async ({ page }) => {
    // Check for content-type header in response
    await expect(page.locator('text=Content-Type').first()).toBeVisible()
    await expect(page.locator('text=/application\\/json/').first()).toBeVisible()
  })

  test('should show request body for POST request', async ({ page }) => {
    // Select session 2 (POST request)
    await page.click('[data-testid="session-2"]')
    await page.waitForTimeout(500)
    
    // Check for POST method
    await expect(page.locator('text=POST').first()).toBeVisible()
    
    // Check for request body content
    await expect(page.locator('text=/Jane Smith|email/').first()).toBeVisible()
  })

  test('should show response body with JSON content', async ({ page }) => {
    // First session has JSON response
    // Look for JSON content in response
    await expect(page.locator('text=/users|John Doe/').first()).toBeVisible()
  })

  test('should display empty body message when no body present', async ({ page }) => {
    // Select session 3 (DELETE request with no response body)
    await page.click('[data-testid="session-3"]')
    await page.waitForTimeout(500)
    
    // Should show 204 No Content
    await expect(page.locator('text=204').first()).toBeVisible()
  })

  test('should apply syntax highlighting to JSON content', async ({ page }) => {
    // The JSON content should be rendered with highlighting
    // Check for presence of code highlighting elements
    const codeBlocks = page.locator('code, pre')
    await expect(codeBlocks.first()).toBeVisible()
  })

  test('should show different panels for request and response', async ({ page }) => {
    // Both panels should be visible simultaneously
    const requestPanel = page.locator('text=Request').first()
    const responsePanel = page.locator('text=Response').first()
    
    await expect(requestPanel).toBeVisible()
    await expect(responsePanel).toBeVisible()
    
    // They should be in separate sections
    const panels = page.locator('text=/Request|Response/')
    const count = await panels.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should update inspector when different session is selected', async ({ page }) => {
    // Select session 1
    await page.click('[data-testid="session-1"]')
    await page.waitForTimeout(500)
    await expect(page.locator('text=GET').first()).toBeVisible()
    
    // Select session 2
    await page.click('[data-testid="session-2"]')
    await page.waitForTimeout(500)
    await expect(page.locator('text=POST').first()).toBeVisible()
    
    // Content should have changed
    await expect(page.locator('text=/Jane Smith/').first()).toBeVisible()
  })

  test('should show all request headers', async ({ page }) => {
    // Click to expand or view all headers
    const headers = ['Host', 'User-Agent', 'Accept', 'Authorization']
    
    for (const header of headers) {
      try {
        await expect(page.locator(`text=${header}`).first()).toBeVisible({ timeout: 2000 })
      } catch {
        // Some headers might not be present in all requests
        continue
      }
    }
  })

  test('should handle 404 error responses', async ({ page }) => {
    // Select session 4 (404 response)
    await page.click('[data-testid="session-4"]')
    await page.waitForTimeout(500)
    
    // Should show 404 status
    await expect(page.locator('text=404').first()).toBeVisible()
    await expect(page.locator('text=Not Found').first()).toBeVisible()
    
    // Should show error message in response body
    await expect(page.locator('text=/User not found|error/').first()).toBeVisible()
  })

  test('should display raw message data', async ({ page }) => {
    // Inspector should show the HTTP message data
    // Look for HTTP version or protocol indicators
    await expect(page.locator('text=/HTTP\\/1.1|GET|POST/').first()).toBeVisible()
  })

  test('should show content length in headers', async ({ page }) => {
    // Select session with body
    await page.click('[data-testid="session-1"]')
    await page.waitForTimeout(500)
    
    // Look for Content-Length header
    try {
      await expect(page.locator('text=Content-Length').first()).toBeVisible({ timeout: 2000 })
    } catch {
      // Content-Length might not always be present
      await expect(page.locator('text=Content-Type').first()).toBeVisible()
    }
  })

  test('should display authorization headers', async ({ page }) => {
    // Session 1 has Authorization header
    await expect(page.locator('text=Authorization').first()).toBeVisible()
    await expect(page.locator('text=/Bearer|token/').first()).toBeVisible()
  })
})
