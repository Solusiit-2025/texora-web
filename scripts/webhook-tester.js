#!/usr/bin/env node
/**
 * Simulate incoming webhook from Meta/Instagram/Facebook
 * Usage: node scripts/webhook-tester.js (platform) (endpoint)
 *
 * Example:
 *   node scripts/webhook-tester.js meta
 *   node scripts/webhook-tester.js tiktok
 */

const http = require('http');
const crypto = require('crypto');

const platform = process.argv[2] || 'meta';
const baseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';
const endpoint = platform === 'tiktok'
  ? '/api/webhooks/social/tiktok'
  : '/api/webhooks/social/meta';

const mockPayloads = {
  meta: {
    object: 'instagram',
    entry: [
      {
        id: '17841400000000000',
        changes: [
          {
            field: 'comments',
            value: {
              id: '17841411111111111_17841422222222222',
              from: {
                name: 'social_media_user',
              },
              message: 'Produk bagus banget! Cocok untuk kaos olahraga.',
              timestamp: Math.floor(Date.now() / 1000),
              comment_id: '17841411111111111_17841422222222222',
              media_id: '17841411111111111',
            },
          },
        ],
      },
    ],
  },
  tiktok: {
    type: 'comment',
    video_id: '7414141414141414141',
    comment_id: '7414141414141414142',
    text: 'Kualitas kain bagus, pengen order grosir buat reseller',
    create_time: Math.floor(Date.now() / 1000),
    author: {
      nickname: 'tiktok_user',
    },
  },
};

const secret = process.env.META_WEBHOOK_SECRET || 'dev-secret-key';

const payload = JSON.stringify(mockPayloads[platform]);
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

const headers = {
  'Content-Type': 'application/json',
  'x-hub-signature-256': `sha256=${signature}`,
  'x-tiktok-signature': signature,
};

const fullUrl = `${baseUrl}${endpoint}`;

console.log(`Sending simulated ${platform.toUpperCase()} webhook to: ${fullUrl}`);

const req = http.request(fullUrl, { method: 'POST', headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log(`Response: ${res.statusCode} ${res.statusMessage}`);
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (err) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error(`Webhook request failed: ${error.message}`);
});

req.write(payload);
req.end();
