import { useState } from 'react'
import { FileDropZone } from '@/components/FileDropZone'
import { SessionList } from '@/components/SessionList'
import { InspectorPanel } from '@/components/InspectorPanel'
import { SazParserService } from '@/lib/saz-parser'
import type { SazArchive } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sazArchive, setSazArchive] = useState<SazArchive | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

  const handleFileLoaded = async (file: File) => {
    setError(null)
    
    if (!file.name.toLowerCase().endsWith('.saz')) {
      setError('Invalid File Type. Please provide a .saz file.')
      return
    }

    setIsLoading(true)

    try {
      const archive = await SazParserService.parse(file)
      setSazArchive(archive)
      
      if (archive.sessionOrder.length > 0) {
        setActiveSessionId(archive.sessionOrder[0])
      }
      
      toast.success(`Loaded ${archive.sessionOrder.length} sessions`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid SAZ Structure. File must contain a 'raw/' folder."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionSelected = (sessionId: string) => {
    setActiveSessionId(sessionId)
  }

  if (!sazArchive) {
    return (
      <>
        <div className="h-screen w-screen bg-background">
          <FileDropZone
            isLoading={isLoading}
            error={error}
            onFileLoaded={handleFileLoaded}
          />
        </div>
        <Toaster />
      </>
    )
  }

  const activeSession = activeSessionId
    ? sazArchive.sessions.get(activeSessionId)
    : null

  return (
    <>
      <div className="h-screen w-screen bg-background flex flex-col">
        <header className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">SAZ Viewer</h1>
            <button
              onClick={() => {
                setSazArchive(null)
                setActiveSessionId(null)
                setError(null)
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Load Different File
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] overflow-hidden">
          <SessionList
            sessions={sazArchive.sessions}
            sessionOrder={sazArchive.sessionOrder}
            activeSessionId={activeSessionId}
            onSessionSelected={handleSessionSelected}
          />

          <div className="overflow-hidden">
            {activeSession ? (
              <div className="h-full grid grid-rows-2 gap-4 p-4">
                <InspectorPanel
                  message={activeSession.request}
                  rawMessage={activeSession.rawClient}
                  title="Request"
                />
                <InspectorPanel
                  message={activeSession.response}
                  rawMessage={activeSession.rawServer}
                  title="Response"
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a session to view details
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </>
  )
}

export default App