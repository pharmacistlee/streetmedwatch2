'use strict';
const express = require('express');
const config = require('../config');
const { validateReport } = require('../lib/validate');
const { screen } = require('../lib/riskScreen');
const { anonymizeText } = require('../lib/anonymize');
const { verifyTurnstile } = require('../lib/turnstile');
const { rateLimit } = require('../lib/rateLimit');
const reports = require('../models/reports');

const router = express.Router();

// GET /api/reports — public, published reports with filters/sort/pagination.
router.get('/', (req, res) => {
  const { substance, outcome, help, q, sort, dir, limit, offset } = req.query;
  const result = reports.listPublished({ substance, outcome, help, q, sort, dir, limit, offset });
  res.json(result);
});

// GET /api/reports/:id — a single published report.
router.get('/:id', (req, res) => {
  const report = reports.getPublishedById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });
  res.json({ report });
});

// POST /api/reports — submit a new adverse-reaction report.
router.post('/', rateLimit(config.submitRatePerHour), async (req, res) => {
  const body = req.body || {};

  // 1. Bot check (Cloudflare Turnstile; bypassed if no secret set).
  const bot = await verifyTurnstile(body.turnstileToken, req.ip);
  if (!bot.ok) {
    return res.status(400).json({ error: 'Bot check failed. Please try again.' });
  }

  // 2. Validate + normalize.
  const v = validateReport(body);
  if (!v.ok) return res.status(400).json({ error: v.error });
  const f = v.value;

  // 3. Anonymize free text before it is ever stored.
  const note = anonymizeText(f.note) || 'No additional detail given.';
  const amount = anonymizeText(f.amount);

  // 4. Risk screening — self-harm / dosing-to-harm language is held, not published.
  const flaggedTerms = screen(f.note, f.amount);

  const id = reports.nextId();
  const now = new Date().toISOString();
  const record = {
    id,
    incidentDate: f.incidentDate,
    filedAt: now,
    reporter: f.reporter,
    substance: f.substance,
    brand: f.brand,
    amount,
    takenWith: f.takenWith,
    symptoms: f.symptoms,
    duration: f.duration,
    help: f.help,
    outcome: f.outcome,
    state: f.state,
    note,
    status: flaggedTerms.length ? 'held' : 'published',
    flaggedTerms: flaggedTerms.length ? flaggedTerms : null,
  };

  reports.insertReport(record);

  if (record.status === 'held') {
    // Do not echo content back; just acknowledge the safety hold.
    return res.status(202).json({
      status: 'held',
      message: 'Thank you. This report mentions something we take seriously, so a trained reviewer will read it before it is published.',
    });
  }

  return res.status(201).json({ status: 'published', id, report: reports.getPublishedById(id) });
});

module.exports = router;
