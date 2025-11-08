import { ScrollArea } from '@/components/ui/scroll-area'
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
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600'
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600'
    if (statusCode >= 500) return 'text-red-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="h-full flex flex-col border-r bg-card">
      <div className="p-4 border-b">
        <h2 className="font-medium text-sm">
          Sessions ({sessionOrder.length})
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0.5 p-2">
          {sessionOrder.map((id) => {
            const session = sessions.get(id)
            if (!session) return null

            const isActive = activeSessionId === id

            return (
              <button
                key={id}
                onClick={() => onSessionSelected(id)}
                className={`
                  w-full text-left p-3 rounded text-xs font-mono
                  transition-colors duration-100
                  border-l-2
                  ${
                    isActive
                      ? 'bg-accent/10 border-l-accent'
                      : 'border-l-transparent hover:bg-muted'
                  }
                `}
              >
                <div className="flex items-start gap-2">
                  <span className="text-muted-foreground shrink-0">
                    #{id}
                  </span>
                  <span
                    className={`font-medium shrink-0 ${getStatusCodeColor(
                      session.response.statusCode
                    )}`}
                  >
                    {session.response.statusCode}
                  </span>
                  <span className="font-medium shrink-0">
                    {session.method}
                  </span>
                  <span className="text-muted-foreground truncate">
                    {session.url}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
