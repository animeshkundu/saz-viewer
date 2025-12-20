import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
// no icon imports needed here after UI simplification
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
    // Pastel status colors
    if (statusCode >= 200 && statusCode < 300) return 'text-[#5FB878] dark:text-[#7FD49D]' // Soft green
    if (statusCode >= 300 && statusCode < 400) return 'text-[#6BA3D4] dark:text-[#8BB8E8]' // Soft blue
    if (statusCode >= 400 && statusCode < 600) return 'text-[#E67E82] dark:text-[#F4A5A8]' // Soft red/coral
    return 'text-muted-foreground'
  }

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-[#6BA3D4]' // Sky blue
      case 'POST':
        return 'text-[#7FD49D]' // Mint green
      case 'PUT':
        return 'text-[#F4C08B]' // Soft amber
      case 'DELETE':
        return 'text-[#F4A5A8]' // Soft coral
      case 'PATCH':
        return 'text-[#C4A5D8]' // Lavender
      case 'CONNECT':
        return 'text-[#8FD4C7]' // Teal
      default:
        return 'text-muted-foreground'
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return <span className="inline ml-0.5 text-[10px] select-none">{sortDirection === 'asc' ? '▲' : '▼'}</span>
  }

  return (
  <div className="h-full flex flex-col bg-card/40 backdrop-blur-sm border-r border-border/20" data-testid="session-grid">
      {/* Header with title + controls */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/20 bg-card/30 backdrop-blur-sm">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Sessions <span className="text-muted-foreground font-normal ml-1">({sessionOrder.length})</span>
        </h2>
        <div className="ml-auto flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 px-3 text-sm bg-background/60 border-border/30 focus:ring-1 focus:ring-primary/30 focus:border-primary/30 rounded-lg transition-all"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm font-medium bg-background/60 border-border/30 hover:bg-primary/5 hover:border-primary/30 transition-all rounded-lg"
              >
                Method: {methodFilters.size === 0 ? 'All' : methodFilters.size === 1 ? Array.from(methodFilters)[0] : methodFilters.size}
                <span className="ml-2 text-xs opacity-60">▾</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-card/95 backdrop-blur-xl border-border/30 elevation-2">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Filter by Method</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/30" />
              {allMethods.map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={methodFilters.has(method)}
                  onCheckedChange={() => toggleMethodFilter(method)}
                  className="relative pl-7 pr-2 text-sm font-mono text-foreground data-[state=checked]:bg-primary/8 rounded-md"
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
            <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b border-border/20">
              <tr>
                <th 
                  style={{ width: `${columnWidths.id}px` }}
                  className="relative text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('id')}
                >
                  #{renderSortIcon('id')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-[1px] cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors"
                    onMouseDown={(e) => handleMouseDown('id', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.status}px` }}
                  className="relative text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  Status{renderSortIcon('status')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-[1px] cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors"
                    onMouseDown={(e) => handleMouseDown('status', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.method}px` }}
                  className="relative text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('method')}
                >
                  Method{renderSortIcon('method')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-[1px] cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors"
                    onMouseDown={(e) => handleMouseDown('method', e)}
                  />
                </th>
                <th 
                  style={{ width: `${columnWidths.url}px` }}
                  className="relative text-left px-4 py-3 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('url')}
                >
                  URL{renderSortIcon('url')}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-[1px] cursor-col-resize hover:bg-primary/40 active:bg-primary/60 transition-colors"
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
                    className={`group cursor-pointer border-b border-border/15 transition-all duration-200 relative
                      ${isActive 
                        ? 'bg-primary/8 border-l border-l-primary elevation-1' 
                        : 'hover:bg-muted/30'
                      }
                    `}
                  >
                    <td 
                      style={{ width: `${columnWidths.id}px` }}
                      className={`px-4 py-3.5 text-sm font-mono text-muted-foreground tabular-nums ${isActive ? 'pl-3.5' : ''}`}
                    >
                      {id}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.status}px` }}
                      className={`px-4 py-3.5 text-sm font-mono font-semibold tabular-nums ${getStatusCodeColor(session.response.statusCode)}`}
                    >
                      {session.response.statusCode}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.method}px` }}
                      className={`px-4 py-3.5 text-sm font-semibold ${getMethodColor(session.method)}`}
                    >
                      {session.method}
                    </td>
                    <td 
                      style={{ width: `${columnWidths.url}px` }}
                      className="px-4 py-3.5 text-sm font-mono text-foreground/70 truncate"
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
