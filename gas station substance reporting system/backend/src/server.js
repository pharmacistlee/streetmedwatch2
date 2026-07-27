'use strict';
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const reportsModel = require('./models/reports');
const { seedIfEmpty } = require('./seed');

const app = express();

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '32kb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', reports: reportsModel.count(), time: new Date().toISOString() });
});

// Routes
app.use('/api/meta', require('./routes/meta'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/admin', require('./routes/admin'));

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong.' });
});

// Seed on first boot, then listen.
seedIfEmpty();
app.listen(config.port, () => {
  console.log(`StreetMedWatch API listening on http://localhost:${config.port}`);
  console.log(`  Turnstile bot check: ${config.turnstileSecret ? 'ENABLED' : 'BYPASSED (dev)'}`);
});

module.exports = app;
