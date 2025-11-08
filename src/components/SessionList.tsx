import { useState, useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
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

interface SessionListProps {
  sessions: Map<string, Session>
  sessionOrder: string[]
  activeSessionId: string | null
  onSessionSelected: (sessionId: string) => void
}

export function SessionList({
  sessions,
  sessionOrder,
  activeSessionId,
  onSessionSelected,
}: SessionListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilters, setMethodFilters] = useState<Set<string>>(new Set())
  const activeSessionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeSessionRef.current) {
      activeSessionRef.current.scrollIntoView({
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

  const filteredSessions = sessionOrder.filter((id) => {
    const session = sessions.get(id)
    if (!session) return false

    const matchesSearch = searchTerm === '' || 
      session.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.includes(searchTerm)

    const matchesMethod = methodFilters.size === 0 || 
      methodFilters.has(session.method.toUpperCase())

    return matchesSearch && matchesMethod
  })

  const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300/30 dark:border-emerald-500/30'
    if (statusCode >= 300 && statusCode < 400) return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300/30 dark:border-blue-500/30'
    if (statusCode >= 400 && statusCode < 500) return 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-300/30 dark:border-orange-500/30'
    if (statusCode >= 500) return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-300/30 dark:border-red-500/30'
    return 'bg-muted text-muted-foreground border-border'
  }

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300/30 dark:border-blue-500/30'
      case 'POST':
        return 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-300/30 dark:border-green-500/30'
      case 'PUT':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300/30 dark:border-amber-500/30'
      case 'DELETE':
        return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-300/30 dark:border-red-500/30'
      case 'PATCH':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300/30 dark:border-purple-500/30'
      case 'CONNECT':
        return 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-300/30 dark:border-teal-500/30'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="h-full flex flex-col bg-card border-r">
      <div className="px-3 py-3 border-b bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">
            Sessions
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredSessions.length} / {sessionOrder.length}
          </span>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlass 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
              size={14}
            />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-9 pr-3 text-xs bg-background/50"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 gap-1.5 px-2.5 shrink-0"
              >
                <FunnelSimple size={14} />
                {methodFilters.size > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {methodFilters.size}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs font-semibold px-3 py-2">Filter by Method</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allMethods.map((method) => (
                <DropdownMenuCheckboxItem
                  key={method}
                  checked={methodFilters.has(method)}
                  onCheckedChange={() => toggleMethodFilter(method)}
                  className="text-xs py-2 pl-9 pr-3"
                >
                  {method}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col p-1.5">
          {filteredSessions.map((id) => {
            const session = sessions.get(id)
            if (!session) return null

            const isActive = activeSessionId === id

            return (
              <button
                key={id}
                ref={isActive ? activeSessionRef : null}
                onClick={() => onSessionSelected(id)}
                className={`
                  group relative w-full text-left px-3 py-2.5 rounded-md
                  transition-all duration-200
                  border mb-1
                  ${
                    isActive
                      ? 'bg-accent/10 border-accent/40 shadow-sm ring-1 ring-accent/20'
                      : 'border-transparent hover:bg-muted/50 hover:border-border/50'
                  }
                `}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
                      #{id.padStart(4, '0')}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-mono font-bold px-1.5 py-0 h-[18px] shrink-0 ${getStatusCodeColor(session.response.statusCode)}`}
                    >
                      {session.response.statusCode}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-bold px-1.5 py-0 h-[18px] shrink-0 ${getMethodColor(session.method)}`}
                    >
                      {session.method}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-foreground/90 leading-relaxed font-mono break-all">
                    {session.url}
                  </div>
                </div>
                
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/4 bg-accent rounded-r-full" />
                )}
              </button>
            )
          })}
          
          {filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MagnifyingGlass size={32} className="text-muted-foreground mb-2" weight="duotone" />
              <p className="text-sm text-muted-foreground">No sessions found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
