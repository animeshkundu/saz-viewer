import { useState, useRef } from 'react'
import { UploadSimple, Lightning, ShieldCheck, Sparkle, RocketLaunch } from '@phosphor-icons/react'
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

  const features = [
    {
      icon: Lightning,
      title: 'Lightning Fast',
      description: 'Parse and analyze thousands of requests in seconds'
    },
    {
      icon: ShieldCheck,
      title: '100% Private',
      description: 'Everything stays in your browser. Zero uploads.'
    },
    {
      icon: Sparkle,
      title: 'Beautiful UI',
      description: 'Modern, elegant interface that makes debugging delightful'
    },
    {
      icon: RocketLaunch,
      title: 'Powerful Tools',
      description: 'Search, filter, compare, and export with ease'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '15s' }}></div>
      
      <div className="relative z-10 container mx-auto px-6 py-16 flex flex-col items-center">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          {/* Logo with gradient */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-primary via-primary to-secondary p-6 rounded-3xl elevation-3">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-white">
                  <path d="M24 4L8 12V22C8 32 14 40 24 44C34 40 40 32 40 22V12L24 4Z" fill="currentColor" opacity="0.2"/>
                  <path d="M24 8L12 14V22C12 29.18 16.4 35.28 24 38C31.6 35.28 36 29.18 36 22V14L24 8Z" fill="currentColor"/>
                  <path d="M20 22L22 24L28 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
            SAZ Viewer
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            The most beautiful way to inspect Fiddler archives.<br />
            <span className="text-primary font-medium">Fast. Private. Powerful.</span>
          </p>
        </div>

        {/* Upload Zone */}
        <div 
          data-testid="file-drop-zone"
          className={`
            max-w-2xl w-full border-2 rounded-3xl p-12 mb-16
            transition-all duration-300 ease-out backdrop-blur-sm animate-scale-in
            ${isDragOver 
              ? 'border-primary bg-primary/10 elevation-3 scale-[1.02]' 
              : 'border-border/40 bg-card/60 elevation-2 hover:border-primary/50 hover:elevation-3'
            }
            ${isLoading ? 'opacity-60 pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-8 text-center">
            <div className={`
              p-6 rounded-2xl transition-all duration-300
              ${isDragOver ? 'bg-primary/15 scale-110' : 'bg-muted/30'}
            `}>
              <UploadSimple size={48} weight="duotone" className={isDragOver ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-3">Drop your .saz file here</h3>
              <p className="text-muted-foreground mb-6">or click the button below</p>
              
              <Button
                data-testid="upload-button"
                onClick={handleButtonClick}
                disabled={isLoading}
                size="lg"
                className="gap-3 px-8 py-6 text-lg elevation-2 hover:elevation-3 transition-all hover:scale-105"
              >
                <UploadSimple size={22} weight="bold" />
                {isLoading ? 'Loading...' : 'Choose File'}
              </Button>
              
              <p className="text-xs text-muted-foreground/60 mt-4 flex items-center justify-center gap-2">
                <ShieldCheck size={14} />
                <span>100% client-side • No uploads • Complete privacy</span>
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
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/30 transition-all duration-300 hover:elevation-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon size={32} weight="duotone" className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {error && (
          <Alert data-testid="error-alert" variant="destructive" className="max-w-2xl elevation-2 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <Warning size={18} weight="fill" />
            <AlertDescription className="ml-2">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
