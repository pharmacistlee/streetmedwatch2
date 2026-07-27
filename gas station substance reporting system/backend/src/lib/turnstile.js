'use strict';
const config = require('../config');

// Verifies a Cloudflare Turnstile ("not a robot") token server-side.
// If no secret is configured (local dev), the check is bypassed and returns true.
async function verifyTurnstile(token, remoteip) {
  if (!config.turnstileSecret) {
    return { ok: true, bypassed: true };
  }
  if (!token) {
    return { ok: false, error: 'missing-token' };
  }
  try {
    const body = new URLSearchParams({ secret: config.turnstileSecret, response: token });
    if (remoteip) body.append('remoteip', remoteip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    const data = await res.json();
    return { ok: !!data.success, error: data.success ? null : (data['error-codes'] || []).join(',') };
  } catch (err) {
    return { ok: false, error: 'verify-failed' };
  }
}

module.exports = { verifyTurnstile };
