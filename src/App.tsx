import { useState } from 'react'
import { FileDropZone } from '@/components/FileDropZone'
import { SessionGrid } from '@/components/SessionGrid'
import { InspectorPanel } from '@/components/InspectorPanel'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { SazParserService } from '@/lib/saz-parser'
import type { SazArchive } from '@/lib/types'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { FolderOpen } from '@phosphor-icons/react'

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

  const navigateSession = (direction: 'up' | 'down') => {
    if (!sazArchive || !activeSessionId) return
    
    const currentIndex = sazArchive.sessionOrder.indexOf(activeSessionId)
    if (currentIndex === -1) return
    
    const nextIndex = direction === 'up' 
      ? Math.max(0, currentIndex - 1)
      : Math.min(sazArchive.sessionOrder.length - 1, currentIndex + 1)
    
    if (nextIndex !== currentIndex) {
      setActiveSessionId(sazArchive.sessionOrder[nextIndex])
    }
  }

  if (!sazArchive) {
    return (
      <>
        <div className="min-h-screen w-screen">
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
      <div className="min-h-screen w-screen bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.14),transparent_38%),radial-gradient(circle_at_90%_15%,rgba(16,185,129,0.12),transparent_32%)] bg-slate-50/50 text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-6 py-5">
          <header className="shrink-0 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-lg">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent shadow-inner">
                  <span className="text-sm font-bold">SAZ</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold leading-tight">SAZ Viewer</h1>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Live preview
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Inspect Fiddler archives without leaving the browser.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-semibold text-muted-foreground sm:inline-flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {sazArchive.sessionOrder.length} records processed
                </span>
                <Button
                  data-testid="load-new-file-button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSazArchive(null)
                    setActiveSessionId(null)
                    setError(null)
                  }}
                  className="gap-2 h-9 rounded-full shadow-sm"
                >
                  <FolderOpen size={16} />
                  Load New File
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden rounded-2xl border border-white/60 bg-white/75 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                <SessionGrid
                  sessions={sazArchive.sessions}
                  sessionOrder={sazArchive.sessionOrder}
                  activeSessionId={activeSessionId}
                  onSessionSelected={handleSessionSelected}
                />
              </ResizablePanel>

              <ResizableHandle withHandle className="w-1 bg-gradient-to-b from-transparent via-border to-transparent hover:via-accent/40 transition-colors" />

              <ResizablePanel defaultSize={75} minSize={30}>
                {activeSession ? (
                  <ResizablePanelGroup direction="vertical" className="h-full">
                    <ResizablePanel defaultSize={50} minSize={20}>
                      <InspectorPanel
                        message={activeSession.request}
                        rawMessage={activeSession.rawClient}
                        title="Request"
                      />
                    </ResizablePanel>

                    <ResizableHandle withHandle className="h-1 bg-gradient-to-r from-transparent via-border to-transparent hover:via-accent/40 transition-colors" />

                    <ResizablePanel defaultSize={50} minSize={20}>
                      <InspectorPanel
                        message={activeSession.response}
                        rawMessage={activeSession.rawServer}
                        title="Response"
                        statusCode={activeSession.response.statusCode}
                        statusText={activeSession.response.statusText}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-10 bg-gradient-to-br from-white via-slate-50 to-slate-100">
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-sm">Select a session to view details</p>
                      <p className="text-muted-foreground/60 text-xs">Request and response data will appear here</p>
                    </div>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
      <KeyboardShortcuts
        onNavigateUp={() => navigateSession('up')}
        onNavigateDown={() => navigateSession('down')}
      />
      <Toaster />
    </>
  )
}

export default App
