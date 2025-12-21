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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-800">
      <div
        data-testid="file-drop-zone"
        className={`
          w-full max-w-2xl border-2 border-dashed rounded-xl p-16
          transition-all duration-200
          ${
            isDragOver 
              ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 scale-[1.02]' 
              : 'border-slate-600 bg-slate-700/50 backdrop-blur-sm shadow-md hover:border-blue-500/50 hover:shadow-lg'
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
            ${isDragOver ? 'scale-110 text-blue-500' : 'text-slate-400'}
          `}>
            <FileArchive
              size={72}
              weight="duotone"
            />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              SAZ Viewer
            </h2>
            <p className="text-sm text-slate-300 max-w-md leading-relaxed">
              Drop a <code className="px-1.5 py-0.5 bg-slate-600/60 rounded text-blue-400 font-mono text-xs">.saz</code> file here or click the button below to load a Fiddler archive.
            </p>
            <p className="text-xs text-slate-400">
              All parsing happens locally in your browser—no data is uploaded.
            </p>
          </div>

          <Button
            data-testid="upload-button"
            onClick={handleButtonClick}
            disabled={isLoading}
            size="lg"
            className="gap-2.5 shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UploadSimple size={20} weight="bold" />
            {isLoading ? 'Loading...' : 'Select File'}
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
        <Alert data-testid="error-alert" variant="destructive" className="mt-6 max-w-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <Warning size={20} />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
