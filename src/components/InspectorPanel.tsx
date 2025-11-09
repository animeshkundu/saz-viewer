import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Code, ListBullets, FileMagnifyingGlass, FileCode } from '@phosphor-icons/react'
import type { ParsedMessage } from '@/lib/types'
import { SyntaxUtil, HexUtil } from '@/lib/syntax-util'

interface InspectorPanelProps {
  message: ParsedMessage
  rawMessage: string
  title: string
  statusCode?: number
  statusText?: string
}

export function InspectorPanel({ message, rawMessage, title, statusCode, statusText }: InspectorPanelProps) {
  const contentType = message.headers.get('content-type') || ''
  const contentLength = message.headers.get('content-length') || message.bodyAsArrayBuffer.byteLength

  function getDefaultTab(ct: string): string {
    if (ct.includes('application/json') || ct.includes('application/vnd.api+json')) {
      return 'json'
    }
    if (ct.includes('application/xml') || ct.includes('text/xml')) {
      return 'xml'
    }
    if (
      ct.includes('image/') ||
      ct.includes('application/octet-stream') ||
      ct.includes('application/pdf')
    ) {
      return 'hexview'
    }
    return 'headers'
  }

  const [activeTab, setActiveTab] = useState<string>(() => getDefaultTab(contentType))
  const hexViewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === 'hexview' && hexViewRef.current) {
      HexUtil.render(hexViewRef.current, message.bodyAsArrayBuffer)
    }
  }, [activeTab, message.bodyAsArrayBuffer])

  

  const shouldShowTab = (tab: string): boolean => {
    switch (tab) {
      case 'json':
        return (
          contentType.includes('application/json') ||
          contentType.includes('application/vnd.api+json')
        )
      case 'xml':
        return (
          contentType.includes('application/xml') ||
          contentType.includes('text/xml')
        )
      case 'hexview':
        return (
          contentType.includes('image/') ||
          contentType.includes('application/octet-stream') ||
          contentType.includes('application/pdf') ||
          message.bodyAsArrayBuffer.byteLength > 0
        )
      default:
        return true
    }
  }

  const formatJson = (text: string): string => {
    try {
      const parsed = JSON.parse(text)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return text
    }
  }

  const formatBytes = (bytes: number | string): string => {
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
    if (isNaN(num)) return '0 B'
    if (num === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(num) / Math.log(k))
    return `${(num / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
  }

  const getStatusCodeColor = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) return 'text-emerald-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600'
    if (statusCode >= 400 && statusCode < 600) return 'text-red-600'
    return 'text-neutral-500'
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-2.5 border-b border-neutral-200 bg-white flex items-center justify-between">
        <h3 className="font-semibold text-sm text-neutral-800">{title}</h3>
        <div className="flex items-center gap-3">
          {statusCode !== undefined && (
            <span className={`text-[11px] font-mono font-bold ${getStatusCodeColor(statusCode)}`}>
              Status: {statusCode} {statusText}
            </span>
          )}
          {contentLength && (
            <span className="text-[11px] font-mono text-neutral-500">
              Size: {formatBytes(contentLength)}
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-neutral-200 bg-white h-auto p-0">
          <TabsTrigger
            value="headers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-600 px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-neutral-600 hover:bg-neutral-100"
          >
            <ListBullets size={14} weight="bold" className="shrink-0" />
            <span>Headers</span>
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold shrink-0 bg-neutral-200 text-neutral-600 hover:bg-neutral-200">
              {message.headers.size}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="raw"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-600 px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-neutral-600 hover:bg-neutral-100"
          >
            <Code size={14} weight="bold" className="shrink-0" />
            <span>Raw</span>
          </TabsTrigger>
          {shouldShowTab('json') && (
            <TabsTrigger
              value="json"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-600 px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              <Code size={14} weight="bold" className="shrink-0" />
              <span>JSON</span>
            </TabsTrigger>
          )}
          {shouldShowTab('xml') && (
            <TabsTrigger
              value="xml"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-600 px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              <FileCode size={14} weight="bold" className="shrink-0" />
              <span>XML</span>
            </TabsTrigger>
          )}
          {shouldShowTab('hexview') && (
            <TabsTrigger
              value="hexview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50/50 data-[state=active]:text-blue-600 px-3 py-2 text-xs font-medium flex items-center gap-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              <FileMagnifyingGlass size={14} weight="bold" className="shrink-0" />
              <span>Hex</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 overflow-hidden bg-white">
          <TabsContent value="headers" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
              <div className="p-0">
                <Table>
                  <TableBody>
                    {Array.from(message.headers.entries()).map(([key, value]) => (
                      <TableRow 
                        key={key} 
                        className="hover:bg-neutral-50/80 transition-colors border-b border-neutral-200/80"
                      >
                        <TableCell className="font-mono text-xs font-semibold w-[200px] text-neutral-800 py-2.5 px-4 align-top">
                          {key}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-neutral-600 py-2.5 px-4 break-all">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
                    <div className="bg-white">
                      <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all text-neutral-800 leading-relaxed">
                  {rawMessage}
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>

          {shouldShowTab('json') && (
            <TabsContent value="json" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <div className="bg-white">
                  <pre
                    className="p-4 text-xs font-mono leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: SyntaxUtil.highlight(formatJson(message.rawBody), 'json'),
                    }}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {shouldShowTab('xml') && (
            <TabsContent value="xml" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <div className="bg-white">
                  <pre
                    className="p-4 text-xs font-mono leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: SyntaxUtil.highlight(message.rawBody, 'xml'),
                    }}
                  />
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {shouldShowTab('hexview') && (
            <TabsContent value="hexview" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <div className="bg-white">
                  <div ref={hexViewRef} className="p-4" />
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
