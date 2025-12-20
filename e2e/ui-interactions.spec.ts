import { test, expect } from '@playwright/test'
import { join } from 'path'

test.describe('UI Interactions', () => {
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

  test('should display Load New File button after file is loaded', async ({ page }) => {
    // Check that the Load New File button is visible
    await expect(page.locator('[data-testid="load-new-file-button"]')).toBeVisible()
    await expect(page.locator('button:has-text("Load New File")')).toBeVisible()
  })

  test('should reset to file drop zone when Load New File is clicked', async ({ page }) => {
    // Click Load New File button
    await page.click('[data-testid="load-new-file-button"]')
    await page.waitForTimeout(500)
    
    // Should go back to the drop zone
    await expect(page.locator('[data-testid="file-drop-zone"]')).toBeVisible()
    
    // Session grid should no longer be visible
    await expect(page.locator('[data-testid="session-grid"]')).not.toBeVisible()
  })

  test('should display SAZ Viewer header with logo', async ({ page }) => {
    // Check for header with SAZ logo
    await expect(page.locator('text=SAZ').first()).toBeVisible()
    await expect(page.locator('h1:has-text("SAZ Viewer")')).toBeVisible()
  })

  test('should have resizable panels', async ({ page }) => {
    // Check for resizable panel handles
    // The app uses ResizableHandle components
    const handles = page.locator('[role="separator"]')
    const count = await handles.count()
    
    // Should have at least 2 handles (horizontal and vertical splits)
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should maintain three-panel layout', async ({ page }) => {
    // Verify the layout structure
    // Session list on left, request on top right, response on bottom right
    
    // Session grid should be visible
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible()
    
    // Both request and response panels visible
    await expect(page.locator('text=Request').first()).toBeVisible()
    await expect(page.locator('text=Response').first()).toBeVisible()
  })

  test('should handle window resize gracefully', async ({ page }) => {
    // Resize the viewport
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.waitForTimeout(500)
    
    // Panels should still be visible
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible()
    await expect(page.locator('text=Request').first()).toBeVisible()
    await expect(page.locator('text=Response').first()).toBeVisible()
    
    // Try smaller viewport
    await page.setViewportSize({ width: 800, height: 600 })
    await page.waitForTimeout(500)
    
    // Core elements should still be accessible
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible()
  })

  test('should have functional search box in session grid', async ({ page }) => {
    // Find the search input
    const searchInput = page.locator('input[placeholder="Search..."]')
    await expect(searchInput).toBeVisible()
    
    // Type in search
    await searchInput.fill('api')
    
    // Search should filter sessions
    const sessions = page.locator('[data-testid^="session-"]')
    const count = await sessions.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have method filter dropdown', async ({ page }) => {
    // Look for method filter button
    const filterButton = page.locator('button:has-text("Method:")')
    await expect(filterButton).toBeVisible()
    
    // Click to open dropdown
    await filterButton.click()
    await page.waitForTimeout(500)
    
    // Check for method options
    await expect(page.locator('text=GET').first()).toBeVisible()
  })

  test('should filter sessions by method', async ({ page }) => {
    // Open method filter
    await page.click('button:has-text("Method:")')
    await page.waitForTimeout(500)
    
    // Select POST method
    const postOption = page.locator('text=POST').last()
    await postOption.click()
    await page.waitForTimeout(500)
    
    // Should show only POST requests
    const sessions = page.locator('[data-testid^="session-"]')
    const count = await sessions.count()
    
    // We have at least one POST request in sample data
    expect(count).toBeGreaterThan(0)
  })

  test('should support keyboard shortcuts for navigation', async ({ page }) => {
    // First session should be active
    await expect(page.locator('[data-testid="session-1"]')).toHaveAttribute('data-active', 'true')
    
    // Press arrow down to navigate
    await page.keyboard.press('ArrowDown')
    await page.waitForTimeout(500)
    
    // Second session should be active
    await expect(page.locator('[data-testid="session-2"]')).toHaveAttribute('data-active', 'true')
    
    // Press arrow up to go back
    await page.keyboard.press('ArrowUp')
    await page.waitForTimeout(500)
    
    // First session should be active again
    await expect(page.locator('[data-testid="session-1"]')).toHaveAttribute('data-active', 'true')
  })

  test('should have scrollable session list', async ({ page }) => {
    // Session grid should have scroll area
    const sessionGrid = page.locator('[data-testid="session-grid"]')
    await expect(sessionGrid).toBeVisible()
    
    // Check if sessions are in a scrollable container
    const scrollArea = sessionGrid.locator('[data-radix-scroll-area-viewport]')
    
    if (await scrollArea.count() > 0) {
      await expect(scrollArea.first()).toBeVisible()
    }
  })

  test('should show session count in header', async ({ page }) => {
    // Session count should be displayed
    await expect(page.locator('text=/Sessions \\(\\d+\\)/')).toBeVisible()
  })

  test('should load and display all UI components correctly', async ({ page }) => {
    // Comprehensive check of all major UI components
    
    // Header
    await expect(page.locator('h1:has-text("SAZ Viewer")')).toBeVisible()
    
    // Load New File button
    await expect(page.locator('[data-testid="load-new-file-button"]')).toBeVisible()
    
    // Session grid
    await expect(page.locator('[data-testid="session-grid"]')).toBeVisible()
    
    // Search box
    await expect(page.locator('input[placeholder="Search..."]')).toBeVisible()
    
    // Method filter
    await expect(page.locator('button:has-text("Method:")')).toBeVisible()
    
    // Inspector panels
    await expect(page.locator('text=Request').first()).toBeVisible()
    await expect(page.locator('text=Response').first()).toBeVisible()
    
    // At least one session
    await expect(page.locator('[data-testid^="session-"]').first()).toBeVisible()
  })

  test('should handle rapid session switching', async ({ page }) => {
    // Rapidly switch between sessions
    await page.click('[data-testid="session-1"]')
    await page.waitForTimeout(200)
    
    await page.click('[data-testid="session-2"]')
    await page.waitForTimeout(200)
    
    await page.click('[data-testid="session-3"]')
    await page.waitForTimeout(200)
    
    // Session 3 should be active
    await expect(page.locator('[data-testid="session-3"]')).toHaveAttribute('data-active', 'true')
    
    // Inspector should show session 3 details
    await expect(page.locator('text=DELETE').first()).toBeVisible()
  })

  test('should clear search when search box is cleared', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="Search..."]')
    
    // Type in search
    await searchInput.fill('users/1')
    await page.waitForTimeout(500)
    
    // Get session count with filter
    const filteredCount = await page.locator('[data-testid^="session-"]').count()
    
    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(500)
    
    // Get session count without filter
    const unfilteredCount = await page.locator('[data-testid^="session-"]').count()
    
    // Should show more sessions when filter is cleared
    expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount)
  })
})
