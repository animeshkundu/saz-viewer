import { useEffect, useRef, useState } from 'react'
import {
  Code,
  FileCode,
  FileMagnifyingGlass,
  ListBullets,
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HexUtil, SyntaxUtil } from '@/lib/syntax-util'
import type { ParsedMessage } from '@/lib/types'

interface InspectorPanelProps {
  message: ParsedMessage
  rawMessage: string
  title: string
  statusCode?: number
  statusText?: string
}

interface TabSelection {
  messageKey: string
  tab: string
}

const tabClassName = 'h-8 rounded-none border-b-2 border-transparent px-3 text-[10px] font-semibold text-slate-500 shadow-none transition-colors hover:bg-slate-100 hover:text-slate-800 data-[state=active]:border-cyan-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-none'

function getDefaultTab(contentType: string): string {
  if (contentType.includes('application/json') || contentType.includes('application/vnd.api+json')) {
    return 'json'
  }
  if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
    return 'xml'
  }
  if (
    contentType.includes('image/')
    || contentType.includes('application/octet-stream')
    || contentType.includes('application/pdf')
  ) {
    return 'hexview'
  }
  return 'headers'
}

function formatBytes(bytes: number | string): string {
  const value = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes
  if (isNaN(value) || value === 0) {
    return '0 B'
  }

  const unitSize = 1024
  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.floor(Math.log(value) / Math.log(unitSize))
  return `${(value / Math.pow(unitSize, unitIndex)).toFixed(1)} ${units[unitIndex]}`
}

function formatHeaderName(name: string): string {
  return name
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('-')
}

function EmptyBody() {
  return (
    <div className="flex h-full min-h-32 items-center justify-center p-8 text-center">
      <div>
        <div className="mx-auto mb-2 flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm">
          <Code size={15} />
        </div>
        <p className="text-xs font-medium text-slate-600">No message body</p>
        <p className="mt-1 text-[10px] text-slate-400">This exchange contains headers only.</p>
      </div>
    </div>
  )
}

