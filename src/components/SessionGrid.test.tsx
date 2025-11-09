import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionGrid } from './SessionGrid'
import type { Session } from '@/lib/types'

describe('SessionGrid', () => {
  let mockSessions: Map<string, Session>
  let mockSessionOrder: string[]
  const mockOnSessionSelected = vi.fn()

  beforeEach(() => {
    mockOnSessionSelected.mockClear()
    
    mockSessions = new Map([
      ['1', createMockSession('1', 'GET', '/api/users', 200)],
      ['2', createMockSession('2', 'POST', '/api/login', 201)],
      ['3', createMockSession('3', 'GET', '/api/data', 404)],
      ['4', createMockSession('4', 'DELETE', '/api/users/1', 500)],
    ])
    
    mockSessionOrder = ['1', '2', '3', '4']
  })

  function createMockSession(
    id: string,
    method: string,
    url: string,
    statusCode: number
  ): Session {
    return {
      id,
      method,
      url: `https://example.com${url}`,
      rawClient: `${method} ${url} HTTP/1.1\r\nHost: example.com\r\n\r\n`,
      rawServer: `HTTP/1.1 ${statusCode} OK\r\n\r\n`,
      request: {
        startLine: `${method} ${url} HTTP/1.1`,
        method,
        url,
        httpVersion: 'HTTP/1.1',
        headers: new Map([['host', 'example.com']]),
        rawBody: '',
        bodyAsArrayBuffer: new ArrayBuffer(0),
      },
      response: {
        startLine: `HTTP/1.1 ${statusCode} OK`,
        httpVersion: 'HTTP/1.1',
        statusCode,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        rawBody: '',
        bodyAsArrayBuffer: new ArrayBuffer(0),
      },
    }
  }

  it('should render session list', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    expect(screen.getByText('Sessions (4)')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
    expect(screen.getByText('POST')).toBeInTheDocument()
  })

  it('should call onSessionSelected when session is clicked', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const rows = screen.getAllByRole('row')
    fireEvent.click(rows[1])

    expect(mockOnSessionSelected).toHaveBeenCalled()
  })

  it('should highlight active session', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId="2"
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const activeRow = container.querySelector('.bg-accent\\/15')
    expect(activeRow).toBeInTheDocument()
  })

  it('should filter sessions by search term', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const searchInput = screen.getByPlaceholderText('Filter...')
    fireEvent.change(searchInput, { target: { value: 'login' } })

    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.queryByText('DELETE')).not.toBeInTheDocument()
  })

  it('should filter by session ID', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const searchInput = screen.getByPlaceholderText('Filter...')
    fireEvent.change(searchInput, { target: { value: '3' } })

    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(2)
  })

  it('should show "No sessions found" when filtered results are empty', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const searchInput = screen.getByPlaceholderText('Filter...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('No sessions found')).toBeInTheDocument()
  })

  it('should sort by ID ascending', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const header = screen.getByText('#').closest('th')!
    fireEvent.click(header)

    const cells = container.querySelectorAll('tbody td:first-child')
    expect(cells[0].textContent).toBe('1')
    expect(cells[1].textContent).toBe('2')
  })

  it('should sort by ID descending when clicked twice', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const header = screen.getByText('#').closest('th')!
    fireEvent.click(header)
    fireEvent.click(header)

    const cells = container.querySelectorAll('tbody td:first-child')
    expect(cells[0].textContent).toBe('4')
    expect(cells[1].textContent).toBe('3')
  })

  it('should sort by status code', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const header = screen.getByText('Status').closest('th')!
    fireEvent.click(header)

    const cells = container.querySelectorAll('tbody td:nth-child(2)')
    expect(cells[0].textContent).toBe('200')
    expect(cells[1].textContent).toBe('201')
  })

  it('should sort by method', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const header = screen.getByText('Method').closest('th')!
    fireEvent.click(header)

    const cells = container.querySelectorAll('tbody td:nth-child(3)')
    expect(cells[0].textContent).toBe('DELETE')
    expect(cells[1].textContent).toBe('GET')
  })

  it('should sort by URL', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const header = screen.getByText('URL').closest('th')!
    fireEvent.click(header)

    const cells = container.querySelectorAll('tbody td:nth-child(4)')
    expect(cells[0].textContent).toContain('/api/data')
  })

  it('should display correct status code colors', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const statusCells = container.querySelectorAll('tbody td:nth-child(2)')
    
    const cell200 = Array.from(statusCells).find(cell => cell.textContent === '200')
    expect(cell200?.className).toContain('emerald')
    
    const cell404 = Array.from(statusCells).find(cell => cell.textContent === '404')
    expect(cell404?.className).toContain('orange')
    
    const cell500 = Array.from(statusCells).find(cell => cell.textContent === '500')
    expect(cell500?.className).toContain('red')
  })

  it('should display correct method colors', () => {
    const { container } = render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const methodCells = container.querySelectorAll('tbody td:nth-child(3)')
    
    const getCell = Array.from(methodCells).find(cell => cell.textContent === 'GET')
    expect(getCell?.className).toContain('blue')
    
    const postCell = Array.from(methodCells).find(cell => cell.textContent === 'POST')
    expect(postCell?.className).toContain('green')
    
    const deleteCell = Array.from(methodCells).find(cell => cell.textContent === 'DELETE')
    expect(deleteCell?.className).toContain('red')
  })

  it('should open method filter dropdown', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    const filterButton = screen.getByRole('button', { name: /filter/i })
    fireEvent.click(filterButton)

    expect(screen.getByText('Filter by Method')).toBeInTheDocument()
  })

  it('should handle empty sessions list', () => {
    render(
      <SessionGrid
        sessions={new Map()}
        sessionOrder={[]}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    expect(screen.getByText('Sessions (0)')).toBeInTheDocument()
    expect(screen.getByText('No sessions found')).toBeInTheDocument()
  })

  it('should handle sessions with different HTTP methods', () => {
    const sessions = new Map([
      ['1', createMockSession('1', 'PATCH', '/api/users/1', 200)],
      ['2', createMockSession('2', 'PUT', '/api/users/1', 200)],
      ['3', createMockSession('3', 'CONNECT', 'server.example.com:443', 200)],
    ])

    render(
      <SessionGrid
        sessions={sessions}
        sessionOrder={['1', '2', '3']}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    expect(screen.getByText('PATCH')).toBeInTheDocument()
    expect(screen.getByText('PUT')).toBeInTheDocument()
    expect(screen.getByText('CONNECT')).toBeInTheDocument()
  })

  it('should display full URLs correctly', () => {
    render(
      <SessionGrid
        sessions={mockSessions}
        sessionOrder={mockSessionOrder}
        activeSessionId={null}
        onSessionSelected={mockOnSessionSelected}
      />
    )

    expect(screen.getByText(/https:\/\/example.com\/api\/users/)).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/example.com\/api\/login/)).toBeInTheDocument()
  })
})
