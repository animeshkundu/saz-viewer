import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github.css'

hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)

export class SyntaxUtil {
  static highlight(code: string, lang: string): string {
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    } catch (error) {
      return code
    }
  }
}

export class HexUtil {
  static render(element: HTMLElement, buffer: ArrayBuffer): void {
    element.innerHTML = ''
    const view = new Uint8Array(buffer)

    for (let offset = 0; offset < buffer.byteLength; offset += 16) {
      const lineDiv = document.createElement('div')
      lineDiv.style.display = 'flex'
      lineDiv.style.gap = '1rem'
      lineDiv.style.fontFamily = 'var(--font-family-mono)'
      lineDiv.style.fontSize = '12px'
      lineDiv.style.lineHeight = '1.6'

      const addrSpan = document.createElement('span')
      addrSpan.style.color = 'var(--color-muted-foreground)'
      addrSpan.style.width = '5rem'
      addrSpan.style.flexShrink = '0'
      addrSpan.innerText = offset.toString(16).padStart(8, '0') + ':'

      const bytesSpan = document.createElement('span')
      bytesSpan.style.flexGrow = '1'
      bytesSpan.style.fontVariantNumeric = 'tabular-nums'

      const asciiSpan = document.createElement('span')
      asciiSpan.style.color = 'var(--color-muted-foreground)'
      asciiSpan.style.width = '16ch'
      asciiSpan.style.flexShrink = '0'

      let bytesText = ''
      let asciiText = ''

      for (let i = 0; i < 16; i++) {
        if (offset + i >= buffer.byteLength) break

        const byte = view[offset + i]
        bytesText += byte.toString(16).padStart(2, '0') + ' '
        asciiText += byte >= 33 && byte <= 126 ? String.fromCharCode(byte) : '.'
      }

      bytesSpan.innerText = bytesText
      asciiSpan.innerText = asciiText

      lineDiv.appendChild(addrSpan)
      lineDiv.appendChild(bytesSpan)
      lineDiv.appendChild(asciiSpan)
      element.appendChild(lineDiv)
    }
  }
}
