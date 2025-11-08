export interface SazArchive {
  sessions: Map<string, Session>;
  sessionOrder: string[];
}

export interface Session {
  id: string;
  rawClient: string;
  rawServer: string;
  request: ParsedHttpRequest;
  response: ParsedHttpResponse;
  url: string;
  method: string;
}

export interface ParsedMessage {
  startLine: string;
  headers: Map<string, string>;
  rawBody: string;
  bodyAsArrayBuffer: ArrayBuffer;
}

export interface ParsedHttpRequest extends ParsedMessage {
  method: string;
  url: string;
  httpVersion: string;
}

export interface ParsedHttpResponse extends ParsedMessage {
  httpVersion: string;
  statusCode: number;
  statusText: string;
}
