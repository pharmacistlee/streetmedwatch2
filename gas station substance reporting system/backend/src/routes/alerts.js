'use strict';
const express = require('express');
const db = require('../db');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const insertStmt = db.prepare(
  `INSERT OR IGNORE INTO alerts (email, state) VALUES (@email, @state)`
);

// POST /api/alerts — subscribe an email (optionally scoped to a state) to alerts.
router.post('/', (req, res) => {
  const email = String((req.body && req.body.email) || '').trim().toLowerCase();
  const state = (req.body && req.body.state) ? String(req.body.state).trim() : null;

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Enter an email we can reach you at.' });
  }
  insertStmt.run({ email, state });
  res.status(201).json({ status: 'subscribed' });
});

module.exports = router;
