import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { SazParserService } from './saz-parser'

describe('SazParserService', () => {
  describe('parse', () => {
    it('should parse a valid SAZ file with single session', async () => {
      const zip = new JSZip()
      const clientData = 'GET /api/test HTTP/1.1\r\nHost: example.com\r\n\r\n'
      const serverData = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"result":"success"}'
      
      zip.file('raw/1_c.txt', clientData)
      zip.file('raw/1_s.txt', serverData)
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.size).toBe(1)
      expect(result.sessionOrder).toEqual(['1'])
      
      const session = result.sessions.get('1')
      expect(session).toBeDefined()
      expect(session!.id).toBe('1')
      expect(session!.method).toBe('GET')
      expect(session!.url).toBe('https://example.com/api/test')
      expect(session!.request.url).toBe('/api/test')
      expect(session!.response.statusCode).toBe(200)
    })

    it('should parse multiple sessions in correct order', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /first HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      zip.file('raw/3_c.txt', 'GET /third HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/3_s.txt', 'HTTP/1.1 404 Not Found\r\n\r\n')
      zip.file('raw/2_c.txt', 'POST /second HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/2_s.txt', 'HTTP/1.1 201 Created\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.size).toBe(3)
      expect(result.sessionOrder).toEqual(['1', '2', '3'])
      
      expect(result.sessions.get('1')!.request.url).toBe('/first')
      expect(result.sessions.get('2')!.request.url).toBe('/second')
      expect(result.sessions.get('3')!.request.url).toBe('/third')
      
      expect(result.sessions.get('1')!.response.statusCode).toBe(200)
      expect(result.sessions.get('2')!.response.statusCode).toBe(201)
      expect(result.sessions.get('3')!.response.statusCode).toBe(404)
    })

    it('should handle sessions with large IDs correctly', async () => {
      const zip = new JSZip()
      
      zip.file('raw/100_c.txt', 'GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/100_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      zip.file('raw/10_c.txt', 'GET /test2 HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/10_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessionOrder).toEqual(['10', '100'])
    })

    it('should skip incomplete sessions (missing client file)', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      zip.file('raw/2_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      // Session 2 is skipped from sessions map because it has no client file
      // But sessionOrder still includes it as an ID that was discovered
      expect(result.sessions.size).toBe(1)
      expect(result.sessionOrder).toEqual(['1', '2'])
      expect(result.sessions.has('2')).toBe(false)
    })

    it('should skip incomplete sessions (missing server file)', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      zip.file('raw/2_c.txt', 'GET /test2 HTTP/1.1\r\nHost: example.com\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      // Session 2 is skipped from sessions map because it has no server file
      // But sessionOrder still includes it as an ID that was discovered
      expect(result.sessions.size).toBe(1)
      expect(result.sessionOrder).toEqual(['1', '2'])
      expect(result.sessions.has('2')).toBe(false)
    })

    it('should ignore non-raw files', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      zip.file('metadata.xml', '<metadata></metadata>')
      zip.file('other/file.txt', 'ignored')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.size).toBe(1)
    })

    it('should ignore directories in raw folder', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      zip.folder('raw/subdir')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.size).toBe(1)
    })

    it('should throw error when no valid sessions found', async () => {
      const zip = new JSZip()
      zip.file('metadata.xml', '<metadata></metadata>')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      await expect(SazParserService.parse(file)).rejects.toThrow(
        "Invalid SAZ Structure. File must contain a 'raw/' folder."
      )
    })

    it('should throw error when raw folder is empty', async () => {
      const zip = new JSZip()
      zip.folder('raw')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      await expect(SazParserService.parse(file)).rejects.toThrow(
        "Invalid SAZ Structure. File must contain a 'raw/' folder."
      )
    })

    it('should construct full URL with host header', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /api/users?page=1 HTTP/1.1\r\nHost: api.example.com:8080\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.get('1')!.url).toBe('https://api.example.com:8080/api/users?page=1')
    })

    it('should use URL as-is when no host header present', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /api/test HTTP/1.1\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.get('1')!.url).toBe('/api/test')
    })

    it('should preserve request and response raw data', async () => {
      const zip = new JSZip()
      const clientData = 'POST /api/data HTTP/1.1\r\nHost: example.com\r\n\r\n{"test":true}'
      const serverData = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"result":"ok"}'
      
      zip.file('raw/1_c.txt', clientData)
      zip.file('raw/1_s.txt', serverData)
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.get('1')!.rawClient).toBe(clientData)
      expect(result.sessions.get('1')!.rawServer).toBe(serverData)
    })

    it('should handle CONNECT method requests', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'CONNECT server.example.com:443 HTTP/1.1\r\nHost: server.example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 Connection Established\r\n\r\n')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      expect(result.sessions.get('1')!.method).toBe('CONNECT')
    })

    it('should handle various HTTP methods', async () => {
      const zip = new JSZip()
      
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
      
      for (let i = 0; i < methods.length; i++) {
        const method = methods[i]
        zip.file(`raw/${i + 1}_c.txt`, `${method} /test HTTP/1.1\r\nHost: example.com\r\n\r\n`)
        zip.file(`raw/${i + 1}_s.txt`, 'HTTP/1.1 200 OK\r\n\r\n')
      }
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      for (let i = 0; i < methods.length; i++) {
        expect(result.sessions.get(`${i + 1}`)!.method).toBe(methods[i])
      }
    })

    it('should handle sessions with binary response bodies', async () => {
      const zip = new JSZip()
      
      zip.file('raw/1_c.txt', 'GET /image.png HTTP/1.1\r\nHost: cdn.example.com\r\n\r\n')
      zip.file('raw/1_s.txt', 'HTTP/1.1 200 OK\r\nContent-Type: image/png\r\n\r\n\x89PNG binary data')
      
      const blob = await zip.generateAsync({ type: 'blob' })
      const file = new File([blob], 'test.saz', { type: 'application/zip' })
      
      const result = await SazParserService.parse(file)
      
      const session = result.sessions.get('1')!
      expect(session.response.headers.get('content-type')).toBe('image/png')
      expect(session.response.bodyAsArrayBuffer.byteLength).toBeGreaterThan(0)
    })
  })
})