export function InspectorPanel({
  message,
  rawMessage,
  title,
  statusCode,
  statusText,
}: InspectorPanelProps) {
  const contentType = message.headers.get('content-type') || ''
  const contentLength = message.headers.get('content-length') || message.bodyAsArrayBuffer.byteLength
  const messageKey = `${message.startLine}:${contentType}`
  const messageSummary = title === 'Request'
    ? message.startLine.replace(/^\S+\s+/, '')
    : message.startLine
  const [tabSelection, setTabSelection] = useState<TabSelection>(() => ({
    messageKey,
    tab: getDefaultTab(contentType),
  }))
  const activeTab = tabSelection.messageKey === messageKey
    ? tabSelection.tab
    : getDefaultTab(contentType)
  const hexViewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === 'hexview' && hexViewRef.current) {
      HexUtil.render(hexViewRef.current, message.bodyAsArrayBuffer)
    }
  }, [activeTab, message.bodyAsArrayBuffer])

  const shouldShowTab = (tab: string): boolean => {
    switch (tab) {
      case 'json':
        return contentType.includes('application/json')
          || contentType.includes('application/vnd.api+json')
      case 'xml':
        return contentType.includes('application/xml')
          || contentType.includes('text/xml')
      case 'hexview':
        return contentType.includes('image/')
          || contentType.includes('application/octet-stream')
          || contentType.includes('application/pdf')
          || message.bodyAsArrayBuffer.byteLength > 0
      default:
        return true
    }
  }

  const formatJson = (text: string): string => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      return text
    }
  }

  const getStatusCodeColor = (code: number): string => {
    if (code >= 200 && code < 300) {
      return 'border-emerald-200 bg-emerald-50 text-emerald-600'
    }
    if (code >= 300 && code < 400) {
      return 'border-blue-200 bg-blue-50 text-blue-600'
    }
    if (code >= 400 && code < 600) {
      return 'border-red-200 bg-red-50 text-red-600'
    }
    return 'border-slate-200 bg-slate-50 text-slate-500'
  }

  return (
    <section
      className="flex h-full flex-col bg-white"
      data-testid={`inspector-${title.toLowerCase()}`}
      aria-label={`${title} inspector`}
    >
      <header className="relative flex h-11 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-3">
        <div className={`absolute bottom-0 left-0 top-0 w-0.5 ${title === 'Request' ? 'bg-violet-500' : 'bg-cyan-500'}`} />
        <div className="flex min-w-0 items-center gap-2.5">
          <div className={`flex size-6 shrink-0 items-center justify-center rounded-md ${
            title === 'Request'
              ? 'bg-violet-50 text-violet-700'
              : 'bg-cyan-50 text-cyan-700'
          }`}>
            <Code size={13} weight="bold" />
          </div>
          <div className="flex min-w-0 items-baseline gap-2">
            <h3 className="shrink-0 text-xs font-semibold text-slate-800">{title}</h3>
            <code className="truncate font-mono text-[9px] text-slate-400" title={message.startLine}>
              {messageSummary}
            </code>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {statusCode !== undefined && (
            <span className={`rounded-md border px-2 py-1 font-mono text-[9px] font-bold ${getStatusCodeColor(statusCode)}`}>
              Status: {statusCode} {statusText}
            </span>
          )}
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[9px] text-slate-500">
            Size: {formatBytes(contentLength)}
          </span>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(tab) => setTabSelection({ messageKey, tab })}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList className="h-8 w-full shrink-0 justify-start rounded-none border-b border-slate-200 bg-slate-50 p-0">
          <TabsTrigger value="headers" className={tabClassName}>
            <ListBullets size={12} weight="bold" />
            <span>Headers</span>
            <Badge className="h-4 min-w-4 rounded px-1 text-[8px] font-bold text-slate-500 shadow-none" variant="secondary">
              {message.headers.size}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="raw" className={tabClassName}>
            <Code size={12} weight="bold" />
            <span>Raw</span>
          </TabsTrigger>
          {shouldShowTab('json') && (
            <TabsTrigger value="json" className={tabClassName}>
              <Code size={12} weight="bold" />
              <span>JSON</span>
            </TabsTrigger>
          )}
          {shouldShowTab('xml') && (
            <TabsTrigger value="xml" className={tabClassName}>
              <FileCode size={12} weight="bold" />
              <span>XML</span>
            </TabsTrigger>
          )}
          {shouldShowTab('hexview') && (
            <TabsTrigger value="hexview" className={tabClassName}>
              <FileMagnifyingGlass size={12} weight="bold" />
              <span>Hex</span>
            </TabsTrigger>
          )}
        </TabsList>

        <div className="inspector-code min-h-0 flex-1 overflow-hidden bg-slate-50/60">
          <TabsContent value="headers" className="m-0 h-full p-0">
            <ScrollArea className="h-full">
              {message.headers.size > 0 ? (
                <Table>
                  <TableBody>
                    {Array.from(message.headers.entries()).map(([key, value]) => (
                      <TableRow
                        key={key}
                        className="border-b border-slate-200/80 bg-white/80 transition-colors hover:bg-cyan-50/40"
                      >
                        <TableCell className="w-[190px] px-4 py-2 align-top font-mono text-[10px] font-semibold text-slate-700">
                          {formatHeaderName(key)}
                        </TableCell>
                        <TableCell className="break-all px-4 py-2 font-mono text-[10px] leading-5 text-slate-500">
                          {value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 font-mono text-[10px] text-slate-400">No headers recorded.</div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="m-0 h-full p-0">
            <ScrollArea className="h-full">
              {rawMessage ? (
                <pre className="p-4 font-mono text-[10px] leading-5 whitespace-pre-wrap break-all text-slate-700">
                  {rawMessage}
                </pre>
              ) : (
                <EmptyBody />
              )}
            </ScrollArea>
          </TabsContent>

          {shouldShowTab('json') && (
            <TabsContent value="json" className="m-0 h-full p-0">
              <ScrollArea className="h-full">
                {message.rawBody ? (
                  <pre
                    className="p-4 font-mono text-[10px] leading-5"
                    dangerouslySetInnerHTML={{
                      __html: SyntaxUtil.highlight(formatJson(message.rawBody), 'json'),
                    }}
                  />
                ) : (
                  <EmptyBody />
                )}
              </ScrollArea>
            </TabsContent>
          )}

          {shouldShowTab('xml') && (
            <TabsContent value="xml" className="m-0 h-full p-0">
              <ScrollArea className="h-full">
                {message.rawBody ? (
                  <pre
                    className="p-4 font-mono text-[10px] leading-5"
                    dangerouslySetInnerHTML={{
                      __html: SyntaxUtil.highlight(message.rawBody, 'xml'),
                    }}
                  />
                ) : (
                  <EmptyBody />
                )}
              </ScrollArea>
            </TabsContent>
          )}

          {shouldShowTab('hexview') && (
            <TabsContent value="hexview" className="m-0 h-full p-0">
              <ScrollArea className="h-full">
                {message.bodyAsArrayBuffer.byteLength > 0 ? (
                  <div ref={hexViewRef} className="p-4 font-mono text-[10px]" />
                ) : (
                  <EmptyBody />
                )}
              </ScrollArea>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </section>
  )
}
