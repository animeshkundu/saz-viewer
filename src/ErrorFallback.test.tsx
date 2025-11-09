import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message')
  const mockResetErrorBoundary = vi.fn()

  beforeEach(() => {
    mockResetErrorBoundary.mockClear()
  })

  it('should render error message', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText('Test error message')).toBeInTheDocument()

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })

  it('should render error title', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText(/This spark has encountered a runtime error/)).toBeInTheDocument()

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })

  it('should render Try Again button', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText('Try Again')).toBeInTheDocument()

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })

  it('should call resetErrorBoundary when Try Again is clicked', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    const button = screen.getByText('Try Again')
    fireEvent.click(button)

    expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1)

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })

  it('should render error details section', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText('Error Details:')).toBeInTheDocument()

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })

  it('should render alert description', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    render(<ErrorFallback error={mockError} resetErrorBoundary={mockResetErrorBoundary} />)

    expect(screen.getByText(/Something unexpected happened/)).toBeInTheDocument()

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })

  it('should handle long error messages', () => {
    const originalEnv = import.meta.env.DEV
    Object.defineProperty(import.meta.env, 'DEV', { value: false, writable: true })

    const longError = new Error('A'.repeat(500))
    render(<ErrorFallback error={longError} resetErrorBoundary={mockResetErrorBoundary} />)

    const errorText = screen.getByText('A'.repeat(500))
    expect(errorText).toBeInTheDocument()

    Object.defineProperty(import.meta.env, 'DEV', { value: originalEnv, writable: true })
  })
})
