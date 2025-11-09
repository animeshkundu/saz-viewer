import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { KeyboardShortcuts } from './KeyboardShortcuts'

describe('KeyboardShortcuts', () => {
  const mockOnNavigateUp = vi.fn()
  const mockOnNavigateDown = vi.fn()
  const mockOnOpenFile = vi.fn()

  beforeEach(() => {
    mockOnNavigateUp.mockClear()
    mockOnNavigateDown.mockClear()
    mockOnOpenFile.mockClear()
  })

  it('should call onNavigateUp when arrow up is pressed', () => {
    render(
      <KeyboardShortcuts
        onNavigateUp={mockOnNavigateUp}
        onNavigateDown={mockOnNavigateDown}
      />
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(event)

    expect(mockOnNavigateUp).toHaveBeenCalledTimes(1)
  })

  it('should call onNavigateDown when arrow down is pressed', () => {
    render(
      <KeyboardShortcuts
        onNavigateUp={mockOnNavigateUp}
        onNavigateDown={mockOnNavigateDown}
      />
    )

    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(event)

    expect(mockOnNavigateDown).toHaveBeenCalledTimes(1)
  })

  it('should call onOpenFile when cmd+o is pressed', () => {
    render(
      <KeyboardShortcuts
        onNavigateUp={mockOnNavigateUp}
        onNavigateDown={mockOnNavigateDown}
        onOpenFile={mockOnOpenFile}
      />
    )

    const event = new KeyboardEvent('keydown', { key: 'o', metaKey: true })
    window.dispatchEvent(event)

    expect(mockOnOpenFile).toHaveBeenCalledTimes(1)
  })

  it('should call onOpenFile when ctrl+o is pressed', () => {
    render(
      <KeyboardShortcuts
        onNavigateUp={mockOnNavigateUp}
        onNavigateDown={mockOnNavigateDown}
        onOpenFile={mockOnOpenFile}
      />
    )

    const event = new KeyboardEvent('keydown', { key: 'o', ctrlKey: true })
    window.dispatchEvent(event)

    expect(mockOnOpenFile).toHaveBeenCalledTimes(1)
  })

  it('should not call handlers when callback is not provided', () => {
    render(<KeyboardShortcuts />)

    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    const openEvent = new KeyboardEvent('keydown', { key: 'o', metaKey: true })

    expect(() => {
      window.dispatchEvent(upEvent)
      window.dispatchEvent(downEvent)
      window.dispatchEvent(openEvent)
    }).not.toThrow()
  })

  it('should clean up event listeners on unmount', () => {
    const { unmount } = render(
      <KeyboardShortcuts
        onNavigateUp={mockOnNavigateUp}
        onNavigateDown={mockOnNavigateDown}
      />
    )

    unmount()

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(event)

    expect(mockOnNavigateUp).not.toHaveBeenCalled()
  })

  it('should not call handlers for other keys', () => {
    render(
      <KeyboardShortcuts
        onNavigateUp={mockOnNavigateUp}
        onNavigateDown={mockOnNavigateDown}
        onOpenFile={mockOnOpenFile}
      />
    )

    const event = new KeyboardEvent('keydown', { key: 'a' })
    window.dispatchEvent(event)

    expect(mockOnNavigateUp).not.toHaveBeenCalled()
    expect(mockOnNavigateDown).not.toHaveBeenCalled()
    expect(mockOnOpenFile).not.toHaveBeenCalled()
  })

  it('should render nothing', () => {
    const { container } = render(<KeyboardShortcuts />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should update handlers when props change', () => {
    const { rerender } = render(
      <KeyboardShortcuts onNavigateUp={mockOnNavigateUp} />
    )

    const newMockOnNavigateUp = vi.fn()
    rerender(<KeyboardShortcuts onNavigateUp={newMockOnNavigateUp} />)

    const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(event)

    expect(newMockOnNavigateUp).toHaveBeenCalledTimes(1)
    expect(mockOnNavigateUp).not.toHaveBeenCalled()
  })
})
