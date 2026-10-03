import { getCache, ipAddress, next } from '@vercel/functions';
import { createCampaignMiddleware } from './server/campaign-middleware.js';

// Vercel Routing Middleware. Only campaign links run here; every other storefront
// request skips it entirely.
export const config = { matcher: ['/go/:path*'] };

export default function middleware(request: Request, context: { waitUntil(promise: Promise<unknown>): void }) {
  return createCampaignMiddleware({
    cache: getCache({ namespace: 'mlbd-campaign' }),
    waitUntil: promise => context.waitUntil(promise),
    next: () => next(),
    clientIp: req => ipAddress(req),
    merchantSuiteUrl: 'https://admin.mangolover.com.bd',
    storefrontHandle: 'mangoloverbd',
    secret: process.env.CAMPAIGN_EDGE_SECRET,
  })(request);
}
