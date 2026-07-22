import { useState, useRef } from 'react'
import { ArrowRight, FileArchive, LockKey, ShieldCheck, Sparkle, Waveform } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Warning } from '@phosphor-icons/react'

interface FileDropZoneProps {
  isLoading: boolean
  error: string | null
  onFileLoaded: (file: File) => void
}

export function FileDropZone({ isLoading, error, onFileLoaded }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.saz')) {
      onFileLoaded(file)
      return
    }
    onFileLoaded(file)
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07100d] px-5 py-6 text-[#eef5f0] sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 landing-grid opacity-35" />
      <div className="pointer-events-none absolute left-[12%] top-[-18rem] h-[34rem] w-[34rem] rounded-full bg-[#b8f455]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-20rem] right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[#47d7ac]/10 blur-[140px]" />

      <nav className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#b8f455] text-[#07100d] shadow-[0_0_30px_rgba(184,244,85,0.2)]">
            <Waveform size={20} weight="bold" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">SAZ Viewer</div>
            <div className="text-[9px] uppercase tracking-[0.24em] text-[#7d8f85]">Local traffic lab</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#9aaaA1]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b8f455] shadow-[0_0_10px_#b8f455]" />
          No upload. Ever.
        </div>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-5.5rem)] max-w-[1400px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b8f455]/20 bg-[#b8f455]/[0.07] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c8fa78]">
            <Sparkle size={12} weight="fill" />
            HTTP stories, decoded
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl xl:text-[5.25rem]">
            See the conversation behind every request.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#93a49a] sm:text-lg">
            Open Fiddler archives in a focused, browser-native workspace. Trace headers, payloads, failures, and binary data without your capture leaving this device.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-6">
            {[
              ['100%', 'on-device'],
              ['5 views', 'per message'],
              ['0 bytes', 'transmitted'],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="font-mono text-sm font-semibold text-[#dfffb0]">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#718078]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            data-testid="file-drop-zone"
            className={`group relative overflow-hidden rounded-[1.75rem] border p-2 transition-all duration-300 ${
              isDragOver
                ? 'scale-[1.015] border-[#b8f455] bg-[#b8f455]/10 shadow-[0_0_80px_rgba(184,244,85,0.12)]'
                : 'border-white/10 bg-white/[0.035] shadow-2xl shadow-black/30'
            } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="rounded-[1.35rem] border border-dashed border-white/15 bg-[#0b1713]/90 px-7 py-12 text-center sm:px-12 sm:py-16">
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border transition-all duration-300 ${
                isDragOver
                  ? 'rotate-3 border-[#b8f455]/60 bg-[#b8f455] text-[#08100d]'
                  : 'border-white/10 bg-white/[0.04] text-[#b8f455] group-hover:border-[#b8f455]/30'
              }`}>
                <FileArchive size={38} weight="duotone" />
              </div>
              <h2 className="mt-7 text-2xl font-semibold tracking-[-0.025em] text-white">
                {isDragOver ? 'Release to inspect' : 'Drop a .saz archive'}
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#83948b]">
                Place a Fiddler archive here, or choose one from your device. Large captures are welcome.
              </p>

              <Button
                data-testid="upload-button"
                onClick={handleButtonClick}
                disabled={isLoading}
                size="lg"
                className="mt-8 h-12 gap-3 rounded-xl bg-[#b8f455] px-6 font-semibold text-[#0a120f] shadow-[0_12px_40px_rgba(184,244,85,0.14)] hover:bg-[#c7ff68] hover:text-[#0a120f]"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a120f]/25 border-t-[#0a120f]" />
                    Loading...
                  </>
                ) : (
                  <>
                    Choose SAZ file
                    <ArrowRight size={17} weight="bold" />
                  </>
                )}
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".saz"
                onChange={handleFileInput}
                className="hidden"
              />

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#66776e]">
                <LockKey size={12} weight="fill" className="text-[#91be52]" />
                All parsing happens locally in your browser
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 px-3 text-xs leading-5 text-[#77887f]">
            <ShieldCheck size={17} weight="duotone" className="mt-0.5 shrink-0 text-[#b8f455]" />
            Cookies, tokens, and payloads stay in browser memory and are cleared when you close this tab.
          </div>

          {error && (
            <Alert data-testid="error-alert" variant="destructive" className="mt-5 border-red-400/20 bg-red-500/10 text-red-200">
              <Warning size={20} />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </section>
    </main>
  )
}
