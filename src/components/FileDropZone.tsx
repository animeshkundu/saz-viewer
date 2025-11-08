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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div
        className={`
          w-full max-w-2xl border-2 border-dashed rounded-lg p-12
          transition-all duration-150
          ${isDragOver ? 'border-accent bg-accent/5' : 'border-border bg-card'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <FileArchive
            size={64}
            className="text-muted-foreground"
            weight="duotone"
          />
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">SAZ Viewer</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Drop a .saz file here or click the button below to load a Fiddler archive.
              All parsing happens locally in your browser—no data is uploaded.
            </p>
          </div>

          <Button
            onClick={handleButtonClick}
            disabled={isLoading}
            className="gap-2"
          >
            <UploadSimple size={20} />
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
        <Alert variant="destructive" className="mt-6 max-w-2xl">
          <Warning size={20} />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
