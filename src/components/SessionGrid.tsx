import { useState, useEffect, useRef, useMemo } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MagnifyingGlass, FunnelSimple, CaretUp, CaretDown } from '@phosphor-icons/react'
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

  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeSessionId])

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
    if (statusCode >= 200 && statusCode < 300) return 'text-emerald-600 dark:text-emerald-400'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600 dark:text-blue-400'
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600 dark:text-orange-400'
    if (statusCode >= 500) return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'text-blue-600 dark:text-blue-400'
      case 'POST':
        return 'text-green-600 dark:text-green-400'
      case 'PUT':
        return 'text-amber-600 dark:text-amber-400'
      case 'DELETE':
        return 'text-red-600 dark:text-red-400'
      case 'PATCH':
        return 'text-purple-600 dark:text-purple-400'
      case 'CONNECT':
        return 'text-teal-600 dark:text-teal-400'
      default:
        return 'text-muted-foreground'
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <CaretUp size={12} weight="bold" className="inline ml-1" /> : 
      <CaretDown size={12} weight="bold" className="inline ml-1" />
  }

  return (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="px-3 py-3 border-b bg-muted/20 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">
            Sessions ({sessionOrder.length})
          </h2>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass 
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" 
              size={14}
            />
            <Input
              placeholder="Filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8 text-xs bg-background/50"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 shrink-0"
              >
                <FunnelSimple size={14} />
                {methodFilters.size > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">
                    {methodFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-xs">Filter by Method</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allMethods.map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={methodFilters.has(method)}
                  onCheckedChange={() => toggleMethodFilter(method)}
                  className="text-xs"
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
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-muted/30 border-b border-border">
              <tr>
                <th 
                  className="text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-[60px]"
                  onClick={() => handleSort('id')}
                >
                  #<SortIcon field="id" />
                </th>
                <th 
                  className="text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-[80px]"
                  onClick={() => handleSort('status')}
                >
                  Status<SortIcon field="status" />
                </th>
                <th 
                  className="text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-[100px]"
                  onClick={() => handleSort('method')}
                >
                  Method<SortIcon field="method" />
                </th>
                <th 
                  className="text-left px-3 py-2 text-[11px] font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => handleSort('url')}
                >
                  URL<SortIcon field="url" />
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
                    ref={isActive ? activeRowRef : null}
                    onClick={() => onSessionSelected(id)}
                    className={`
                      cursor-pointer border-b border-border/40 transition-colors
                      ${
                        isActive
                          ? 'bg-accent/15 hover:bg-accent/20'
                          : 'hover:bg-muted/40'
                      }
                    `}
                  >
                    <td className="px-3 py-2.5 text-[11px] font-mono text-muted-foreground tabular-nums">
                      {id}
                    </td>
                    <td className={`px-3 py-2.5 text-[11px] font-mono font-bold tabular-nums ${getStatusCodeColor(session.response.statusCode)}`}>
                      {session.response.statusCode}
                    </td>
                    <td className={`px-3 py-2.5 text-[11px] font-bold ${getMethodColor(session.method)}`}>
                      {session.method}
                    </td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-foreground/90 truncate max-w-0">
                      {session.url}
                    </td>
                  </tr>
                )
              })}
              
              {filteredAndSortedSessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <MagnifyingGlass size={32} className="text-muted-foreground mb-2" weight="duotone" />
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
