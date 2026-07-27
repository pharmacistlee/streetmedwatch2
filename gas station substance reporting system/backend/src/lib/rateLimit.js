'use strict';
// Minimal in-memory sliding-window rate limiter. Keyed by a hash of the IP so we
// throttle floods without storing raw IP addresses. Not persisted; resets on restart.
const crypto = require('crypto');

const hits = new Map(); // key -> [timestamps]
const WINDOW_MS = 60 * 60 * 1000;

function keyFor(ip) {
  return crypto.createHash('sha256').update(String(ip || 'unknown')).digest('hex').slice(0, 16);
}

function rateLimit(max) {
  return (req, res, next) => {
    const key = keyFor(req.ip);
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
    if (arr.length >= max) {
      const retryMs = WINDOW_MS - (now - arr[0]);
      res.set('Retry-After', String(Math.ceil(retryMs / 1000)));
      return res.status(429).json({ error: 'Too many submissions from this network. Please try again later.' });
    }
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}

// Occasional cleanup so the map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [k, arr] of hits) {
    const keep = arr.filter((t) => now - t < WINDOW_MS);
    if (keep.length) hits.set(k, keep); else hits.delete(k);
  }
}, WINDOW_MS).unref();

module.exports = { rateLimit };
