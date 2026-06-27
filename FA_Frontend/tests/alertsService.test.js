const test = require('node:test');
const assert = require('node:assert/strict');
const alertsService = require('../services/alertsService');

test('getAlerts returns a fallback alert list when no external API is configured', async () => {
  const alerts = await alertsService.getAlerts();
  assert.ok(Array.isArray(alerts));
  assert.ok(alerts.length > 0);
  assert.ok(alerts[0].title);
});

test('getAlertBySlug resolves the crypto article slug from the fallback data', async () => {
  const article = await alertsService.getAlertBySlug('crypto-investment-pitch');
  assert.ok(article);
  assert.equal(article.title, 'Crypto Investment Pitch');
});
