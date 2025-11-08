import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Code, ListBullets } from '@phosphor-icons/react'
import type { ParsedMessage } from '@/lib/types'
import { SyntaxUtil, HexUtil } from '@/lib/syntax-util'

interface InspectorPanelProps {
  message: ParsedMessage
  rawMessage: string
  title: string
}

export function InspectorPanel({ message, rawMessage, title }: InspectorPanelProps) {
  const contentType = message.headers.get('content-type') || ''
  const [activeTab, setActiveTab] = useState<string>('headers')
  const hexViewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const defaultTab = getDefaultTab(contentType)
    setActiveTab(defaultTab)
  }, [contentType, message])

  useEffect(() => {
    if (activeTab === 'hexview' && hexViewRef.current) {
      HexUtil.render(hexViewRef.current, message.bodyAsArrayBuffer)
    }
  }, [activeTab, message.bodyAsArrayBuffer])

  const getDefaultTab = (ct: string): string => {
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

  return (
    <div className="h-full flex flex-col bg-card border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 gap-1">
          <TabsTrigger
            value="headers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-accent/5 gap-2 px-4"
          >
            <ListBullets size={16} />
            Headers
          </TabsTrigger>
          <TabsTrigger
            value="raw"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-accent/5 gap-2 px-4"
          >
            <Code size={16} />
            Raw
          </TabsTrigger>
          {shouldShowTab('json') && (
            <TabsTrigger
              value="json"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-accent/5 px-4"
            >
              JSON
            </TabsTrigger>
          )}
          {shouldShowTab('xml') && (
            <TabsTrigger
              value="xml"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-accent/5 px-4"
            >
              XML
            </TabsTrigger>
          )}
          {shouldShowTab('hexview') && (
            <TabsTrigger
              value="hexview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-accent/5 px-4"
            >
              HexView
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="headers" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <Table>
                  <TableBody>
                    {Array.from(message.headers.entries()).map(([key, value]) => (
                      <TableRow key={key} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-semibold w-1/3 text-foreground/90">
                          {key}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
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
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all text-foreground/80 leading-relaxed">
                {rawMessage}
              </pre>
            </ScrollArea>
          </TabsContent>

          {shouldShowTab('json') && (
            <TabsContent value="json" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <pre
                  className="p-4 text-xs font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: SyntaxUtil.highlight(formatJson(message.rawBody), 'json'),
                  }}
                />
              </ScrollArea>
            </TabsContent>
          )}

          {shouldShowTab('xml') && (
            <TabsContent value="xml" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <pre
                  className="p-4 text-xs font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: SyntaxUtil.highlight(message.rawBody, 'xml'),
                  }}
                />
              </ScrollArea>
            </TabsContent>
          )}

          {shouldShowTab('hexview') && (
            <TabsContent value="hexview" className="h-full m-0 p-0">
              <ScrollArea className="h-full">
                <div ref={hexViewRef} className="p-4" />
              </ScrollArea>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  )
}
