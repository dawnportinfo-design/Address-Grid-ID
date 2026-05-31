export type AgidApiCacheState = 'hit' | 'miss' | 'stale' | 'none';

export type AgidApiResult<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  sources: string[];
  warnings: string[];
  cache?: AgidApiCacheState;
  requestId: string;
};

export type AgidFetchOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
  retryUnsafe?: boolean;
  requireOnline?: boolean;
  source?: string;
  fetcher?: typeof fetch;
};

export class AgidHttpError extends Error {
  status?: number;
  code: 'OFFLINE' | 'TIMEOUT' | 'NETWORK' | 'HTTP' | 'BAD_JSON';
  requestId: string;

  constructor(
    message: string,
    options: {
      code: AgidHttpError['code'];
      requestId: string;
      status?: number;
    },
  ) {
    super(message);
    this.name = 'AgidHttpError';
    this.code = options.code;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

function hasNavigatorOnlineState() {
  return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean';
}

function createRequestId() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `agid-${Date.now().toString(36)}-${randomPart}`;
}

function methodAllowsRetry(method: string, retryUnsafe?: boolean) {
  return retryUnsafe || ['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());
}

function shouldRetryStatus(status: number) {
  return status === 408 || status === 429 || status >= 500;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function normalizeAgidApiResult<T>(
  value: unknown,
  fallback: {
    requestId: string;
    source?: string;
    ok?: boolean;
  },
): AgidApiResult<T> {
  if (value && typeof value === 'object' && 'ok' in value && 'requestId' in value) {
    const result = value as Partial<AgidApiResult<T>>;
    return {
      ok: Boolean(result.ok),
      data: result.data,
      error: result.error,
      confidence: result.confidence,
      sources: Array.isArray(result.sources) ? result.sources : fallback.source ? [fallback.source] : [],
      warnings: Array.isArray(result.warnings) ? result.warnings : [],
      cache: result.cache,
      requestId: typeof result.requestId === 'string' ? result.requestId : fallback.requestId,
    };
  }

  return {
    ok: fallback.ok ?? true,
    data: value as T,
    sources: fallback.source ? [fallback.source] : [],
    warnings: [],
    cache: 'none',
    requestId: fallback.requestId,
  };
}

export async function agidFetch<T = unknown>(
  url: string,
  options: AgidFetchOptions = {},
): Promise<AgidApiResult<T>> {
  const {
    timeoutMs = 20000,
    retries = 1,
    retryUnsafe = false,
    requireOnline = false,
    source,
    fetcher = fetch,
    ...requestOptions
  } = options;
  const requestId = createRequestId();
  const method = (requestOptions.method || 'GET').toString().toUpperCase();

  if (requireOnline && hasNavigatorOnlineState() && navigator.onLine === false) {
    throw new AgidHttpError('Network is offline', { code: 'OFFLINE', requestId });
  }

  let attempt = 0;
  let lastError: unknown;
  const maxAttempts = Math.max(1, retries + 1);

  while (attempt < maxAttempts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const headers = new Headers(requestOptions.headers);
    headers.set('X-AGID-Request-ID', requestId);

    try {
      const response = await fetcher(url, {
        ...requestOptions,
        signal: requestOptions.signal || controller.signal,
        headers,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        if (
          attempt + 1 < maxAttempts
          && methodAllowsRetry(method, retryUnsafe)
          && shouldRetryStatus(response.status)
        ) {
          attempt += 1;
          await delay(300 * attempt);
          continue;
        }
        throw new AgidHttpError(`HTTP ${response.status}`, {
          code: 'HTTP',
          requestId,
          status: response.status,
        });
      }

      try {
        const json = await response.json();
        return normalizeAgidApiResult<T>(json, { requestId, source });
      } catch (error) {
        throw new AgidHttpError('Invalid JSON response', { code: 'BAD_JSON', requestId });
      }
    } catch (error: any) {
      clearTimeout(timeout);
      lastError = error;

      const isAbort = error?.name === 'AbortError';
      const canRetry = attempt + 1 < maxAttempts && methodAllowsRetry(method, retryUnsafe);
      if (canRetry) {
        attempt += 1;
        await delay(isAbort ? 250 : 500 * attempt);
        continue;
      }

      if (error instanceof AgidHttpError) throw error;
      throw new AgidHttpError(isAbort ? 'Request timed out' : 'Network request failed', {
        code: isAbort ? 'TIMEOUT' : 'NETWORK',
        requestId,
      });
    }
  }

  throw new AgidHttpError(lastError instanceof Error ? lastError.message : 'Network request failed', {
    code: 'NETWORK',
    requestId,
  });
}
