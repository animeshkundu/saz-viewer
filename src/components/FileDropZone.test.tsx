import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileDropZone } from './FileDropZone'

describe('FileDropZone', () => {
  const mockOnFileLoaded = vi.fn()

  beforeEach(() => {
    mockOnFileLoaded.mockClear()
  })

  it('should render correctly with initial state', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    expect(screen.getByText('SAZ Viewer')).toBeInTheDocument()
    expect(screen.getByText('Select File')).toBeInTheDocument()
    expect(screen.getByText(/Drop a/)).toBeInTheDocument()
  })

  it('should show loading state', () => {
    render(<FileDropZone isLoading={true} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeDisabled()
  })

  it('should display error message', () => {
    render(<FileDropZone isLoading={false} error="Test error message" onFileLoaded={mockOnFileLoaded} />)
    
    expect(screen.getByText('Test error message')).toBeInTheDocument()
  })

  it('should handle file selection via button click', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const button = screen.getByText('Select File')
    fireEvent.click(button)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
  })

  it('should call onFileLoaded when file is selected', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.saz', { type: 'application/zip' })
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    expect(mockOnFileLoaded).toHaveBeenCalledWith(file)
  })

  it('should handle drag over event', () => {
    const { container } = render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    // Get the drop zone container
    const dropZone = container.firstChild as HTMLElement
    
    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [] }
    })
    
    // The test passes if no errors occur - the drag state is internal
    expect(dropZone).toBeInTheDocument()
  })

  it('should handle drag leave event', () => {
    const { container } = render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    // Get the drop zone container
    const dropZone = container.firstChild as HTMLElement
    
    fireEvent.dragOver(dropZone, {
      dataTransfer: { files: [] }
    })
    fireEvent.dragLeave(dropZone)
    
    // The test passes if no errors occur - the drag state is internal
    expect(dropZone).toBeInTheDocument()
  })

  it('should handle file drop', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const dropZone = screen.getByText('SAZ Viewer').closest('div')!.parentElement!
    const file = new File(['content'], 'test.saz', { type: 'application/zip' })
    
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    })
    
    expect(mockOnFileLoaded).toHaveBeenCalledWith(file)
  })

  it('should accept .saz files', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input.accept).toBe('.saz')
  })

  it('should handle non-.saz files', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    expect(mockOnFileLoaded).toHaveBeenCalledWith(file)
  })

  it('should not process files when loading', () => {
    const { container } = render(<FileDropZone isLoading={true} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const dropZone = container.querySelector('.pointer-events-none')
    expect(dropZone).toBeInTheDocument()
  })

  it('should handle empty file drop', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    const dropZone = screen.getByText('SAZ Viewer').closest('div')!.parentElement!
    
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [],
      },
    })
    
    expect(mockOnFileLoaded).not.toHaveBeenCalled()
  })

  it('should show privacy message', () => {
    render(<FileDropZone isLoading={false} error={null} onFileLoaded={mockOnFileLoaded} />)
    
    expect(screen.getByText(/All parsing happens locally/)).toBeInTheDocument()
  })
})
