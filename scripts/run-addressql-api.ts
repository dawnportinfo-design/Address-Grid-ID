import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { fileURLToPath } from 'node:url';

import {
  ADDRESSQL_PRACTICAL_API_LIMITS,
  buildAddressQlApiErrorResponse,
  createAddressQlPracticalApi,
  type AddressQlPracticalApiResponse,
} from '../src/lib/addressQlPracticalApi';

function writeResponse(
  response: ServerResponse,
  output: AddressQlPracticalApiResponse,
) {
  response.writeHead(output.statusCode, output.headers);
  response.end(JSON.stringify(output.body));
}

function headerMap(request: IncomingMessage): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(request.headers)
      .map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}

export function createAddressQlHttpServer(root = process.cwd()) {
  const api = createAddressQlPracticalApi(root);
  const server = createServer((request, response) => {
    const method = String(request.method || 'GET').toUpperCase();
    const path = request.url || '/';
    const contentLength = Number(request.headers['content-length'] || 0);

    if (
      Number.isFinite(contentLength)
      && contentLength > ADDRESSQL_PRACTICAL_API_LIMITS.maxBodyBytes
    ) {
      writeResponse(response, buildAddressQlApiErrorResponse(
        413,
        'body_too_large',
        'Request body exceeds the API byte limit.',
      ));
      request.resume();
      return;
    }

    if (!['POST', 'PUT', 'PATCH'].includes(method)) {
      writeResponse(response, api.handle({
        method,
        path,
        headers: headerMap(request),
        bodyBytes: 0,
      }));
      return;
    }

    const contentType = String(request.headers['content-type'] || '').toLowerCase();
    if (!contentType.startsWith('application/json')) {
      writeResponse(response, buildAddressQlApiErrorResponse(
        415,
        'unsupported_media_type',
        'POST requests require application/json.',
      ));
      request.resume();
      return;
    }

    const chunks: Buffer[] = [];
    let bytes = 0;
    let tooLarge = false;

    request.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > ADDRESSQL_PRACTICAL_API_LIMITS.maxBodyBytes) {
        tooLarge = true;
        return;
      }
      chunks.push(chunk);
    });

    request.on('end', () => {
      if (tooLarge) {
        writeResponse(response, buildAddressQlApiErrorResponse(
          413,
          'body_too_large',
          'Request body exceeds the API byte limit.',
        ));
        return;
      }

      let body: unknown;
      try {
        body = bytes ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined;
      } catch {
        writeResponse(response, buildAddressQlApiErrorResponse(
          400,
          'invalid_json',
          'Request body must contain valid JSON.',
        ));
        return;
      }

      writeResponse(response, api.handle({
        method,
        path,
        headers: headerMap(request),
        body,
        bodyBytes: bytes,
      }));
    });

    request.on('error', () => {
      if (!response.headersSent) {
        writeResponse(response, buildAddressQlApiErrorResponse(
          400,
          'request_stream_error',
          'Request stream could not be read.',
        ));
      }
    });
  });

  server.requestTimeout = 10_000;
  server.headersTimeout = 5_000;
  server.keepAliveTimeout = 5_000;
  server.maxRequestsPerSocket = 100;
  server.maxConnections = 100;
  server.on('clientError', (_error, socket) => {
    if (socket.writable) {
      socket.end(
        'HTTP/1.1 400 Bad Request\r\n'
        + 'Content-Type: application/json\r\n'
        + 'Connection: close\r\n\r\n'
        + '{"error":{"code":"bad_request"}}',
      );
    }
  });

  return server;
}

function parsePort(value: string | undefined): number {
  const port = Number(value || 8787);
  return Number.isInteger(port) && port >= 0 && port <= 65535 ? port : 8787;
}

export function runAddressQlHttpServer() {
  const host = process.env.ADDRESSQL_API_HOST || '127.0.0.1';
  const port = parsePort(process.env.ADDRESSQL_API_PORT);
  const server = createAddressQlHttpServer();
  server.listen(port, host, () => {
    const address = server.address();
    const selectedPort = typeof address === 'object' && address ? address.port : port;
    console.log(`AddressQL practical API listening on http://${host}:${selectedPort}`);
    console.log('Request bodies are processed ephemerally and are not logged by this adapter.');
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runAddressQlHttpServer();
}
