import assert from 'node:assert/strict';
import test from 'node:test';
import { isBot, mergeDestination, normalizeSlug, signCookie, validateRoute } from './campaign-edge.ts';
import { signCampaignClick } from './campaign-links.ts';

const secret = 'campaign-edge-secret-for-tests-0123456789abcdef';

test('edge click cookies match the Node signer used by checkout', async () => {
  const id = '11111111-1111-4111-8111-111111111111';
  assert.equal(await signCookie(id, secret), signCampaignClick(id, secret));
});

test('only strict slugs route and query values override campaign defaults without losing fragments', () => {
  assert.equal(normalizeSlug('bori-campaign-1'), 'bori-campaign-1');
  assert.equal(normalizeSlug('../private'), undefined);
  assert.equal(normalizeSlug('_refresh'), undefined);
  assert.equal(mergeDestination('/product/homemade-pumpkin-bori?variant=large#buy', '?utm_campaign=caller&fbclid=abc', {
    utm_source: 'facebook', utm_medium: 'campaign_link', utm_campaign: 'bori-campaign-1',
  }), '/product/homemade-pumpkin-bori?variant=large&utm_campaign=caller&fbclid=abc&utm_source=facebook&utm_medium=campaign_link#buy');
});

test('route data rejects off-site, looping, and malformed destinations', () => {
  const route = (destinationPath: string) => validateRoute({ linkId: '11111111-1111-4111-8111-111111111111', destinationPath, utm: {} });
  assert.equal(route('/product/homemade-pumpkin-bori')?.destinationPath, '/product/homemade-pumpkin-bori');
  assert.equal(route('//evil.example/x'), undefined);
  assert.equal(route('/go/bori-campaign-1'), undefined);
  assert.equal(route('/%2F%2Fevil.example'), undefined);
  assert.equal(validateRoute({ linkId: 'nope', destinationPath: '/', utm: {} }), undefined);
});

test('bot classification excludes crawlers from attribution', () => {
  assert.equal(isBot('facebookexternalhit/1.1'), true);
  assert.equal(isBot('WhatsApp/2.23'), true);
  assert.equal(isBot('Mozilla/5.0 (iPhone; CPU iPhone OS)'), false);
});
