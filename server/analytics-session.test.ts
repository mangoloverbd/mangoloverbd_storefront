import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { readAnalyticsSessionCookie } from './analytics-session.ts';
import { registerRoutes } from './routes.ts';
import { createOrderHandler, processOrder as productionOrder, validateOrder } from '../api/orders.ts';
import { processOrder as localOrder, orderRequestSchema } from './order-service.ts';

const visit = '9f8e7d6c-5b4a-4c3d-9e2f-1a0b9c8d7e6f';
const product = '11111111-1111-4111-8111-111111111111';
const order = { bundleTitle: 'Honey', bundleDetails: '500g', bundlePrice: 100, quantity: 1, deliveryCharge: 0,
  customerName: 'Test Customer', phone: '01712345678', address: 'House 1 Road 2 Dhaka', paymentMethod: 'cash_on_delivery',
  items: [{ productId: product, variantId: product, quantity: 1 }] };

test('reads one well-formed tracker visit cookie only', () => {
  const read = (cookie: string) => readAnalyticsSessionCookie({ headers: { cookie } });
  assert.equal(read(`ms_vid=x; ms_sid=${visit.toUpperCase()}`), visit);
  assert.equal(read(`ms_sid=${visit}; ms_sid=${visit}`), undefined);
  assert.equal(read('ms_sid=not-a-visit'), undefined);
  assert.equal(read(''), undefined);
});

for (const platform of ['express', 'vercel'] as const) test(`${platform} order route passes the visit cookie to the Suite call`, async () => {
  const calls: Array<Record<string, unknown>> = [];
  const submitOrder = async (_body: unknown, options = {}) => { calls.push(options); return { orderRef: 'ML-1', decision: 'allow' as const }; };
  const app = express(); app.use(express.json()); const server = createServer(app);
  if (platform === 'express') await registerRoutes(server, app, { processOrder: submitOrder });
  else app.post('/api/orders', createOrderHandler({ processOrder: submitOrder }));
  server.listen(0, '127.0.0.1'); await once(server, 'listening'); const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  try {
    for (const cookie of [`ms_sid=${visit}`, 'ms_sid=forged', '']) {
      const result = await fetch(`${base}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', cookie }, body: JSON.stringify(order) });
      assert.equal(result.status, 201);
      assert.equal(calls.at(-1)!.analyticsSessionId, cookie === `ms_sid=${visit}` ? visit : undefined);
    }
  } finally { server.closeAllConnections(); server.close(); }
});

for (const [label, service, body] of [
  ['production', productionOrder, validateOrder(order)],
  ['local', localOrder, orderRequestSchema.parse(order)],
] as const) test(`${label} order service sends the visit as a header, never in the order body`, async () => {
  let headers = new Headers(); let payload: Record<string, unknown> = {};
  await service(body as never, { merchantSuiteUrl: 'https://suite.invalid', storefrontHandle: 'mangoloverbd', analyticsSessionId: visit,
    fetchImpl: async (_target, init) => { headers = new Headers(init?.headers); payload = JSON.parse(String(init?.body)); return new Response(JSON.stringify({ orderRef: 'ML-1' }), { status: 201 }); } });
  assert.equal(headers.get('x-mlbd-analytics-session-id'), visit);
  assert.equal(JSON.stringify(payload).includes(visit), false);
});
