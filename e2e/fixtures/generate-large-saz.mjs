import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import JSZip from 'jszip'

const outputPath = resolve(process.argv[2] ?? 'e2e/fixtures/generated/large-review.saz')
const sessionCount = Number.parseInt(process.argv[3] ?? '1500', 10)

if (!Number.isSafeInteger(sessionCount) || sessionCount < 1) {
  throw new Error('Session count must be a positive integer.')
}

const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'CONNECT']
const hosts = [
  'identity.example.dev',
  'assets.example.dev',
  'events.example.dev',
  'api.example.dev',
]
const routes = ['events', 'checkout', 'search', 'profiles', 'reports', 'accounts']
const statuses = [
  [403, 'Forbidden'],
  [201, 'Created'],
  [404, 'Not Found'],
  [204, 'No Content'],
  [429, 'Too Many Requests'],
  [301, 'Moved Permanently'],
  [500, 'Internal Server Error'],
  [304, 'Not Modified'],
  [502, 'Bad Gateway'],
  [400, 'Bad Request'],
  [503, 'Service Unavailable'],
  [401, 'Unauthorized'],
  [200, 'OK'],
]

function createJsonBody(id, statusCode, route) {
  return JSON.stringify({
    session: id,
    status: statusCode,
    ok: statusCode >= 200 && statusCode < 300,
    traceId: `trace-${id}-${7918 + id}`,
    data: Array.from({ length: 18 }, (_, index) => ({
      index,
      value: `${route}-${id}-${index}`,
      active: index % 2 === 0,
    })),
  })
}

function createResponseBody(id, statusCode, route) {
  switch ((id - 1) % 4) {
    case 0:
      return {
        contentType: 'application/json',
        body: createJsonBody(id, statusCode, route),
      }
    case 1:
      return {
        contentType: 'application/xml',
        body: `<exchange id="${id}"><route>${route}</route><status>${statusCode}</status></exchange>`,
      }
    case 2:
      return {
        contentType: 'text/html',
        body: `<!doctype html><title>Exchange ${id}</title><main data-route="${route}">Status ${statusCode}</main>`,
      }
    default:
      return {
        contentType: 'application/octet-stream',
        body: Array.from({ length: 1024 }, (_, index) => String.fromCharCode(32 + ((id + index) % 90))).join(''),
      }
  }
}

const zip = new JSZip()

for (let id = 1; id <= sessionCount; id += 1) {
  const method = methods[(id - 1) % methods.length]
  const host = hosts[(id - 1) % hosts.length]
  const route = routes[(id - 1) % routes.length]
  const [statusCode, statusText] = statuses[(id - 1) % statuses.length]
  const path = `/v2/${route}/${id}?trace=req-${id}`
  const requestBody = ['POST', 'PUT', 'PATCH'].includes(method)
    ? JSON.stringify({ session: id, route, operation: method.toLowerCase() })
    : ''
  const requestBodyHeaders = requestBody
    ? `Content-Type: application/json\r\nContent-Length: ${Buffer.byteLength(requestBody)}\r\n`
    : ''
  const { contentType, body } = createResponseBody(id, statusCode, route)

  zip.file(
    `raw/${id}_c.txt`,
    `${method} ${path} HTTP/1.1\r\nHost: ${host}\r\nUser-Agent: SAZ-Viewer-Review/1.0\r\nAccept: application/json, application/xml;q=0.8\r\n${requestBodyHeaders}X-Trace-Id: trace-${id}-${7918 + id}\r\n\r\n${requestBody}`
  )
  zip.file(
    `raw/${id}_s.txt`,
    `HTTP/1.1 ${statusCode} ${statusText}\r\nContent-Type: ${contentType}\r\nContent-Length: ${Buffer.byteLength(body)}\r\nX-Trace-Id: trace-${id}-${7918 + id}\r\n\r\n${body}`
  )
}

const archive = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
})

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(outputPath, archive)
console.log(`Generated ${sessionCount.toLocaleString()} sessions at ${outputPath}`)
