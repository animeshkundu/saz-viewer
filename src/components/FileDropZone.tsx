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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-background via-muted/10 to-primary/5 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
      
      <div className="relative z-10 w-full max-w-2xl animate-fade-in">
        <div
          data-testid="file-drop-zone"
          className={`
            border-2 border-dashed rounded-2xl p-16
            transition-all duration-300 ease-out
            ${
              isDragOver 
                ? 'border-primary bg-primary/15 shadow-2xl shadow-primary/20 scale-[1.02] backdrop-blur-md' 
                : 'border-border/50 bg-card/80 backdrop-blur-md shadow-xl hover:border-primary/60 hover:shadow-2xl hover:bg-card/90'
            }
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-8 text-center">
            <div className={`
              transition-all duration-300 p-6 rounded-2xl
              ${isDragOver 
                ? 'scale-110 text-primary bg-primary/10' 
                : 'text-muted-foreground/70 hover:text-primary hover:bg-primary/5'
              }
            `}>
              <FileArchive
                size={80}
                weight="duotone"
              />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent">
                SAZ Viewer
              </h2>
              <p className="text-base text-muted-foreground max-w-md leading-relaxed">
                Drop a <code className="px-2 py-1 bg-primary/10 rounded-lg text-primary font-mono text-sm font-medium">.saz</code> file here or click the button below to load a Fiddler archive.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                <span>All parsing happens locally in your browser—no data is uploaded.</span>
              </div>
            </div>

            <Button
              data-testid="upload-button"
              onClick={handleButtonClick}
              disabled={isLoading}
              size="lg"
              className="gap-2.5 shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
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
          <Alert data-testid="error-alert" variant="destructive" className="mt-8 shadow-xl backdrop-blur-md bg-error/80 border-error/30 animate-in fade-in slide-in-from-top-4 duration-500">
            <Warning size={20} weight="fill" />
            <AlertDescription className="ml-2 font-medium">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
