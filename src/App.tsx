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
import { FileArrowUp, LockKey, Waveform } from '@phosphor-icons/react'

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sazArchive, setSazArchive] = useState<SazArchive | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [loadedFileName, setLoadedFileName] = useState('')

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
      setLoadedFileName(file.name)
      
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
        <div className="min-h-screen w-full bg-[#07100d]">
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
      <div className="h-screen w-screen overflow-hidden bg-[#09110f] text-[#e7eee9] flex flex-col">
        <header className="h-14 border-b border-white/10 bg-[#0b1512]/95 px-4 shrink-0">
          <div className="h-full flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#b8f455] text-[#0b1512] flex items-center justify-center shadow-[0_0_24px_rgba(184,244,85,0.18)]">
                <Waveform size={18} weight="bold" />
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <h1 className="text-sm font-semibold tracking-tight text-white">SAZ Viewer</h1>
                <span className="hidden h-4 w-px bg-white/10 sm:block" />
                <span className="hidden max-w-[36vw] truncate font-mono text-[11px] text-[#8d9b94] sm:block">
                  {loadedFileName}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[#7f9188] md:flex">
                <LockKey size={12} weight="fill" className="text-[#b8f455]" />
                Local session
              </div>
              <Button
                data-testid="load-new-file-button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSazArchive(null)
                  setActiveSessionId(null)
                  setLoadedFileName('')
                  setError(null)
                }}
                className="h-8 gap-2 border border-white/10 bg-white/[0.04] px-3 text-xs text-[#dce6e0] hover:bg-white/[0.08] hover:text-white"
              >
                <FileArrowUp size={15} />
                Load New File
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-[#09110f]">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={31} minSize={20} maxSize={48}>
              <SessionGrid
                sessions={sazArchive.sessions}
                sessionOrder={sazArchive.sessionOrder}
                activeSessionId={activeSessionId}
                onSessionSelected={handleSessionSelected}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="w-px bg-white/10 hover:bg-[#b8f455]/60 transition-colors" />

            <ResizablePanel defaultSize={69} minSize={30}>
              {activeSession ? (
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={46} minSize={20}>
                    <InspectorPanel
                      message={activeSession.request}
                      rawMessage={activeSession.rawClient}
                      title="Request"
                    />
                  </ResizablePanel>

                  <ResizableHandle withHandle className="h-px bg-white/10 hover:bg-[#b8f455]/60 transition-colors" />

                  <ResizablePanel defaultSize={54} minSize={20}>
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
                <div className="h-full flex items-center justify-center text-center p-8 bg-[#0b1512]">
                  <div className="space-y-2">
                    <p className="text-[#dce6e0] text-sm">Select a session to inspect</p>
                    <p className="text-[#718078] text-xs">Request and response data will appear here</p>
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