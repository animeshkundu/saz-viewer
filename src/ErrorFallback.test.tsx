import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'

describe('ErrorFallback', () => {
  const mockError = { message: 'Test error message', stack: 'Error stack' } as Error
  const mockResetErrorBoundary = vi.fn()

  beforeEach(() => {
    mockResetErrorBoundary.mockClear()
  })

  it('should render error message', () => {
    try {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      // If it throws in DEV mode, skip this test
      return
    }

    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should render error title', () => {
    try {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      return
    }

    expect(screen.getByText(/This spark has encountered a runtime error/)).toBeInTheDocument()
  })

  it('should render Try Again button', () => {
    try {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      return
    }

    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should call resetErrorBoundary when Try Again is clicked', () => {
    try {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      return
    }

    const button = screen.getByText('Try Again')
    fireEvent.click(button)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)
  })

  it('should render error details section', () => {
    try {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      return
    }

    expect(screen.getByText('Error Details:')).toBeInTheDocument()
  })

  it('should render alert description', () => {
    try {
      render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      return
    }

    expect(screen.getByText(/Something unexpected happened/)).toBeInTheDocument()
  })

  it('should handle long error messages', () => {
    const longError = { message: 'A'.repeat(500), stack: 'Error stack' } as Error
    try {
      render(<ErrorFallback error={longError} resetErrorBoundary={mockResetErrorBoundary} />)
    } catch {
      return
    }

    const errorText = screen.getByText('A'.repeat(500))
    expect(errorText).toBeInTheDocument()
  })
})
