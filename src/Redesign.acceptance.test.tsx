import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import JSZip from 'jszip'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => null,
}))

const reviewSessions = [
  { method: 'GET', statusCode: 200, statusText: 'OK' },
  { method: 'POST', statusCode: 201, statusText: 'Created' },
  { method: 'PUT', statusCode: 301, statusText: 'Moved Permanently' },
  { method: 'DELETE', statusCode: 404, statusText: 'Not Found' },
  { method: 'PATCH', statusCode: 429, statusText: 'Too Many Requests' },
  { method: 'CONNECT', statusCode: 500, statusText: 'Internal Server Error' },
]

async function createReviewArchive(): Promise<File> {
  const zip = new JSZip()

  reviewSessions.forEach(({ method, statusCode, statusText }, index) => {
    const id = index + 1
    const path = `/v2/exchanges/${id}`
    const responseBody = JSON.stringify({ id, status: statusCode })

    zip.file(
      `raw/${id}_c.txt`,
      `${method} ${path} HTTP/1.1\r\nHost: api.example.dev\r\nAccept: application/json\r\n\r\n`
    )
    zip.file(
      `raw/${id}_s.txt`,
      `HTTP/1.1 ${statusCode} ${statusText}\r\nContent-Type: application/json\r\nContent-Length: ${responseBody.length}\r\n\r\n${responseBody}`
    )
  })

  const archive = await zip.generateAsync({ type: 'blob' })
  return new File([archive], 'network-review.saz', { type: 'application/zip' })
}

async function uploadArchive(file: File): Promise<void> {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement

  Object.defineProperty(input, 'files', {
    value: [file],
    configurable: true,
  })
  fireEvent.change(input)

  await screen.findByTestId('session-grid')
}

describe('redesign acceptance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('presents a bold, privacy-first landing workflow', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Follow every request\.\s*Keep the evidence local\./i,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('100% local workspace')).toBeInTheDocument()
    expect(screen.getByText('Zero uploads')).toBeInTheDocument()
    expect(screen.getByText('Instant parsing')).toBeInTheDocument()
    expect(screen.getByText('Deep inspection')).toBeInTheDocument()
    expect(screen.getByTestId('file-drop-zone')).toHaveAttribute(
      'aria-label',
      'Choose or drop a SAZ file'
    )
    expect(screen.getByTestId('upload-button')).toHaveTextContent('Load SAZ File')
    expect(screen.getByText(/Private by architecture, not policy/i)).toBeInTheDocument()
  })

  it('opens an archive in the dense three-pane network observatory', async () => {
    render(<App />)
    await uploadArchive(await createReviewArchive())

    expect(screen.getByRole('heading', { level: 1, name: 'SAZ Viewer' })).toBeInTheDocument()
    expect(screen.getByText('network-review.saz')).toBeInTheDocument()
    expect(screen.getByText('6 captured exchanges')).toBeInTheDocument()
    expect(screen.getByText('2 success')).toBeInTheDocument()
    expect(screen.getByText('1 redirect')).toBeInTheDocument()
    expect(screen.getByText('3 failed')).toBeInTheDocument()
    expect(screen.getByTestId('inspector-request')).toBeInTheDocument()
    expect(screen.getByTestId('inspector-response')).toBeInTheDocument()
    expect(screen.getAllByRole('separator')).toHaveLength(2)
    expect(screen.getByTestId('session-1')).toHaveAttribute('data-active', 'true')
    expect(screen.getByRole('textbox', { name: 'Search sessions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Method: All/i })).toBeInTheDocument()
    expect(screen.getByText('Local-only session')).toBeInTheDocument()

    const jsonTabs = screen.getAllByRole('tab', { name: 'JSON' })
    await waitFor(() => {
      expect(jsonTabs.every((tab) => tab.getAttribute('data-state') === 'active')).toBe(true)
    })
  })
})
