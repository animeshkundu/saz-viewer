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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div
        className={`
          w-full max-w-2xl border-2 border-dashed rounded-xl p-16
          transition-all duration-200
          ${
            isDragOver 
              ? 'border-accent bg-accent/10 shadow-lg shadow-accent/10 scale-[1.02]' 
              : 'border-border/60 bg-card/50 backdrop-blur-sm shadow-md hover:border-accent/50 hover:shadow-lg'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className={`
            transition-all duration-200
            ${isDragOver ? 'scale-110 text-accent' : 'text-muted-foreground'}
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
            <p className="text-xs text-muted-foreground/70">
              All parsing happens locally in your browser—no data is uploaded.
            </p>
          </div>

          <Button
            onClick={handleButtonClick}
            disabled={isLoading}
            size="lg"
            className="gap-2.5 shadow-md hover:shadow-lg transition-all"
          >
            <UploadSimple size={20} weight="bold" />
            {isLoading ? 'Loading...' : 'Load SAZ File'}
          </Button>

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
        <Alert variant="destructive" className="mt-6 max-w-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Warning size={20} />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
