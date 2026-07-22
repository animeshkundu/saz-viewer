import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CaretDown,
  FunnelSimple,
  MagnifyingGlass,
  MagnifyingGlassMinus,
  X,
} from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Session } from '@/lib/types'

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

interface ResizeState {
  column: keyof ColumnWidths
  startX: number
  startWidth: number
}

const initialColumnWidths: ColumnWidths = {
  id: 54,
  status: 72,
  method: 88,
  url: 225,
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
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(initialColumnWidths)
  const [resizing, setResizing] = useState<ResizeState | null>(null)
  const activeRowRef = useRef<HTMLTableRowElement>(null)

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [activeSessionId])

  const handleMouseDown = useCallback((column: keyof ColumnWidths, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setResizing({
      column,
      startX: event.clientX,
      startWidth: columnWidths[column],
    })
  }, [columnWidths])

  useEffect(() => {
    if (!resizing) {
      return
    }

    const handleMouseMove = (event: MouseEvent) => {
      const nextWidth = Math.max(44, resizing.startWidth + event.clientX - resizing.startX)
      setColumnWidths((currentWidths) => ({
        ...currentWidths,
        [resizing.column]: nextWidth,
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

  const allMethods = useMemo(() => Array.from(new Set(
    Array.from(sessions.values()).map((session) => session.method.toUpperCase())
  )).sort(), [sessions])

  const toggleMethodFilter = (method: string) => {
    setMethodFilters((currentFilters) => {
      const nextFilters = new Set(currentFilters)
      if (nextFilters.has(method)) {
        nextFilters.delete(method)
      } else {
        nextFilters.add(method)
      }
      return nextFilters
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((currentDirection) => currentDirection === 'asc' ? 'desc' : 'asc')
      return
    }

    setSortField(field)
    setSortDirection('asc')
  }

  const filteredAndSortedSessions = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase()
    const filtered = sessionOrder.filter((id) => {
      const session = sessions.get(id)
      if (!session) {
        return false
      }

      const matchesSearch = normalizedSearchTerm === ''
        || session.id.includes(normalizedSearchTerm)
        || session.method.toLowerCase().includes(normalizedSearchTerm)
        || session.url.toLowerCase().includes(normalizedSearchTerm)
        || String(session.response.statusCode).includes(normalizedSearchTerm)
      const matchesMethod = methodFilters.size === 0
        || methodFilters.has(session.method.toUpperCase())

      return matchesSearch && matchesMethod
    })

    return [...filtered].sort((firstId, secondId) => {
      const firstSession = sessions.get(firstId)
      const secondSession = sessions.get(secondId)
      if (!firstSession || !secondSession) {
        return 0
      }

      let comparison = 0
      switch (sortField) {
        case 'id':
          comparison = parseInt(firstSession.id, 10) - parseInt(secondSession.id, 10)
          break
        case 'status':
          comparison = firstSession.response.statusCode - secondSession.response.statusCode
          break
        case 'method':
          comparison = firstSession.method.localeCompare(secondSession.method)
          break
        case 'url':
          comparison = firstSession.url.localeCompare(secondSession.url)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [methodFilters, searchTerm, sessionOrder, sessions, sortDirection, sortField])

  const statusSummary = useMemo(() => {
    let successful = 0
    let failed = 0

    sessions.forEach((session) => {
      if (session.response.statusCode >= 200 && session.response.statusCode < 400) {
        successful += 1
      } else if (session.response.statusCode >= 400) {
        failed += 1
      }
    })

    return { successful, failed }
  }, [sessions])

  const hasActiveFilters = searchTerm !== '' || methodFilters.size > 0

  const clearFilters = () => {
    setSearchTerm('')
    setMethodFilters(new Set())
  }

  const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'text-emerald-600'
    }
    if (statusCode >= 300 && statusCode < 400) {
      return 'text-blue-600'
    }
    if (statusCode >= 400 && statusCode < 600) {
      return 'text-red-600'
    }
    return 'text-slate-500'
  }

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-blue-600'
      case 'POST':
        return 'text-green-600'
      case 'PUT':
        return 'text-amber-700'
      case 'DELETE':
        return 'text-red-600'
      case 'PATCH':
        return 'text-violet-700'
      case 'CONNECT':
        return 'text-teal-700'
      default:
        return 'text-neutral-500'
    }
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null
    }

    return (
      <span className="ml-1 inline font-mono text-[8px] text-cyan-700" aria-hidden="true">
        {sortDirection === 'asc' ? '▲' : '▼'}
      </span>
    )
  }

  return (
    <section
      className="flex h-full flex-col border-r border-slate-300 bg-slate-50"
      data-testid="session-grid"
      aria-label="Captured HTTP sessions"
    >
      <div className="shrink-0 border-b border-slate-300 bg-white">
        <div className="flex h-10 items-center gap-3 px-3">
          <div className="min-w-0">
            <h2 className="text-xs font-semibold tracking-tight text-slate-800">
              Sessions <span className="font-mono text-[10px] font-medium text-slate-400">({sessionOrder.length})</span>
            </h2>
          </div>

          <div className="hidden items-center gap-2 font-mono text-[9px] lg:flex">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {statusSummary.successful} ok
            </span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="size-1.5 rounded-full bg-rose-500" />
              {statusSummary.failed} err
            </span>
          </div>

          <span
            role="status"
            aria-live="polite"
            data-testid="filtered-count"
            className="ml-auto font-mono text-[9px] text-slate-400"
          >
            {filteredAndSortedSessions.length} matching
          </span>
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlass
              size={13}
              weight="bold"
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search..."
              aria-label="Search sessions"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-8 rounded-lg border-slate-300 bg-slate-50 pl-8 pr-7 text-[11px] text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-100"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X size={11} weight="bold" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 rounded-lg border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-600 shadow-none hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
              >
                <FunnelSimple size={12} weight={methodFilters.size > 0 ? 'fill' : 'bold'} />
                Method: {methodFilters.size === 0
                  ? 'All'
                  : methodFilters.size === 1
                    ? Array.from(methodFilters)[0]
                    : methodFilters.size}
                <CaretDown size={10} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-slate-200 bg-white shadow-xl">
              <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Filter by method
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              {allMethods.map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={methodFilters.has(method)}
                  onCheckedChange={() => toggleMethodFilter(method)}
                  className="relative pl-7 pr-2 font-mono text-[11px] font-semibold text-slate-700 data-[state=checked]:bg-cyan-50 data-[state=checked]:text-cyan-800"
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
              className="h-8 shrink-0 rounded-lg px-2 text-[10px] text-slate-500 hover:bg-rose-50 hover:text-rose-700"
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <thead className="sticky top-0 z-10 border-b border-slate-300 bg-slate-100/95 backdrop-blur">
              <tr>
                {([
                  ['id', '#'],
                  ['status', 'Status'],
                  ['method', 'Method'],
                  ['url', 'URL'],
                ] as const).map(([field, label]) => (
                  <th
                    key={field}
                    style={{ width: `${columnWidths[field]}px` }}
                    className="relative cursor-pointer select-none px-2 py-2 text-left font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800"
                    onClick={() => handleSort(field)}
                  >
                    {label}{renderSortIcon(field)}
                    <div
                      aria-hidden="true"
                      className="absolute bottom-0 right-0 top-0 w-1 cursor-col-resize border-r border-transparent hover:border-cyan-400 hover:bg-cyan-100"
                      onMouseDown={(event) => handleMouseDown(field, event)}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedSessions.map((id) => {
                const session = sessions.get(id)
                if (!session) {
                  return null
                }

                const isActive = activeSessionId === id

                return (
                  <tr
                    key={id}
                    data-testid={`session-${id}`}
                    data-active={isActive}
                    aria-selected={isActive}
                    ref={isActive ? activeRowRef : null}
                    onClick={() => onSessionSelected(id)}
                    className={`group cursor-pointer border-b border-slate-200 transition-colors ${
                      isActive
                        ? 'bg-blue-50 shadow-[inset_3px_0_0_#06b6d4]'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td
                      style={{ width: `${columnWidths.id}px` }}
                      className="px-2 py-2 font-mono text-[10px] tabular-nums text-slate-400"
                    >
                      {id}
                    </td>
                    <td
                      style={{ width: `${columnWidths.status}px` }}
                      className={`px-2 py-2 font-mono text-[10px] font-bold tabular-nums ${getStatusCodeColor(session.response.statusCode)}`}
                    >
                      {session.response.statusCode}
                    </td>
                    <td
                      style={{ width: `${columnWidths.method}px` }}
                      className={`px-2 py-2 text-[10px] font-bold tracking-wide ${getMethodColor(session.method)}`}
                    >
                      {session.method}
                    </td>
                    <td
                      style={{ width: `${columnWidths.url}px` }}
                      className="truncate px-2 py-2 font-mono text-[10px] text-slate-700"
                      title={session.url}
                    >
                      {session.url}
                    </td>
                  </tr>
                )
              })}

              {filteredAndSortedSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="mb-3 flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                        <MagnifyingGlassMinus size={18} />
                      </div>
                      <p className="text-xs font-medium text-slate-600">No sessions found</p>
                      <p className="mt-1 text-[10px] text-slate-400">Try a broader URL, status, or method.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>
    </section>
  )
}
