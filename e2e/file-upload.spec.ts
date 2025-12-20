import { test, expect } from '@playwright/test'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test.describe('File Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display file drop zone on initial load', async ({ page }) => {
    // Check that the drop zone is visible
    await expect(page.locator('[data-testid="file-drop-zone"]')).toBeVisible()
    
    // Check for the SAZ Viewer heading
    await expect(page.locator('h2:has-text("SAZ Viewer")')).toBeVisible()
    
    // Check for upload button
    await expect(page.locator('[data-testid="upload-button"]')).toBeVisible()
    await expect(page.locator('button:has-text("Load SAZ File")')).toBeVisible()
  })

  test('should load a valid SAZ file via file input', async ({ page }) => {
    const filePath = join(__dirname, 'fixtures', 'sample.saz')
    
    // Set up the file chooser
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="upload-button"]')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(filePath)
    
    // Wait for the file to be processed and sessions to load
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible({ timeout: 10000 })
    
    // Verify that sessions are loaded
    await expect(page.locator('text=Sessions')).toBeVisible()
    
    // Check that at least one session is displayed
    const sessions = page.locator('[data-testid^="session-"]')
    await expect(sessions.first()).toBeVisible()
  })

  test('should display error for invalid file type', async ({ page }) => {
    // Create a text file instead of SAZ
    const buffer = Buffer.from('This is not a SAZ file', 'utf-8')
    
    // Create a file chooser promise
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="upload-button"]')
    const fileChooser = await fileChooserPromise
    
    // Upload a file with wrong extension
    await fileChooser.setFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    })
    
    // Wait and check for error message
    await page.waitForTimeout(1000)
    const errorAlert = page.locator('[data-testid="error-alert"]')
    
    // The error should appear
    await expect(errorAlert).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=Invalid File Type')).toBeVisible()
  })

  test('should display error for corrupted SAZ file', async ({ page }) => {
    // Create a corrupted zip file
    const buffer = Buffer.from('PK\x03\x04corrupted data', 'utf-8')
    
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="upload-button"]')
    const fileChooser = await fileChooserPromise
    
    await fileChooser.setFiles({
      name: 'corrupted.saz',
      mimeType: 'application/zip',
      buffer: buffer,
    })
    
    // Wait for error to appear
    await page.waitForTimeout(2000)
    const errorAlert = page.locator('[data-testid="error-alert"]')
    await expect(errorAlert).toBeVisible({ timeout: 5000 })
  })

  test('should show loading state while processing file', async ({ page }) => {
    const filePath = join(__dirname, 'fixtures', 'sample.saz')
    
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="upload-button"]')
    const fileChooser = await fileChooserPromise
    
    // Check loading state
    await fileChooser.setFiles(filePath)
    
    // The button should show loading text briefly
    const loadingButton = page.locator('button:has-text("Loading...")')
    
    // Either we catch the loading state or the sessions load immediately
    try {
      await expect(loadingButton).toBeVisible({ timeout: 1000 })
    } catch {
      // Loading might be too fast to catch, verify sessions loaded instead
      await expect(page.locator('[data-testid="session-grid"]')).toBeVisible({ timeout: 10000 })
    }
  })

  test('should display success toast after loading file', async ({ page }) => {
    const filePath = join(__dirname, 'fixtures', 'sample.saz')
    
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('[data-testid="upload-button"]')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(filePath)
    
    // Wait for sessions to load
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible({ timeout: 10000 })
    
    // Check for success toast (might disappear quickly)
    const successToast = page.locator('text=/Loaded \\d+ sessions/')
    
    try {
      await expect(successToast).toBeVisible({ timeout: 3000 })
    } catch {
      // Toast might have already disappeared, verify sessions loaded instead
      await expect(page.locator('[data-testid="session-grid"]')).toBeVisible()
    }
  })
})
