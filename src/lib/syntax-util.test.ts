import { describe, it, expect } from 'vitest'
import { SyntaxUtil, HexUtil } from './syntax-util'

describe('SyntaxUtil', () => {
  describe('highlight', () => {
    it('should highlight valid JSON', () => {
      const code = '{"name":"John","age":30}'
      const result = SyntaxUtil.highlight(code, 'json')
      
      expect(result).toContain('hljs')
      expect(result.length).toBeGreaterThan(code.length)
    })

    it('should highlight valid XML', () => {
      const code = '<root><item>test</item></root>'
      const result = SyntaxUtil.highlight(code, 'xml')
      
      expect(result).toContain('hljs')
    })

    it('should return original code for invalid syntax', () => {
      const code = '{{invalid json}}'
      const result = SyntaxUtil.highlight(code, 'json')
      
      expect(result).toBeTruthy()
    })

    it('should handle empty code', () => {
      const code = ''
      const result = SyntaxUtil.highlight(code, 'json')
      
      expect(result).toBe('')
    })

    it('should handle complex JSON structures', () => {
      const code = JSON.stringify({
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        meta: { count: 2 },
      })
      const result = SyntaxUtil.highlight(code, 'json')
      
      expect(result).toContain('hljs')
    })

    it('should handle complex XML structures', () => {
      const code = `
        <root>
          <users>
            <user id="1">Alice</user>
            <user id="2">Bob</user>
          </users>
        </root>
      `
      const result = SyntaxUtil.highlight(code, 'xml')
      
      expect(result).toContain('hljs')
    })
  })
})

describe('HexUtil', () => {
  describe('render', () => {
    it('should render hex view for simple buffer', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]).buffer
      
      HexUtil.render(element, buffer)
      
      expect(element.innerHTML).toBeTruthy()
      expect(element.children.length).toBeGreaterThan(0)
    })

    it('should display hex offset correctly', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array(32).buffer
      
      HexUtil.render(element, buffer)
      
      const firstLine = element.firstChild as HTMLElement
      expect(firstLine.textContent).toContain('00000000:')
    })

    it('should display ASCII representation', () => {
      const element = document.createElement('div')
      const buffer = new TextEncoder().encode('Hello').buffer
      
      HexUtil.render(element, buffer)
      
      expect(element.textContent).toContain('Hello')
    })

    it('should replace non-printable characters with dots', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x00, 0x01, 0x41, 0x42, 0x1f]).buffer
      
      HexUtil.render(element, buffer)
      
      const text = element.textContent || ''
      expect(text).toContain('.')
      expect(text).toContain('A')
      expect(text).toContain('B')
    })

    it('should handle empty buffer', () => {
      const element = document.createElement('div')
      const buffer = new ArrayBuffer(0)
      
      HexUtil.render(element, buffer)
      
      expect(element.innerHTML).toBe('')
    })

    it('should split long buffers into multiple lines', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array(64).buffer
      
      HexUtil.render(element, buffer)
      
      expect(element.children.length).toBe(4)
    })

    it('should handle buffers not aligned to 16 bytes', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array(20).buffer
      
      HexUtil.render(element, buffer)
      
      expect(element.children.length).toBe(2)
    })

    it('should display hex bytes with correct formatting', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0xff, 0x00, 0x0a]).buffer
      
      HexUtil.render(element, buffer)
      
      const text = element.textContent || ''
      expect(text).toContain('ff')
      expect(text).toContain('00')
      expect(text).toContain('0a')
    })

    it('should handle large buffers', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array(256).buffer
      
      HexUtil.render(element, buffer)
      
      expect(element.children.length).toBe(16)
    })

    it('should clear existing content before rendering', () => {
      const element = document.createElement('div')
      element.innerHTML = '<p>Previous content</p>'
      const buffer = new Uint8Array([0x41]).buffer
      
      HexUtil.render(element, buffer)
      
      expect(element.innerHTML).not.toContain('Previous content')
    })

    it('should handle binary data correctly', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).buffer
      
      HexUtil.render(element, buffer)
      
      const text = element.textContent || ''
      expect(text).toContain('89')
      expect(text).toContain('50')
      expect(text).toContain('4e')
      expect(text).toContain('47')
    })

    it('should render multiple lines with correct offsets', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array(48).buffer
      
      HexUtil.render(element, buffer)
      
      const lines = Array.from(element.children)
      expect(lines[0].textContent).toContain('00000000:')
      expect(lines[1].textContent).toContain('00000010:')
      expect(lines[2].textContent).toContain('00000020:')
    })
  })
})
