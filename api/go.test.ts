import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { createGoHandler } from './go.ts';
const config = { merchantSuiteUrl: 'https://suite.invalid', storefrontHandle: 'mangolover', secret: 'test-campaign-context-secret-0123456789abcdef', local: true };
test('Vercel navigation is 302/no-store and appends cookie without replacing device cookie', async () => {
  const handler = createGoHandler({ ...config, fetchImpl: async () => new Response(JSON.stringify({ clickId: '11111111-1111-4111-8111-111111111111', destinationPath: '/', utm: { utm_campaign: 'himsagar-reel' } })) });
  const server = createServer((req, res) => { res.setHeader('Set-Cookie', 'mlbd_did=device; HttpOnly'); void handler(req, res); });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const port = (server.address() as { port: number }).port;
  try {
    const result = await fetch(`http://127.0.0.1:${port}/go/himsagar-reel?fbclid=abc`, { redirect: 'manual' });
    assert.equal(result.status, 302); assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(result.headers.getSetCookie().length, 2); assert.match(result.headers.get('location')!, /fbclid=abc/);
    const head = await fetch(`http://127.0.0.1:${port}/go/himsagar-reel`, { method: 'HEAD', redirect: 'manual' });
    assert.equal(head.status, 302); assert.equal(head.headers.getSetCookie().length, 1);
  } finally { server.closeAllConnections(); server.close(); }
});
test('apex navigation canonicalizes before any click/cookie and keeps query', async () => {
  let calls = 0;
  const handler = createGoHandler({ ...config, local: false, fetchImpl: async () => { calls++; throw new Error('unexpected'); } });
  const headers: Record<string, unknown> = {}; let status;
  await handler({ url: '/go/himsagar-reel?fbclid=abc', method: 'GET', headers: { host: 'mangolover.com.bd' } } as never,
    { setHeader: (key: string, value: unknown) => { headers[key] = value; }, getHeader: () => undefined, set statusCode(code: number) { status = code; }, end() {} } as never);
  assert.equal(calls, 0); assert.equal(status, 302); assert.equal(headers.Location, 'https://www.mangolover.com.bd/go/himsagar-reel?fbclid=abc');
});
