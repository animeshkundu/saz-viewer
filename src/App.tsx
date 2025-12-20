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
      <div className="h-screen w-screen bg-gradient-to-br from-background via-muted/5 to-primary/5 flex flex-col">
        <header className="border-b border-border/50 bg-gradient-to-r from-card/95 via-primary/5 to-secondary/5 backdrop-blur-lg px-6 py-3 shrink-0 shadow-lg relative">
          {/* Subtle animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary border border-primary/20 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105">
                <span className="text-primary-foreground font-bold text-sm">SAZ</span>
              </div>
              <h1 className="text-lg font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">SAZ Viewer</h1>
            </div>
            <Button
              data-testid="load-new-file-button"
              variant="default"
              size="sm"
              onClick={() => {
                setSazArchive(null)
                setActiveSessionId(null)
                setError(null)
              }}
              className="gap-2 h-9 shadow-md hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
            >
              <FolderOpen size={16} weight="bold" />
              Load New File
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
              <SessionGrid
                sessions={sazArchive.sessions}
                sessionOrder={sazArchive.sessionOrder}
                activeSessionId={activeSessionId}
                onSessionSelected={handleSessionSelected}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="w-1.5 bg-gradient-to-b from-primary/20 via-border to-secondary/20 hover:bg-gradient-to-b hover:from-primary/40 hover:via-primary/30 hover:to-secondary/40 transition-all duration-300" />

            <ResizablePanel defaultSize={75} minSize={30}>
              {activeSession ? (
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={50} minSize={20}>
                    <InspectorPanel
                      message={activeSession.request}
                      rawMessage={activeSession.rawClient}
                      title="Request"
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle className="h-1.5 bg-gradient-to-r from-primary/20 via-border to-secondary/20 hover:bg-gradient-to-r hover:from-primary/40 hover:via-primary/30 hover:to-secondary/40 transition-all duration-300" />

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
                <div className="h-full flex items-center justify-center text-center p-8">
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
      <KeyboardShortcuts
        onNavigateUp={() => navigateSession('up')}
        onNavigateDown={() => navigateSession('down')}
      />
      <Toaster />
    </>
  )
}

export default App