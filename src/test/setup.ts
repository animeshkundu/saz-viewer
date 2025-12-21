import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

class ResizeObserverMock {
  constructor(_: ResizeObserverCallback) {}
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class MockTextEncoder {
  encode(text: string): Uint8Array {
    const arr = new Uint8Array(text.length)
    for (let i = 0; i < text.length; i++) {
      arr[i] = text.charCodeAt(i)
    }
    return arr
  }
}

class MockTextDecoder {
  decode(buffer: ArrayBuffer): string {
    const arr = new Uint8Array(buffer)
    return String.fromCharCode(...arr)
  }
}

globalThis.TextEncoder = MockTextEncoder as unknown as typeof TextEncoder
globalThis.TextDecoder = MockTextDecoder as unknown as typeof TextDecoder

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// Mock HTMLElement methods needed for tests
HTMLElement.prototype.scrollIntoView = vi.fn()
HTMLElement.prototype.scrollTo = vi.fn()
HTMLElement.prototype.scroll = vi.fn()
