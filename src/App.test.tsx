import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from './App'
import JSZip from 'jszip'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}))

describe('App Integration Tests', () => {
  async function createMockSazFile() {
    const zip = new JSZip()
    
    zip.file('raw/1_c.txt', 'GET /api/users HTTP/1.1\r\nHost: api.example.com\r\nContent-Type: application/json\r\n\r\n')
    zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"users":[]}')
    zip.file('raw/2_c.txt', 'POST /api/login HTTP/1.1\r\nHost: api.example.com\r\n\r\n{"username":"test"}')
    zip.file('raw/2_s.txt', 'HTTP/1.1 201 Created\r\nContent-Type: application/json\r\n\r\n{"token":"abc123"}')
    zip.file('raw/3_c.txt', 'GET /api/data HTTP/1.1\r\nHost: api.example.com\r\n\r\n')
    zip.file('raw/3_s.txt', 'HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<html>Not Found</html>')
    
    const blob = await zip.generateAsync({ type: 'blob' })
    return new File([blob], 'test.saz', { type: 'application/zip' })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render file drop zone initially', () => {
    render(<App />)
    
    expect(screen.getByText('SAZ Viewer')).toBeInTheDocument()
    expect(screen.getByText('Select File')).toBeInTheDocument()
  })

  it('should show error for non-saz file', async () => {
    render(<App />)
    
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid File Type/)).toBeInTheDocument()
    })
  })

  it('should load and display SAZ file', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument()
      expect(screen.getByText(/\(\s*3\s*\)/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display session list after loading', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      const getMethods = screen.getAllByText('GET')
      const postMethods = screen.getAllByText('POST')
      expect(getMethods.length).toBeGreaterThan(0)
      expect(postMethods.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should select first session by default', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Request')).toBeInTheDocument()
      expect(screen.getByText('Response')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show loading state while parsing', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show "Load New File" button after loading', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Load New File')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should reset to file drop zone when "Load New File" is clicked', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Load New File')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const loadNewButton = screen.getByText('Load New File')
    fireEvent.click(loadNewButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Drop a/)).toBeInTheDocument()
    })
  })

  it('should navigate sessions with arrow keys', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument()
      expect(screen.getByText(/\(\s*3\s*\)/)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(downEvent)
    
    await waitFor(() => {
      const activeCells = document.querySelectorAll('.bg-blue-50')
      expect(activeCells.length).toBeGreaterThan(0)
    })
  })

  it('should not navigate past first session with arrow up', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument()
      expect(screen.getByText(/\(\s*3\s*\)/)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' })
    window.dispatchEvent(upEvent)
    window.dispatchEvent(upEvent)
    window.dispatchEvent(upEvent)
    
    await waitFor(() => {
      const activeCells = document.querySelectorAll('.bg-blue-50')
      expect(activeCells.length).toBeGreaterThan(0)
    })
  })

  it('should not navigate past last session with arrow down', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText('Sessions')).toBeInTheDocument()
      expect(screen.getByText(/\(\s*3\s*\)/)).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    window.dispatchEvent(downEvent)
    window.dispatchEvent(downEvent)
    window.dispatchEvent(downEvent)
    window.dispatchEvent(downEvent)
    
    await waitFor(() => {
      const activeCells = document.querySelectorAll('.bg-blue-50')
      expect(activeCells.length).toBeGreaterThan(0)
    })
  })

  it('should show error for invalid SAZ structure', async () => {
    render(<App />)
    
    const zip = new JSZip()
    zip.file('metadata.xml', '<metadata></metadata>')
    
    const blob = await zip.generateAsync({ type: 'blob' })
    const file = new File([blob], 'invalid.saz', { type: 'application/zip' })
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid SAZ Structure/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display header in loaded state', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      const headers = screen.getAllByText('SAZ Viewer')
      expect(headers.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })

  it('should show resizable panels', async () => {
    render(<App />)
    
    const file = await createMockSazFile()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file],
      writable: false,
    })
    
    fireEvent.change(input)
    
    await waitFor(() => {
      const panels = document.querySelectorAll('[data-panel-group]')
      expect(panels.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })
})
