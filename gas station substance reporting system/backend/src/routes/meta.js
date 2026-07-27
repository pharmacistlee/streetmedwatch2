'use strict';
const express = require('express');
const ref = require('../data/reference');

const router = express.Router();

// GET /api/meta — reference data the front-end needs for the form, filters and
// substance pages (brands, substances, states, symptom/duration/help/outcome options).
router.get('/', (req, res) => {
  res.json({
    substances: ref.SUBSTANCES,
    soldAs: ref.SOLD_AS,
    brands: ref.BRANDS.map(([key, substance]) => ({ key, substance, label: `${key} — ${substance}` })),
    states: ref.STATES,
    symptomChoices: ref.SYMPTOM_CHOICES,
    durationOptions: ref.DURATION_OPTIONS,
    helpOptions: ref.HELP_OPTIONS,
    outcomeOptions: ref.OUTCOME_OPTIONS,
    reporterChoices: ref.REPORTER_CHOICES,
  });
});

module.exports = router;
