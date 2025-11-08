import JSZip from 'jszip'
import { HttpParserUtil } from './http-parser'
import type { SazArchive, Session } from './types'

export class SazParserService {
  static async parse(file: File): Promise<SazArchive> {
    const zip = await JSZip.loadAsync(file)

    const sessionGroups = new Map<string, { [key: string]: JSZip.JSZipObject }>()
    const sessionIds = new Set<string>()

    for (const [filename, fileObj] of Object.entries(zip.files)) {
      if (!filename.startsWith('raw/')) continue
      if (fileObj.dir) continue

      const match = filename.match(/raw\/(\d+)_([a-z])\.txt$/)
      if (!match) continue

      const [, id, type] = match
      sessionIds.add(id)

      if (!sessionGroups.has(id)) {
        sessionGroups.set(id, {})
      }
      sessionGroups.get(id)![`_${type}.txt`] = fileObj
    }

    const sessionOrder = Array.from(sessionIds).sort((a, b) => {
      return parseInt(a, 10) - parseInt(b, 10)
    })

    const sessions = new Map<string, Session>()

    for (const id of sessionOrder) {
      const group = sessionGroups.get(id)
      if (!group) continue

      const cFile = group['_c.txt']
      const sFile = group['_s.txt']

      if (!cFile || !sFile) continue

      const rawClient = await cFile.async('string')
      const rawServer = await sFile.async('string')

      const request = HttpParserUtil.parseRequest(rawClient)
      const response = HttpParserUtil.parseResponse(rawServer)

      const url = request.url
      const host = request.headers.get('host') || ''
      const fullUrl = host ? `https://${host}${url}` : url

      const session: Session = {
        id,
        rawClient,
        rawServer,
        request,
        response,
        url: fullUrl,
        method: request.method,
      }

      sessions.set(id, session)
    }

    if (sessions.size === 0) {
      throw new Error("Invalid SAZ Structure. File must contain a 'raw/' folder.")
    }

    return {
      sessions,
      sessionOrder,
    }
  }
}
