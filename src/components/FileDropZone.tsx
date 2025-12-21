import { useState, useRef } from 'react'
import { UploadSimple, FileArchive } from '@phosphor-icons/react'
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.12),transparent_30%)] bg-background text-foreground">
      <div
        data-testid="file-drop-zone"
        className={`
          w-full max-w-3xl border-2 border-dashed rounded-2xl p-14
          transition-all duration-300 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl
          ${
            isDragOver 
              ? 'border-accent bg-accent/10 shadow-accent/20 scale-[1.02]' 
              : 'border-border/70 bg-white/70 hover:border-accent/50 hover:shadow-xl'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-7 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1 text-[11px] font-semibold text-accent">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Client-side & private
          </div>
          <div className={`
            transition-all duration-200
            ${isDragOver ? 'scale-110 text-accent drop-shadow-[0_8px_20px_rgba(59,130,246,0.25)]' : 'text-muted-foreground'}
          `}>
            <FileArchive
              size={72}
              weight="duotone"
            />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              SAZ Viewer
            </h2>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Drop a <code className="px-1.5 py-0.5 bg-muted/60 rounded text-accent font-mono text-xs">.saz</code> file here or click the button below to load a Fiddler archive.
            </p>
            <p className="text-xs text-muted-foreground/80">
              All parsing happens locally in your browser—no data is uploaded.
            </p>
          </div>

          <Button
            data-testid="upload-button"
            onClick={handleButtonClick}
            disabled={isLoading}
            size="lg"
            className="gap-2.5 shadow-md hover:shadow-xl transition-all rounded-full px-6"
          >
            <UploadSimple size={20} weight="bold" />
            {isLoading ? 'Loading...' : 'Load SAZ File'}
          </Button>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-3 text-[11px] text-muted-foreground/80 sm:grid-cols-3">
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 shadow-inner">
              Zero server calls, everything stays in-browser.
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 shadow-inner">
              Supports drag & drop or manual selection.
            </div>
            <div className="rounded-xl border border-border/70 bg-muted/30 px-4 py-3 shadow-inner">
              Designed for Fiddler <code className="font-mono">.saz</code> archives.
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".saz"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>

      {error && (
        <Alert data-testid="error-alert" variant="destructive" className="mt-6 max-w-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Warning size={20} />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
