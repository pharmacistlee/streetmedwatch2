'use strict';
const express = require('express');
const { buildStats } = require('../models/stats');

const router = express.Router();

// GET /api/stats — leaderboard, timeline, symptom + outcome charts, totals.
router.get('/', (req, res) => {
  res.json(buildStats());
});

module.exports = router;
