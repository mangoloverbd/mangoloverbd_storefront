import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolveCampaignRedirect, type CampaignRedirectOptions } from '../server/campaign-links.js';

export function createGoHandler(options: CampaignRedirectOptions = {}) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD'); res.statusCode = 405; res.end(); return;
    }
    const url = new URL(req.url || '/', 'https://www.mangolover.com.bd');
    const local = options.local ?? process.env.NODE_ENV !== 'production';
    if (!local && req.headers.host === 'mangolover.com.bd') {
      res.statusCode = 302; res.setHeader('Location', `https://www.mangolover.com.bd${url.pathname}${url.search}`); res.end(); return;
    }
    let slug: string | undefined;
    if (url.pathname.startsWith('/go/')) {
      try { slug = decodeURIComponent(url.pathname.slice(4)); } catch { /* Invalid path falls back. */ }
    } else {
      // Vercel rewrite supplies this private routing parameter. Do not carry it
      // into the storefront destination; ordinary incoming keys are preserved.
      slug = url.searchParams.get('__campaign_slug') ?? undefined;
      url.searchParams.delete('__campaign_slug');
    }
    const result = await resolveCampaignRedirect({ headers: req.headers, socket: req.socket, method: req.method, url: `${url.pathname}${url.search}` }, slug, options);
    if (result.cookie) {
      const existing = res.getHeader('Set-Cookie');
      res.setHeader('Set-Cookie', [...(Array.isArray(existing) ? existing.map(String) : existing ? [String(existing)] : []), result.cookie]);
    }
    res.statusCode = 302; res.setHeader('Location', result.location); res.end();
  };
}
export default createGoHandler();
