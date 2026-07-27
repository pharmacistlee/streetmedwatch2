'use strict';
require('dotenv').config();
const path = require('path');

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  dbPath: path.resolve(__dirname, '..', process.env.DB_PATH || 'data/streetmedwatch.db'),
  turnstileSecret: process.env.TURNSTILE_SECRET || '',
  adminToken: process.env.ADMIN_TOKEN || 'change-me-in-production',
  submitRatePerHour: parseInt(process.env.SUBMIT_RATE_PER_HOUR || '10', 10),
};

module.exports = config;
