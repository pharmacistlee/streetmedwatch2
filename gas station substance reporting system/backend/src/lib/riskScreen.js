'use strict';
const { FLAGGED } = require('../data/reference');

// Screens free-text for self-harm / dosing-to-harm language. Matching reports are
// held for human review instead of auto-publishing. Returns the terms that matched.
function screen(...texts) {
  const hay = texts.filter(Boolean).join(' ').toLowerCase();
  return FLAGGED.filter((term) => hay.includes(term));
}

module.exports = { screen };
