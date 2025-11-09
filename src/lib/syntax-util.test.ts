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

    it('should display hex offset in correct format', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]).buffer
      
      HexUtil.render(element, buffer)
      
      // Access the first child div, then its first span (the offset)
      const firstLine = element.children[0] as HTMLElement
      const offsetSpan = firstLine.children[0] as HTMLElement
      expect(offsetSpan.innerText).toContain('00000000')
    })

    it('should display ASCII representation for printable characters', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]).buffer // "Hello"
      
      HexUtil.render(element, buffer)
      
      // Access the ASCII span (3rd child of first line)
      const firstLine = element.children[0] as HTMLElement
      const asciiSpan = firstLine.children[2] as HTMLElement
      expect(asciiSpan.innerText).toContain('Hello')
    })

    it('should display dots for non-printable characters', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x00, 0x01, 0x02]).buffer
      
      HexUtil.render(element, buffer)
      
      // Access the ASCII span
      const firstLine = element.children[0] as HTMLElement
      const asciiSpan = firstLine.children[2] as HTMLElement
      expect(asciiSpan.innerText).toContain('...')
    })

    it('should display hex bytes in correct format', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x48, 0x65, 0x6c]).buffer
      
      HexUtil.render(element, buffer)
      
      // Access the hex bytes span (2nd child of first line)
      const firstLine = element.children[0] as HTMLElement
      const bytesSpan = firstLine.children[1] as HTMLElement
      expect(bytesSpan.innerText).toContain('48')
      expect(bytesSpan.innerText).toContain('65')
      expect(bytesSpan.innerText).toContain('6c')
    })

    it('should handle binary data correctly', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0xff, 0xfe, 0xfd]).buffer
      
      HexUtil.render(element, buffer)
      
      // Check hex bytes and ASCII
      const firstLine = element.children[0] as HTMLElement
      const bytesSpan = firstLine.children[1] as HTMLElement
      const asciiSpan = firstLine.children[2] as HTMLElement
      expect(bytesSpan.innerText).toContain('ff')
      expect(bytesSpan.innerText).toContain('fe')
      expect(bytesSpan.innerText).toContain('fd')
      expect(asciiSpan.innerText).toContain('...')
    })

    it('should handle multiple lines with correct offsets', () => {
      const element = document.createElement('div')
      // Create data larger than 16 bytes to trigger multiple lines
      const buffer = new Uint8Array(32).fill(0x41).buffer // 'A' repeated 32 times
      
      HexUtil.render(element, buffer)
      
      // Check offset of first two lines
      const line0 = element.children[0] as HTMLElement
      const line1 = element.children[1] as HTMLElement
      const offset0 = line0.children[0] as HTMLElement
      const offset1 = line1.children[0] as HTMLElement
      expect(offset0.innerText).toContain('00000000')
      expect(offset1.innerText).toContain('00000010')
    })

    it('should display ASCII representation', () => {
      const element = document.createElement('div')
      const buffer = new TextEncoder().encode('Hello').buffer
      
      HexUtil.render(element, buffer)
      
      const firstLine = element.children[0] as HTMLElement
      const asciiSpan = firstLine.children[2] as HTMLElement
      expect(asciiSpan.innerText).toContain('Hello')
    })

    it('should replace non-printable characters with dots', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array([0x00, 0x01, 0x41, 0x42, 0x1f]).buffer
      
      HexUtil.render(element, buffer)
      
      const firstLine = element.children[0] as HTMLElement
      const asciiSpan = firstLine.children[2] as HTMLElement
      expect(asciiSpan.innerText).toContain('.')
      expect(asciiSpan.innerText).toContain('A')
      expect(asciiSpan.innerText).toContain('B')
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
      
      const firstLine = element.children[0] as HTMLElement
      const bytesSpan = firstLine.children[1] as HTMLElement
      expect(bytesSpan.innerText).toContain('ff')
      expect(bytesSpan.innerText).toContain('00')
      expect(bytesSpan.innerText).toContain('0a')
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
      
      const firstLine = element.children[0] as HTMLElement
      const bytesSpan = firstLine.children[1] as HTMLElement
      expect(bytesSpan.innerText).toContain('89')
      expect(bytesSpan.innerText).toContain('50')
      expect(bytesSpan.innerText).toContain('4e')
      expect(bytesSpan.innerText).toContain('47')
    })

    it('should render multiple lines with correct offsets', () => {
      const element = document.createElement('div')
      const buffer = new Uint8Array(48).buffer
      
      HexUtil.render(element, buffer)
      
      const line0 = element.children[0] as HTMLElement
      const line1 = element.children[1] as HTMLElement
      const line2 = element.children[2] as HTMLElement
      const offset0 = line0.children[0] as HTMLElement
      const offset1 = line1.children[0] as HTMLElement
      const offset2 = line2.children[0] as HTMLElement
      expect(offset0.innerText).toContain('00000000:')
      expect(offset1.innerText).toContain('00000010:')
      expect(offset2.innerText).toContain('00000020:')
    })
  })
})
