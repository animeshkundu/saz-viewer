import { test, expect } from '@playwright/test'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test.describe('Session Navigation', () => {
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

  test('should display session list with all sessions', async ({ page }) => {
    // Check that the session grid is visible
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible()
    
    // Check that we have multiple sessions
    const sessions = page.locator('[data-testid^="session-"]')
    const count = await sessions.count()
    expect(count).toBeGreaterThan(0)
    
    // Verify session count in header
    await expect(page.locator('text=/Sessions \\(\\d+\\)/')).toBeVisible()
  })

  test('should select first session by default', async ({ page }) => {
    // First session should be active
    const firstSession = page.locator('[data-testid="session-1"]')
    await expect(firstSession).toHaveAttribute('data-active', 'true')
    
    // Request panel should be visible
    await expect(page.locator('text=Request')).toBeVisible()
    await expect(page.locator('text=Response')).toBeVisible()
  })

  test('should select a session when clicked', async ({ page }) => {
    // Click on session 2
    await page.click('[data-testid="session-2"]')
    await page.waitForTimeout(500)
    
    // Session 2 should be active
    const session2 = page.locator('[data-testid="session-2"]')
    await expect(session2).toHaveAttribute('data-active', 'true')
    
    // Verify request details for session 2 (POST request)
    await expect(page.getByText('POST')).toBeVisible()
  })

  test('should navigate to next session with arrow down key', async ({ page }) => {
    // First session should be active
    await expect(page.locator('[data-testid="session-1"]')).toHaveAttribute('data-active', 'true')
    
    // Press arrow down
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(500)
    
    // Second session should now be active
    await expect(page.locator('[data-testid="session-2"]')).toHaveAttribute('data-active', 'true')
  })

  test('should navigate to previous session with arrow up key', async ({ page }) => {
    // Click on session 2 first
    await page.click('[data-testid="session-2"]')
    await page.waitForTimeout(500)
    await expect(page.locator('[data-testid="session-2"]')).toHaveAttribute('data-active', 'true')
    
    // Press arrow up
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(500)
    
    // First session should now be active
    await expect(page.locator('[data-testid="session-1"]')).toHaveAttribute('data-active', 'true')
  })

  test('should not navigate past first session with arrow up', async ({ page }) => {
    // First session is already active
    await expect(page.locator('[data-testid="session-1"]')).toHaveAttribute('data-active', 'true')
    
    // Press arrow up multiple times
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(500)
    
    // First session should still be active
    await expect(page.locator('[data-testid="session-1"]')).toHaveAttribute('data-active', 'true')
  })

  test('should not navigate past last session with arrow down', async ({ page }) => {
    // Find the last session by getting all visible session rows  
    const sessions = page.locator('[data-testid^="session-"]')
    await sessions.first().waitFor({ state: 'visible' })
    
    const count = await sessions.count()
    
    // Get all session IDs to find the actual last one
    const sessionIds: number[] = []
    for (let i = 0; i < count; i++) {
      const element = sessions.nth(i)
      const testId = await element.getAttribute('data-testid')
      if (testId && testId.startsWith('session-')) {
        const id = parseInt(testId.replace('session-', ''), 10)
        if (!isNaN(id)) {
          sessionIds.push(id)
        }
      }
    }
    
    // If we couldn't parse IDs, default to count
    const lastSessionId = sessionIds.length > 0 
      ? Math.max(...sessionIds).toString() 
      : count.toString()
    
    // Wait for and click the last session
    const lastSessionSelector = `[data-testid="session-${lastSessionId}"]`
    await page.waitForSelector(lastSessionSelector, { state: 'visible' })
    await page.click(lastSessionSelector)
    await page.waitForTimeout(500)
    
    // Verify it's active
    await expect(page.locator(lastSessionSelector)).toHaveAttribute('data-active', 'true')
    
    // Press arrow down multiple times
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(500)
    
    // Last session should still be active
    await expect(page.locator(lastSessionSelector)).toHaveAttribute('data-active', 'true')
  })

  test('should highlight active session visually', async ({ page }) => {
    // Click on session 2
    await page.click('[data-testid="session-2"]')
    await page.waitForTimeout(500)
    
    // Session 2 should have active styling
    const session2 = page.locator('[data-testid="session-2"]')
    await expect(session2).toHaveClass(/bg-blue-50/)
  })

  test('should filter sessions by search term', async ({ page }) => {
    // Type in search box
    const searchInput = page.locator('input[placeholder="Search..."]')
    await searchInput.fill('/api/users/1')
    await page.waitForTimeout(500)
    
    // Should show only matching sessions
    const visibleSessions = page.locator('[data-testid^="session-"]')
    const count = await visibleSessions.count()
    
    // We expect fewer sessions after filtering
    expect(count).toBeLessThanOrEqual(4)
  })

  test('should display session details (ID, status, method, URL)', async ({ page }) => {
    // Check that session rows display all required information
    const session1 = page.locator('[data-testid="session-1"]')
    
    // Should have session ID (1)
    await expect(session1.locator('text=1').first()).toBeVisible()
    
    // Should have status code (200)
    await expect(session1.locator('text=200')).toBeVisible()
    
    // Should have method (GET)
    await expect(session1.locator('text=GET')).toBeVisible()
    
    // Should have URL
    await expect(session1.getByText('/api/', { exact: false })).toBeVisible()
  })

  test('should show correct status code colors', async ({ page }) => {
    // Session 1 should have 200 status (success - green/emerald)
    const session1Status = page.locator('[data-testid="session-1"] td:has-text("200")')
    await expect(session1Status).toHaveClass(/text-emerald/)
    
    // Session 4 should have 404 status (error - red)
    const session4 = page.locator('[data-testid="session-4"]')
    if (await session4.count() > 0) {
      const session4Status = page.locator('[data-testid="session-4"] td').filter({ hasText: '404' })
      await expect(session4Status.first()).toHaveClass(/text-red/)
    }
  })
})
