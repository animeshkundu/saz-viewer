import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { FunnelSimple, MagnifyingGlass, X } from '@phosphor-icons/react'
import type { Session } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface SessionGridProps {
  sessions: Map<string, Session>
  sessionOrder: string[]
  activeSessionId: string | null
  onSessionSelected: (sessionId: string) => void
}

type SortField = 'id' | 'status' | 'method' | 'url'
type SortDirection = 'asc' | 'desc'

interface ColumnWidths {
  id: number
  status: number
  method: number
  url: number
}

export function SessionGrid({
  sessions,
  sessionOrder,
  activeSessionId,
  onSessionSelected,
}: SessionGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilters, setMethodFilters] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const activeRowRef = useRef<HTMLTableRowElement>(null)
  
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    id: 60,
    status: 80,
    method: 100,
    url: 400,
  })
  const [resizing, setResizing] = useState<{ column: keyof ColumnWidths; startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeSessionId])

  const handleMouseDown = useCallback((column: keyof ColumnWidths, e: React.MouseEvent) => {
    e.preventDefault()
    setResizing({
      column,
      startX: e.clientX,
      startWidth: columnWidths[column],
    })
  }, [columnWidths])

  useEffect(() => {
    if (!resizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX
      const newWidth = Math.max(40, resizing.startWidth + diff)
      setColumnWidths(prev => ({
        ...prev,
        [resizing.column]: newWidth,
      }))
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing])

  const allMethods = Array.from(new Set(
    Array.from(sessions.values()).map(s => s.method.toUpperCase())
  )).sort()

  const toggleMethodFilter = (method: string) => {
    const newFilters = new Set(methodFilters)
    if (newFilters.has(method)) {
      newFilters.delete(method)
    } else {
      newFilters.add(method)
    }
    setMethodFilters(newFilters)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedSessions = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase()
    const filtered = sessionOrder.filter((id) => {
      const session = sessions.get(id)
      if (!session) return false

      const matchesSearch = normalizedSearchTerm === '' ||
        session.id.includes(normalizedSearchTerm) ||
        session.method.toLowerCase().includes(normalizedSearchTerm) ||
        session.url.toLowerCase().includes(normalizedSearchTerm) ||
        String(session.response.statusCode).includes(normalizedSearchTerm)

      const matchesMethod = methodFilters.size === 0 || 
        methodFilters.has(session.method.toUpperCase())

      return matchesSearch && matchesMethod
    })

    const sorted = [...filtered].sort((aId, bId) => {
      const a = sessions.get(aId)
      const b = sessions.get(bId)
      if (!a || !b) return 0

      let comparison = 0
      switch (sortField) {
        case 'id':
          comparison = parseInt(a.id) - parseInt(b.id)
          break
        case 'status':
          comparison = a.response.statusCode - b.response.statusCode
          break
        case 'method':
          comparison = a.method.localeCompare(b.method)
          break
        case 'url':
          comparison = a.url.localeCompare(b.url)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [sessionOrder, sessions, searchTerm, methodFilters, sortField, sortDirection])

  const hasActiveFilters = searchTerm !== '' || methodFilters.size > 0

  const clearFilters = () => {
    setSearchTerm('')
    setMethodFilters(new Set())
  }

  const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return 'text-emerald-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600'
    if (statusCode >= 400 && statusCode < 600) return 'text-red-600'
    return 'text-neutral-500'
  }

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-blue-600'
      case 'POST':
        return 'text-green-600'
      case 'PUT':
        return 'text-amber-600'
      case 'DELETE':
        return 'text-red-600'
      case 'PATCH':
        return 'text-purple-600'
      case 'CONNECT':
        return 'text-teal-600'
      default:
        return 'text-neutral-500'
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return <span className="inline ml-0.5 text-[10px] select-none">{sortDirection === 'asc' ? '▲' : '▼'}</span>
  }

  return (
  <div className="h-full flex flex-col bg-[#0b1512] border-r border-white/10 text-[#dce6e0]" data-testid="session-grid">
      <div className="border-b border-white/10 bg-[#0d1814]">
        <div className="flex items-center gap-2 px-3.5 pt-3 pb-2">
          <h2 className="text-[10px] font-semibold tracking-[0.16em] text-[#aab8b0] uppercase">
            Sessions <span className="text-[#68776f]">({sessionOrder.length})</span>
          </h2>
          <span
            role="status"
            aria-live="polite"
            data-testid="filtered-count"
            className="ml-auto font-mono text-[10px] text-[#6f8077]"
          >
            {filteredAndSortedSessions.length} matching
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 pb-3">
          <div className="relative flex-1">
            <MagnifyingGlass size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6f8077]" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search sessions"
              className="h-8 border-white/10 bg-white/[0.035] pl-8 pr-2 text-[11px] text-[#dce6e0] placeholder:text-[#617168] focus:border-[#b8f455]/50 focus:ring-0"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-white/10 bg-white/[0.035] px-2.5 text-[10px] font-medium text-[#aab8b0] hover:bg-white/[0.07] hover:text-white"
              >
                <FunnelSimple size={12} />
                Method: {methodFilters.size === 0 ? 'All' : methodFilters.size === 1 ? Array.from(methodFilters)[0] : methodFilters.size}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-white/10 bg-[#12201b] text-[#dce6e0]">
              <DropdownMenuLabel className="text-[10px] font-semibold text-[#85968d]">Filter by Method</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {allMethods.map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={methodFilters.has(method)}
                  onCheckedChange={() => toggleMethodFilter(method)}
                  className="relative pl-6 pr-2 text-[11px] font-mono text-[#c5d0ca] focus:bg-white/[0.07] data-[state=checked]:bg-[#b8f455]/10"
                >
                  {method}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Clear filters"
              onClick={clearFilters}
              className="h-8 w-8 p-0 text-[#74857c] hover:bg-white/[0.07] hover:text-white"
            >
              <X size={13} />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-10 bg-[#0b1512]/95 backdrop-blur border-b border-white/10">
              <tr>
                <th 
                  style={{ width: `${columnWidths.id}px` }}
                  className="relative text-left px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#63736b] cursor-pointer hover:text-[#b8f455] select-none"
                  onClick={() => handleSort('id')}
                >
                  #{renderSortIcon('id')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#b8f455]/30 active:bg-[#b8f455]/50"
                    onMouseDown={(e) => handleMouseDown('id', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.status}px` }}
                  className="relative text-left px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#63736b] cursor-pointer hover:text-[#b8f455] select-none"
                  onClick={() => handleSort('status')}
                >
                  Status{renderSortIcon('status')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#b8f455]/30 active:bg-[#b8f455]/50"
                    onMouseDown={(e) => handleMouseDown('status', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.method}px` }}
                  className="relative text-left px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#63736b] cursor-pointer hover:text-[#b8f455] select-none"
                  onClick={() => handleSort('method')}
                >
                  Method{renderSortIcon('method')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#b8f455]/30 active:bg-[#b8f455]/50"
                    onMouseDown={(e) => handleMouseDown('method', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.url}px` }}
                  className="relative text-left px-2.5 py-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#63736b] cursor-pointer hover:text-[#b8f455] select-none"
                  onClick={() => handleSort('url')}
                >
                  URL{renderSortIcon('url')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#b8f455]/30 active:bg-[#b8f455]/50"
                    onMouseDown={(e) => handleMouseDown('url', e)}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSessions.map((id) => {
                const session = sessions.get(id)
                if (!session) return null

                const isActive = activeSessionId === id

                return (
                  <tr
                    key={id}
                    data-testid={`session-${id}`}
                    data-active={isActive}
                    ref={isActive ? activeRowRef : null}
                    onClick={() => onSessionSelected(id)}
                    className={`group cursor-pointer border-b border-white/[0.055] transition-colors relative
                      ${isActive 
                        ? 'bg-blue-50 !bg-[#b8f455]/[0.09] border-l-2 border-l-blue-500 !border-l-[#b8f455]' 
                        : 'hover:bg-white/[0.035]'
                      }
                    `}
                  >
                    <td 
                      style={{ width: `${columnWidths.id}px` }}
                      className={`px-2.5 py-2 text-[10px] font-mono text-[#65756d] tabular-nums ${isActive ? 'pl-2' : ''}`}
                    >
                      {id}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.status}px` }}
                      className={`px-2.5 py-2 text-[10px] font-mono font-semibold tabular-nums ${getStatusCodeColor(session.response.statusCode)}`}
                    >
                      {session.response.statusCode}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.method}px` }}
                      className={`px-2.5 py-2 text-[10px] font-semibold ${getMethodColor(session.method)}`}
                    >
                      {session.method}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.url}px` }}
                      className="px-2.5 py-2 text-[10px] font-mono text-[#aebbb4] truncate"
                      title={session.url}
                    >
                      {session.url}
                    </td>
                  </tr>
                )
              })}
              
              {filteredAndSortedSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <MagnifyingGlass size={22} className="mb-3 text-[#56655d]" />
                      <p className="text-sm text-[#819188]">No sessions found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </div>
  )
}
