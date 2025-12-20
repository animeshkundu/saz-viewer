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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Refined decorative elements - more subtle */}
      <div className="absolute top-32 left-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-32 right-32 w-72 h-72 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
      
      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <div
          data-testid="file-drop-zone"
          className={`
            border rounded-2xl p-20
            transition-all duration-300 ease-out
            ${
              isDragOver 
                ? 'border-primary/40 bg-primary/8 elevation-3' 
                : 'border-border/30 bg-card/70 elevation-1 hover:border-primary/25 hover:elevation-2 hover:bg-card/90'
            }
            ${isLoading ? 'opacity-60 pointer-events-none' : ''}
            backdrop-blur-sm
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-10 text-center">
            <div className={`
              transition-all duration-300 p-5 rounded-3xl
              ${isDragOver 
                ? 'scale-105 text-primary bg-primary/8' 
                : 'text-muted-foreground hover:text-primary/70 hover:bg-muted/30'
              }
            `}>
              <FileArchive
                size={64}
                weight="duotone"
              />
            </div>
            
            <div className="space-y-5 max-w-lg">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                SAZ Viewer
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Drop a <code className="px-2.5 py-1 bg-muted/60 rounded-md text-primary font-mono text-sm font-medium mx-0.5">.saz</code> file here or click the button below to load a Fiddler archive.
              </p>
              <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground/70">
                <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                <span>All parsing happens locally in your browser—no data is uploaded.</span>
              </div>
            </div>

            <Button
              data-testid="upload-button"
              onClick={handleButtonClick}
              disabled={isLoading}
              size="lg"
              className="gap-2.5 px-8 elevation-2 hover:elevation-3 transition-all hover:scale-[1.02] bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <UploadSimple size={18} weight="bold" />
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
          <Alert data-testid="error-alert" variant="destructive" className="mt-8 elevation-2 backdrop-blur-sm bg-error/80 border-error/20 animate-in fade-in slide-in-from-top-4 duration-500">
            <Warning size={18} weight="fill" />
            <AlertDescription className="ml-2 font-medium">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
