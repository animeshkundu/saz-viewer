import { Page, expect } from '@playwright/test'
import { join } from 'path'

/**
 * Upload a file to the file drop zone
 */
export async function uploadFile(page: Page, fileName: string) {
  const filePath = join(__dirname, '..', 'fixtures', fileName)
  
  // Set up the file chooser handler
  const fileChooserPromise = page.waitForEvent('filechooser')
  
  // Click the drop zone to trigger file chooser
  await page.click('[data-testid="file-drop-zone"]', { timeout: 10000 })
  
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(filePath)
  
  // Wait for the file to be processed
  await page.waitForTimeout(1000)
}

/**
 * Upload a file using drag and drop simulation
 */
export async function uploadFileDragDrop(page: Page, fileName: string) {
  const filePath = join(__dirname, '..', 'fixtures', fileName)
  
  // Read the file
  const { readFileSync } = await import('fs')
  const buffer = readFileSync(filePath)
  const dataTransfer = await page.evaluateHandle((data) => {
    const dt = new DataTransfer()
    const file = new File([new Uint8Array(data)], 'sample.saz', {
      type: 'application/x-zip-compressed',
    })
    dt.items.add(file)
    return dt
  }, Array.from(buffer))
  
  // Dispatch drop event
  await page.dispatchEvent('[data-testid="file-drop-zone"]', 'drop', { dataTransfer })
  
  // Wait for the file to be processed
  await page.waitForTimeout(1000)
}

/**
 * Wait for sessions to load
 */
export async function waitForSessionsToLoad(page: Page) {
  await expect(page.locator('[data-testid="session-grid"]')).toBeVisible({ timeout: 10000 })
}

/**
 * Select a session by ID
 */
export async function selectSession(page: Page, sessionId: string) {
  await page.click(`[data-testid="session-${sessionId}"]`)
  await page.waitForTimeout(500)
}

/**
 * Get the active session ID
 */
export async function getActiveSessionId(page: Page): Promise<string | null> {
  const activeSession = page.locator('[data-testid^="session-"][data-active="true"]')
  const count = await activeSession.count()
  
  if (count === 0) {
    return null
  }
  
  const testId = await activeSession.getAttribute('data-testid')
  return testId ? testId.replace('session-', '') : null
}

/**
 * Check if inspector panel shows request details
 */
export async function verifyRequestDetails(page: Page, expectedUrl: string) {
  await expect(page.locator('text=Request')).toBeVisible()
  await expect(page.locator(`text="${expectedUrl}"`).first()).toBeVisible()
}

/**
 * Check if inspector panel shows response details
 */
export async function verifyResponseDetails(page: Page, expectedStatus: number) {
  await expect(page.locator('text=Response')).toBeVisible()
  await expect(page.locator(`text="${expectedStatus}"`).first()).toBeVisible()
}

/**
 * Navigate using keyboard
 */
export async function navigateWithKeyboard(page: Page, key: 'ArrowUp' | 'ArrowDown') {
  await page.keyboard.press(key)
  await page.waitForTimeout(300)
}

/**
 * Click "Load New File" button
 */
export async function clickLoadNewFile(page: Page) {
  await page.click('button:has-text("Load New File")')
  await page.waitForTimeout(500)
}
