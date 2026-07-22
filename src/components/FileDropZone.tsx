import { useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle,
  FileArchive,
  Lightning,
  LockKey,
  MagnifyingGlass,
  ShieldCheck,
  UploadSimple,
  Warning,
} from '@phosphor-icons/react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface FileDropZoneProps {
  isLoading: boolean
  error: string | null
  onFileLoaded: (file: File) => void
}

const workflowSteps = [
  { number: '01', label: 'Choose archive' },
  { number: '02', label: 'Parse locally' },
  { number: '03', label: 'Inspect traffic' },
]

export function FileDropZone({ isLoading, error, onFileLoaded }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!isLoading) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    if (!isLoading && event.dataTransfer.files.length > 0) {
      onFileLoaded(event.dataTransfer.files[0])
    }
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!isLoading && files && files.length > 0) {
      onFileLoaded(files[0])
    }
  }

  const handleButtonClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      className="landing-canvas relative min-h-screen overflow-hidden bg-slate-950 text-white"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="landing-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="landing-orb landing-orb-primary" aria-hidden="true" />
      <div className="landing-orb landing-orb-secondary" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_28px_rgba(34,211,238,0.18)]">
            <span className="font-mono text-[11px] font-bold tracking-tight text-cyan-200">SAZ</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Fiddler capture lab</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-slate-500">Network observatory</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur">
          <ShieldCheck size={14} weight="fill" className="text-emerald-400" />
          100% local workspace
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-[1440px] items-center gap-12 px-6 pb-12 pt-8 lg:min-h-[calc(100vh-140px)] lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-10">
        <section className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-blue-200">
            <span className="size-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
            Fiddler archive inspector
          </div>

          <h1 className="max-w-3xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-white sm:text-6xl lg:text-[76px]">
            Follow every request.
            <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">
              Keep the evidence local.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-pretty text-base leading-7 text-slate-400 sm:text-lg">
            Open Fiddler captures in a focused, browser-native workspace. Search sessions, decode payloads, and trace failures without uploading a single byte.
          </p>

          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            <div className="landing-proof">
              <LockKey size={18} weight="duotone" className="text-cyan-300" />
              <div>
                <p className="text-xs font-semibold text-slate-100">Zero uploads</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Browser memory only</p>
              </div>
            </div>
            <div className="landing-proof">
              <Lightning size={18} weight="duotone" className="text-amber-300" />
              <div>
                <p className="text-xs font-semibold text-slate-100">Instant parsing</p>
                <p className="mt-0.5 text-[10px] text-slate-500">No install required</p>
              </div>
            </div>
            <div className="landing-proof">
              <MagnifyingGlass size={18} weight="duotone" className="text-violet-300" />
              <div>
                <p className="text-xs font-semibold text-slate-100">Deep inspection</p>
                <p className="mt-0.5 text-[10px] text-slate-500">JSON, XML and hex</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-xl lg:ml-auto">
          <section
            data-testid="file-drop-zone"
            aria-label="Choose or drop a SAZ file"
            onClick={handleButtonClick}
            className={`drop-zone group relative cursor-pointer overflow-hidden rounded-[28px] border p-2 transition-all duration-300 ${
              isDragOver
                ? 'scale-[1.015] border-cyan-300/80 bg-cyan-300/10 shadow-[0_0_80px_rgba(34,211,238,0.22)]'
                : 'border-white/15 bg-white/[0.07] shadow-2xl shadow-black/30 hover:border-cyan-300/40 hover:bg-white/[0.09]'
            } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
          >
            <div className="relative min-h-[430px] rounded-[22px] border border-white/10 bg-slate-950/70 px-8 py-8 backdrop-blur-xl sm:px-12 sm:py-10">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
                  Local input
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>

              <div className="flex min-h-[330px] flex-col items-center justify-center text-center">
                <div className={`relative mb-7 transition-transform duration-300 ${isDragOver ? 'scale-110' : 'group-hover:-translate-y-1'}`}>
                  <div className="absolute inset-0 scale-150 rounded-full bg-cyan-400/10 blur-2xl" />
                  <div className="relative flex size-24 items-center justify-center rounded-3xl border border-cyan-300/25 bg-gradient-to-br from-cyan-300/20 to-blue-500/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                    <FileArchive size={46} weight="duotone" className="text-cyan-200" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full border-4 border-slate-950 bg-blue-500">
                    <ArrowRight size={14} weight="bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">SAZ Viewer</h2>
                  <p className="mx-auto max-w-sm text-sm leading-6 text-slate-400">
                    Drop a <code className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-1.5 py-0.5 font-mono text-xs text-cyan-200">.saz</code> file anywhere, or choose one from your device.
                  </p>
                </div>

                <Button
                  data-testid="upload-button"
                  type="button"
                  disabled={isLoading}
                  size="lg"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleButtonClick()
                  }}
                  className="mt-7 h-12 rounded-xl bg-cyan-300 px-6 text-sm font-semibold text-slate-950 shadow-[0_12px_35px_rgba(34,211,238,0.22)] transition-all hover:bg-cyan-200 hover:shadow-[0_14px_42px_rgba(34,211,238,0.3)]"
                >
                  {isLoading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-slate-900/25 border-t-slate-900" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <UploadSimple size={18} weight="bold" />
                      Load SAZ File
                    </>
                  )}
                </Button>

                <p className="mt-5 flex items-center gap-2 text-[11px] text-slate-500">
                  <CheckCircle size={14} weight="fill" className="text-emerald-400" />
                  All parsing happens locally in your browser - no data is uploaded.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".saz"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </section>

          {error && (
            <Alert
              data-testid="error-alert"
              variant="destructive"
              className="mt-4 border-red-400/25 bg-red-950/70 text-red-100 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-2"
            >
              <Warning size={18} weight="fill" className="text-red-300" />
              <AlertDescription className="ml-2 text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div className="flex items-center gap-5">
          {workflowSteps.map((step) => (
            <div key={step.number} className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-cyan-400">{step.number}</span>
              <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{step.label}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
          Private by architecture, not policy
        </p>
      </footer>
    </div>
  )
}
