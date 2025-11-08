import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onNavigateUp?: () => void
  onNavigateDown?: () => void
  onOpenFile?: () => void
}

export function KeyboardShortcuts({
  onNavigateUp,
  onNavigateDown,
  onOpenFile,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' && onNavigateUp) {
        e.preventDefault()
        onNavigateUp()
      } else if (e.key === 'ArrowDown' && onNavigateDown) {
        e.preventDefault()
        onNavigateDown()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'o' && onOpenFile) {
        e.preventDefault()
        onOpenFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onNavigateUp, onNavigateDown, onOpenFile])

  return null
}
