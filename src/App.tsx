import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  FilePlus,
  ShieldCheck,
  Waveform,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { FileDropZone } from '@/components/FileDropZone'
import { InspectorPanel } from '@/components/InspectorPanel'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { SessionGrid } from '@/components/SessionGrid'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Toaster } from '@/components/ui/sonner'
import { SazParserService } from '@/lib/saz-parser'
import type { SazArchive } from '@/lib/types'

interface ArchiveStats {
  successful: number
  redirected: number
  failed: number
}

function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sazArchive, setSazArchive] = useState<SazArchive | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [loadedFileName, setLoadedFileName] = useState('')

  const archiveStats = useMemo<ArchiveStats>(() => {
    const stats = { successful: 0, redirected: 0, failed: 0 }
    if (!sazArchive) {
      return stats
    }

    sazArchive.sessions.forEach((session) => {
      const statusCode = session.response.statusCode
      if (statusCode >= 200 && statusCode < 300) {
        stats.successful += 1
      } else if (statusCode >= 300 && statusCode < 400) {
        stats.redirected += 1
      } else if (statusCode >= 400) {
        stats.failed += 1
      }
    })

    return stats
  }, [sazArchive])

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
    } catch (caughtError) {
      const message = caughtError instanceof Error
        ? caughtError.message
        : "Invalid SAZ Structure. File must contain a 'raw/' folder."
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadNewFile = () => {
    setSazArchive(null)
    setActiveSessionId(null)
    setLoadedFileName('')
    setError(null)
  }

  const navigateSession = (direction: 'up' | 'down') => {
    if (!sazArchive || !activeSessionId) {
      return
    }

    const currentIndex = sazArchive.sessionOrder.indexOf(activeSessionId)
    if (currentIndex === -1) {
      return
    }

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
        <FileDropZone
          isLoading={isLoading}
          error={error}
          onFileLoaded={handleFileLoaded}
        />
        <Toaster />
      </>
    )
  }

  const activeSession = activeSessionId
    ? sazArchive.sessions.get(activeSessionId)
    : null

  return (
    <>
      <div className="flex h-screen min-h-[540px] w-screen flex-col overflow-hidden bg-slate-200">
        <header className="relative z-20 shrink-0 border-b border-white/10 bg-slate-950 px-4 text-white shadow-lg shadow-slate-950/10 lg:px-5">
          <div className="flex h-14 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_18px_rgba(34,211,238,0.15)]">
                <Waveform size={17} weight="bold" className="text-cyan-300" />
              </div>
              <div className="shrink-0">
                <h1 className="text-sm font-semibold leading-tight tracking-tight">SAZ Viewer</h1>
                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-slate-500">Network observatory</p>
              </div>
              <div className="hidden h-7 w-px bg-white/10 sm:block" />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-medium text-slate-200" title={loadedFileName}>
                  {loadedFileName}
                </p>
                <p className="mt-0.5 font-mono text-[9px] text-slate-500">
                  {sazArchive.sessionOrder.length.toLocaleString()} captured exchanges
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-1.5 xl:flex">
                <span className="workspace-stat text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  {archiveStats.successful} success
                </span>
                <span className="workspace-stat text-sky-300">
                  <span className="size-1.5 rounded-full bg-sky-400" />
                  {archiveStats.redirected} redirect
                </span>
                <span className="workspace-stat text-rose-300">
                  <span className="size-1.5 rounded-full bg-rose-400" />
                  {archiveStats.failed} failed
                </span>
              </div>

              <div className="mx-1 hidden h-7 w-px bg-white/10 md:block" />

              <Button
                data-testid="load-new-file-button"
                type="button"
                size="sm"
                onClick={handleLoadNewFile}
                className="h-8 gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300 px-3 text-xs font-semibold text-slate-950 shadow-none hover:bg-cyan-200"
              >
                <FilePlus size={15} weight="bold" />
                <span className="hidden sm:inline">Load New File</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden bg-slate-200 p-1.5">
          <div className="h-full overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={31} minSize={20} maxSize={48}>
                <SessionGrid
                  sessions={sazArchive.sessions}
                  sessionOrder={sazArchive.sessionOrder}
                  activeSessionId={activeSessionId}
                  onSessionSelected={setActiveSessionId}
                />
              </ResizablePanel>

              <ResizableHandle
                withHandle
                className="w-1 border-x border-slate-300 bg-slate-200 transition-colors hover:bg-cyan-200"
              />

              <ResizablePanel defaultSize={69} minSize={38}>
                {activeSession ? (
                  <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50} minSize={20}>
                      <InspectorPanel
                        message={activeSession.request}
                        rawMessage={activeSession.rawClient}
                        title="Request"
                      />
                    </ResizablePanel>

                    <ResizableHandle
                      withHandle
                      className="h-1 border-y border-slate-300 bg-slate-200 transition-colors hover:bg-cyan-200"
                    />

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
                  <div className="flex h-full items-center justify-center bg-slate-50 p-8 text-center">
                    <div>
                      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm">
                        <Waveform size={20} />
                      </div>
                      <p className="text-sm font-medium text-slate-700">Select a session to inspect</p>
                      <p className="mt-1 text-xs text-slate-400">Request and response data will appear here.</p>
                    </div>
                  </div>
                )}
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </main>

        <footer className="flex h-7 shrink-0 items-center justify-between border-t border-slate-300 bg-slate-100 px-3 text-[9px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={12} weight="fill" className="text-emerald-600" />
            <span className="font-medium text-slate-600">Local-only session</span>
            <span className="hidden text-slate-400 sm:inline">No capture data leaves this browser</span>
          </div>
          <div className="hidden items-center gap-3 font-mono sm:flex">
            <span className="flex items-center gap-1"><ArrowUp size={10} /> <ArrowDown size={10} /> navigate</span>
            <span><kbd className="workspace-key">Ctrl</kbd> + <kbd className="workspace-key">O</kbd> new archive</span>
          </div>
        </footer>
      </div>

      <KeyboardShortcuts
        onNavigateUp={() => navigateSession('up')}
        onNavigateDown={() => navigateSession('down')}
        onOpenFile={handleLoadNewFile}
      />
      <Toaster />
    </>
  )
}

export default App
