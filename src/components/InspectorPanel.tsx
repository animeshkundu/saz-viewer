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
    // Pastel status colors
    if (statusCode >= 200 && statusCode < 300) return 'text-[#5FB878]' // Soft green
    if (statusCode >= 300 && statusCode < 400) return 'text-[#6BA3D4]' // Soft blue
    if (statusCode >= 400 && statusCode < 600) return 'text-[#E67E82]' // Soft red/coral
    return 'text-muted-foreground'
  }

  return (
    <div className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-card via-primary/5 to-card backdrop-blur-md flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">{title}</h3>
        <div className="flex items-center gap-3">
          {statusCode !== undefined && (
            <span className={`text-xs font-mono font-bold ${getStatusCodeColor(statusCode)} bg-background/80 px-2 py-1 rounded-md`}>
              Status: {statusCode} {statusText}
            </span>
          )}
          {contentLength && (
            <span className="text-xs font-mono text-muted-foreground bg-background/80 px-2 py-1 rounded-md">
              Size: {formatBytes(contentLength)}
            </span>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-card/30 backdrop-blur-sm h-auto p-0">
          <TabsTrigger
            value="headers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 text-xs font-medium flex items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
          >
            <ListBullets size={14} weight="bold" className="shrink-0" />
            <span>Headers</span>
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-semibold shrink-0 bg-muted text-muted-foreground hover:bg-muted">
              {message.headers.size}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="raw"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 text-xs font-medium flex items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
          >
            <Code size={14} weight="bold" className="shrink-0" />
            <span>Raw</span>
          </TabsTrigger>
          {shouldShowTab('json') && (
            <TabsTrigger
              value="json"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 text-xs font-medium flex items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
            >
              <Code size={14} weight="bold" className="shrink-0" />
              <span>JSON</span>
            </TabsTrigger>
          )}
          {shouldShowTab('xml') && (
            <TabsTrigger
              value="xml"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 text-xs font-medium flex items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
            >
              <FileCode size={14} weight="bold" className="shrink-0" />
              <span>XML</span>
            </TabsTrigger>
          )}
          {shouldShowTab('hexview') && (
            <TabsTrigger
              value="hexview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2.5 text-xs font-medium flex items-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
            >
              <FileMagnifyingGlass size={14} weight="bold" className="shrink-0" />
              <span>Hex</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 overflow-hidden bg-background/30 backdrop-blur-sm">
          <TabsContent value="headers" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
              <div className="p-0">
                <Table>
                  <TableBody>
                    {Array.from(message.headers.entries()).map(([key, value]) => (
                      <TableRow 
                        key={key} 
                        className="hover:bg-primary/5 transition-colors border-b border-border/30"
                      >
                        <TableCell className="font-mono text-xs font-semibold w-[200px] text-foreground py-3 px-4 align-top">
                          {key}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground py-3 px-4 break-all">
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
                    <div className="bg-background/50">
                      <pre className="p-5 text-xs font-mono whitespace-pre-wrap break-all text-foreground leading-relaxed">
                  {rawMessage}
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>

          {shouldShowTab('json') && (
            <TabsContent value="json" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <div className="bg-background/50">
                  <pre
                    className="p-5 text-xs font-mono leading-relaxed"
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
                <div className="bg-background/50">
                  <pre
                    className="p-5 text-xs font-mono leading-relaxed"
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
                <div className="bg-background/50">
                  <div ref={hexViewRef} className="p-5" />
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
