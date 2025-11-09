import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const isTrue = true
      const isFalse = false
      const result = cn('base', isTrue && 'conditional', isFalse && 'excluded')
      expect(result).toBe('base conditional')
    })

    it('should merge tailwind classes correctly', () => {
      const result = cn('p-4', 'p-6')
      expect(result).toBe('p-6')
    })

    it('should handle array inputs', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })

    it('should handle object inputs', () => {
      const result = cn({ class1: true, class2: false, class3: true })
      expect(result).toBe('class1 class3')
    })

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle empty string', () => {
      const result = cn('', 'class1')
      expect(result).toBe('class1')
    })

    it('should merge conflicting tailwind classes', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500')
    })

    it('should handle complex tailwind merging', () => {
      const result = cn('px-4 py-2', 'px-6')
      expect(result).toBe('py-2 px-6')
    })

    it('should handle no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle mixed input types', () => {
      const result = cn(
        'base',
        { conditional: true },
        ['array-class'],
        undefined,
        'final'
      )
      expect(result).toBe('base conditional array-class final')
    })

    it('should preserve non-conflicting classes', () => {
      const result = cn('flex items-center', 'justify-between')
      expect(result).toBe('flex items-center justify-between')
    })

    it('should handle responsive classes', () => {
      const result = cn('text-sm', 'md:text-base', 'lg:text-lg')
      expect(result).toBe('text-sm md:text-base lg:text-lg')
    })

    it('should handle hover and state variants', () => {
      const result = cn('bg-blue-500', 'hover:bg-blue-600', 'active:bg-blue-700')
      expect(result).toBe('bg-blue-500 hover:bg-blue-600 active:bg-blue-700')
    })

    it('should merge same property with different values', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })
  })
})
