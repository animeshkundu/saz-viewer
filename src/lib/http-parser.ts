import type { ParsedHttpRequest, ParsedHttpResponse } from './types'

export class HttpParserUtil {
  static parseRequest(raw: string): ParsedHttpRequest {
    const { startLine, headers, rawBody, bodyAsArrayBuffer } = this._parseMessage(raw)
    const parts = startLine.split(' ')
    const method = parts[0] || 'GET'
    const url = parts[1] || '/'
    const httpVersion = parts[2] || 'HTTP/1.1'

    return {
      startLine,
      headers,
      rawBody,
      bodyAsArrayBuffer,
      method,
      url,
      httpVersion,
    }
  }

  static parseResponse(raw: string): ParsedHttpResponse {
    const { startLine, headers, rawBody, bodyAsArrayBuffer } = this._parseMessage(raw)
    const parts = startLine.split(' ')
    const httpVersion = parts[0] || 'HTTP/1.1'
    const statusCode = parseInt(parts[1] || '200', 10)
    const statusText = parts.slice(2).join(' ') || 'OK'

    return {
      startLine,
      headers,
      rawBody,
      bodyAsArrayBuffer,
      httpVersion,
      statusCode,
      statusText,
    }
  }

  private static _parseMessage(raw: string): {
    startLine: string
    headers: Map<string, string>
    rawBody: string
    bodyAsArrayBuffer: ArrayBuffer
  } {
    const parts = raw.split('\r\n\r\n', 2)
    const headerBlock = parts[0] || ''
    const rawBody = parts[1] || ''

    const headerLines = headerBlock.split('\r\n')
    const startLine = headerLines.shift() || ''

    const headers = new Map<string, string>()
    for (const line of headerLines) {
      const colonIndex = line.indexOf(': ')
      if (colonIndex === -1) continue
      
      const key = line.substring(0, colonIndex)
      const value = line.substring(colonIndex + 2)
      headers.set(key.toLowerCase(), value)
    }

    const encoder = new TextEncoder()
    const bodyAsArrayBuffer = encoder.encode(rawBody).buffer

    return { startLine, headers, rawBody, bodyAsArrayBuffer }
  }
}
