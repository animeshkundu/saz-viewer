import { describe, it, expect } from 'vitest'
import { HttpParserUtil } from './http-parser'

describe('HttpParserUtil', () => {
  describe('parseRequest', () => {
    it('should parse a simple GET request', () => {
      const raw = 'GET /api/users HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla/5.0\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('GET')
      expect(result.url).toBe('/api/users')
      expect(result.httpVersion).toBe('HTTP/1.1')
      expect(result.headers.get('host')).toBe('example.com')
      expect(result.headers.get('user-agent')).toBe('Mozilla/5.0')
      expect(result.rawBody).toBe('')
    })

    it('should parse a POST request with body', () => {
      const raw = 'POST /api/login HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"username":"test","password":"pass"}'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('POST')
      expect(result.url).toBe('/api/login')
      expect(result.headers.get('content-type')).toBe('application/json')
      expect(result.rawBody).toBe('{"username":"test","password":"pass"}')
    })

    it('should handle requests with multiple header values', () => {
      const raw = 'GET /test HTTP/1.1\r\nAccept: text/html\r\nAccept-Encoding: gzip, deflate\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.headers.get('accept')).toBe('text/html')
      expect(result.headers.get('accept-encoding')).toBe('gzip, deflate')
    })

    it('should convert headers to lowercase', () => {
      const raw = 'GET / HTTP/1.1\r\nContent-Type: text/html\r\nX-Custom-Header: value\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.headers.get('content-type')).toBe('text/html')
      expect(result.headers.get('x-custom-header')).toBe('value')
      expect(result.headers.get('Content-Type')).toBeUndefined()
    })

    it('should handle empty body', () => {
      const raw = 'DELETE /api/users/1 HTTP/1.1\r\nHost: api.example.com\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('DELETE')
      expect(result.rawBody).toBe('')
      expect(result.bodyAsArrayBuffer.byteLength).toBe(0)
    })

    it('should parse request with default values for missing parts', () => {
      const raw = '\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('GET')
      expect(result.url).toBe('/')
      expect(result.httpVersion).toBe('HTTP/1.1')
    })

    it('should convert body to ArrayBuffer correctly', () => {
      const raw = 'POST /data HTTP/1.1\r\n\r\ntest body'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.bodyAsArrayBuffer).toBeInstanceOf(ArrayBuffer)
      expect(result.bodyAsArrayBuffer.byteLength).toBe(9)
    })

    it('should handle CONNECT method', () => {
      const raw = 'CONNECT server.example.com:443 HTTP/1.1\r\nHost: server.example.com\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('CONNECT')
      expect(result.url).toBe('server.example.com:443')
    })

    it('should handle PUT request', () => {
      const raw = 'PUT /api/users/1 HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"name":"updated"}'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('PUT')
      expect(result.rawBody).toContain('name')
    })

    it('should handle PATCH request', () => {
      const raw = 'PATCH /api/users/1 HTTP/1.1\r\n\r\n{"name":"patched"}'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('PATCH')
    })
  })

  describe('parseResponse', () => {
    it('should parse a 200 OK response', () => {
      const raw = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 13\r\n\r\n{"status":"ok"}'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.httpVersion).toBe('HTTP/1.1')
      expect(result.statusCode).toBe(200)
      expect(result.statusText).toBe('OK')
      expect(result.headers.get('content-type')).toBe('application/json')
      expect(result.rawBody).toBe('{"status":"ok"}')
    })

    it('should parse a 404 Not Found response', () => {
      const raw = 'HTTP/1.1 404 Not Found\r\nContent-Type: text/html\r\n\r\n<html>Not Found</html>'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.statusCode).toBe(404)
      expect(result.statusText).toBe('Not Found')
    })

    it('should parse a 500 Internal Server Error response', () => {
      const raw = 'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain\r\n\r\nError occurred'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.statusCode).toBe(500)
      expect(result.statusText).toBe('Internal Server Error')
    })

    it('should parse a 301 redirect response', () => {
      const raw = 'HTTP/1.1 301 Moved Permanently\r\nLocation: https://example.com/new\r\n\r\n'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.statusCode).toBe(301)
      expect(result.statusText).toBe('Moved Permanently')
      expect(result.headers.get('location')).toBe('https://example.com/new')
    })

    it('should handle response with multiple Set-Cookie headers', () => {
      const raw = 'HTTP/1.1 200 OK\r\nSet-Cookie: session=abc123\r\n\r\n'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.headers.get('set-cookie')).toBe('session=abc123')
    })

    it('should parse response with default values for missing parts', () => {
      const raw = '\r\n\r\n'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.httpVersion).toBe('HTTP/1.1')
      expect(result.statusCode).toBe(200)
      expect(result.statusText).toBe('OK')
    })

    it('should handle empty body response', () => {
      const raw = 'HTTP/1.1 204 No Content\r\n\r\n'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.statusCode).toBe(204)
      expect(result.rawBody).toBe('')
      expect(result.bodyAsArrayBuffer.byteLength).toBe(0)
    })

    it('should parse 201 Created response', () => {
      const raw = 'HTTP/1.1 201 Created\r\nLocation: /api/users/123\r\n\r\n'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.statusCode).toBe(201)
      expect(result.statusText).toBe('Created')
    })

    it('should handle response with binary content', () => {
      const raw = 'HTTP/1.1 200 OK\r\nContent-Type: image/png\r\n\r\n\x89PNG binary data here'
      
      const result = HttpParserUtil.parseResponse(raw)
      
      expect(result.headers.get('content-type')).toBe('image/png')
      expect(result.bodyAsArrayBuffer.byteLength).toBeGreaterThan(0)
    })
  })

  describe('edge cases', () => {
    it('should handle malformed headers gracefully', () => {
      const raw = 'GET / HTTP/1.1\r\nMalformedHeader\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.method).toBe('GET')
      expect(result.headers.size).toBe(0)
    })

    it('should handle headers with colon in value', () => {
      const raw = 'GET / HTTP/1.1\r\nAuthorization: Bearer token:with:colons\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.headers.get('authorization')).toBe('Bearer token:with:colons')
    })

    it('should handle very long header values', () => {
      const longValue = 'a'.repeat(10000)
      const raw = `GET / HTTP/1.1\r\nX-Long-Header: ${longValue}\r\n\r\n`
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.headers.get('x-long-header')).toBe(longValue)
    })

    it('should handle body with multiple CRLF sequences', () => {
      const raw = 'POST / HTTP/1.1\r\n\r\nline1\r\n\r\nline2\r\n\r\n'
      
      const result = HttpParserUtil.parseRequest(raw)
      
      expect(result.rawBody).toBe('line1\r\n\r\nline2\r\n\r\n')
    })
  })
})
