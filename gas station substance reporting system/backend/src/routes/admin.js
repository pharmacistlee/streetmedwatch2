'use strict';
const express = require('express');
const config = require('../config');
const reports = require('../models/reports');
const db = require('../db');

const router = express.Router();

// Simple bearer-token gate for the moderation endpoints.
router.use((req, res, next) => {
  const auth = req.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.get('x-admin-token');
  if (!token || token !== config.adminToken) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  next();
});

// GET /api/admin/held — reports held for safety review.
router.get('/held', (req, res) => {
  res.json({ reports: reports.listHeld() });
});

// POST /api/admin/held/:id/approve — publish a held report.
router.post('/held/:id/approve', (req, res) => {
  const ok = reports.setStatus(req.params.id, 'published');
  if (!ok) return res.status(404).json({ error: 'Report not found.' });
  res.json({ status: 'published', id: req.params.id });
});

// POST /api/admin/held/:id/reject — reject (hide) a held report.
router.post('/held/:id/reject', (req, res) => {
  const ok = reports.setStatus(req.params.id, 'rejected');
  if (!ok) return res.status(404).json({ error: 'Report not found.' });
  res.json({ status: 'rejected', id: req.params.id });
});

// GET /api/admin/alerts — every collected alert sign-up (email + optional state).
router.get('/alerts', (req, res) => {
  const rows = db.prepare('SELECT id, email, state, created_at FROM alerts ORDER BY created_at DESC').all();
  res.json({ total: rows.length, alerts: rows });
});

// GET /api/admin/alerts.csv — same list as a downloadable CSV.
router.get('/alerts.csv', (req, res) => {
  const rows = db.prepare('SELECT email, state, created_at FROM alerts ORDER BY created_at DESC').all();
  const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const csv = ['email,state,created_at']
    .concat(rows.map((r) => [r.email, r.state, r.created_at].map(esc).join(',')))
    .join('\n');
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="streetmedwatch-alerts.csv"');
  res.send(csv);
});

module.exports = router;
