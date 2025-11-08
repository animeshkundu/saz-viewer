import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { Session } from '@/lib/types'

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
  const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    if (statusCode >= 300 && statusCode < 400) return 'bg-blue-500/10 text-blue-700 border-blue-200'
    if (statusCode >= 400 && statusCode < 500) return 'bg-orange-500/10 text-orange-700 border-orange-200'
    if (statusCode >= 500) return 'bg-red-500/10 text-red-700 border-red-200'
    return 'bg-muted text-muted-foreground border-border'
  }

  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'POST':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'PUT':
        return 'bg-amber-500/10 text-amber-700 border-amber-200'
      case 'DELETE':
        return 'bg-red-500/10 text-red-700 border-red-200'
      case 'PATCH':
        return 'bg-purple-500/10 text-purple-700 border-purple-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">
          Sessions
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {sessionOrder.map((id) => {
            const session = sessions.get(id)
            if (!session) return null

            const isActive = activeSessionId === id

            return (
              <button
                key={id}
                onClick={() => onSessionSelected(id)}
                className={`
                  w-full text-left p-3 rounded-md
                  transition-all duration-150
                  border
                  ${
                    isActive
                      ? 'bg-accent/10 border-accent shadow-sm'
                      : 'border-transparent hover:bg-muted/50 hover:border-border'
                  }
                `}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
                      #{id.padStart(4, '0')}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0 h-5 ${getStatusCodeColor(session.response.statusCode)}`}
                    >
                      {session.response.statusCode}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] font-semibold px-1.5 py-0 h-5 ${getMethodColor(session.method)}`}
                    >
                      {session.method}
                    </Badge>
                  </div>
                  <div className="text-xs text-foreground/80 truncate font-mono leading-relaxed">
                    {session.url}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
