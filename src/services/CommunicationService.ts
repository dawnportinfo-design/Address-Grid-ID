import { agidFetch, type AgidApiResult } from '../lib/agidHttpClient';

export type CommunicationHealth = {
  rest: boolean;
  sse: boolean;
  localFirstSync: boolean;
  externalApiProxy: boolean;
};

export function fetchCommunicationHealth(fetcher?: typeof fetch): Promise<AgidApiResult<CommunicationHealth>> {
  return agidFetch<CommunicationHealth>('/api/communication/health', {
    source: 'agid-server',
    timeoutMs: 8000,
    retries: 1,
    fetcher,
  });
}

export function openAgidJobEventStream(
  jobId: string,
  handlers: {
    onMessage?: (event: MessageEvent) => void;
    onError?: (event: Event) => void;
    onReady?: (event: MessageEvent) => void;
    onHeartbeat?: (event: MessageEvent) => void;
  } = {},
) {
  if (typeof EventSource === 'undefined') {
    throw new Error('EventSource is not available in this environment');
  }

  const safeJobId = encodeURIComponent(jobId.trim() || 'default');
  const source = new EventSource(`/api/jobs/${safeJobId}/events`);
  if (handlers.onMessage) source.onmessage = handlers.onMessage;
  if (handlers.onError) source.onerror = handlers.onError;
  if (handlers.onReady) source.addEventListener('ready', handlers.onReady);
  if (handlers.onHeartbeat) source.addEventListener('heartbeat', handlers.onHeartbeat);
  return source;
}

