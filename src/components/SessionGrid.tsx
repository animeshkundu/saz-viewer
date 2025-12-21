import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, FunnelSimple } from '@phosphor-icons/react'
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
    const filtered = sessionOrder.filter((id) => {
      const session = sessions.get(id)
      if (!session) return false

      const matchesSearch = searchTerm === '' || 
        session.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.id.includes(searchTerm)

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
    <div className="h-full flex flex-col bg-white/80 backdrop-blur-sm border-r border-white/60" data-testid="session-grid">
      {/* Header with title + controls */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200/80 bg-gradient-to-r from-white to-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
          <h2 className="text-[11px] font-semibold tracking-[0.08em] text-neutral-700 uppercase">
            Sessions <span className="text-neutral-400">({sessionOrder.length})</span>
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-2 w-2/3">
          <div className="relative flex-1">
            <MagnifyingGlass size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 pr-3 text-[11px] bg-white/80 border-neutral-200 focus:ring-0 focus:border-accent/60 rounded-full"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-[11px] font-medium bg-white/80 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-700 rounded-full"
              >
                <FunnelSimple size={14} className="mr-1 text-neutral-500" />
                Method: {methodFilters.size === 0 ? 'All' : methodFilters.size === 1 ? Array.from(methodFilters)[0] : methodFilters.size}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white border-neutral-200 shadow-lg">
              <DropdownMenuLabel className="text-[11px] font-semibold text-neutral-600">Filter by Method</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-200" />
              {allMethods.map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={methodFilters.has(method)}
                  onCheckedChange={() => toggleMethodFilter(method)}
                  className="relative pl-6 pr-2 text-[11px] font-mono text-neutral-700 data-[state=checked]:bg-neutral-100"
                >
                  {method}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-neutral-200">
              <tr>
                <th 
                  style={{ width: `${columnWidths.id}px` }}
                  className="relative text-left px-2 py-1.5 text-[11px] font-medium text-neutral-500 cursor-pointer hover:text-neutral-700 select-none"
                  onClick={() => handleSort('id')}
                >
                  #{renderSortIcon('id')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-neutral-300 active:bg-neutral-400"
                    onMouseDown={(e) => handleMouseDown('id', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.status}px` }}
                  className="relative text-left px-2 py-1.5 text-[11px] font-medium text-neutral-500 cursor-pointer hover:text-neutral-700 select-none"
                  onClick={() => handleSort('status')}
                >
                  Status{renderSortIcon('status')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-neutral-300 active:bg-neutral-400"
                    onMouseDown={(e) => handleMouseDown('status', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.method}px` }}
                  className="relative text-left px-2 py-1.5 text-[11px] font-medium text-neutral-500 cursor-pointer hover:text-neutral-700 select-none"
                  onClick={() => handleSort('method')}
                >
                  Method{renderSortIcon('method')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-neutral-300 active:bg-neutral-400"
                    onMouseDown={(e) => handleMouseDown('method', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.url}px` }}
                  className="relative text-left px-2 py-1.5 text-[11px] font-medium text-neutral-500 cursor-pointer hover:text-neutral-700 select-none"
                  onClick={() => handleSort('url')}
                >
                  URL{renderSortIcon('url')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-neutral-300 active:bg-neutral-400"
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
                    className={`group cursor-pointer border-b border-neutral-200 transition-colors relative
                      ${isActive 
                        ? 'bg-blue-50 border-l-2 border-l-blue-500' 
                        : 'hover:bg-blue-50/50'
                      }
                    `}
                  >
                    <td 
                      style={{ width: `${columnWidths.id}px` }}
                      className={`px-2 py-1.5 text-[11px] font-mono text-neutral-500 tabular-nums ${isActive ? 'pl-1.5' : ''}`}
                    >
                      {id}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.status}px` }}
                      className={`px-2 py-1.5 text-[11px] font-mono font-semibold tabular-nums ${getStatusCodeColor(session.response.statusCode)}`}
                    >
                      {session.response.statusCode}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.method}px` }}
                      className={`px-2 py-1.5 text-[11px] font-semibold ${getMethodColor(session.method)}`}
                    >
                      {session.method}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.url}px` }}
                      className="px-2 py-1.5 text-[11px] font-mono text-neutral-700 truncate"
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
                      <span className="text-muted-foreground mb-2 text-xl">🔍</span>
                      <p className="text-sm text-muted-foreground">No sessions found</p>
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
