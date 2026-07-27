'use strict';
const {
  BRANDS, SUBSTANCES, ST_ABBR, STATES, SYMPTOM_CHOICES,
  DURATION_OPTIONS, HELP_OPTIONS, OUTCOME_OPTIONS, REPORTER_CHOICES,
} = require('../data/reference');

const TODAY = '2026-07-24'; // matches the prototype's reference "today"; swap for a live date in prod

const brandMap = new Map(BRANDS);

// Validates and normalizes an incoming report submission.
// Returns { ok: true, value } or { ok: false, error }.
function validateReport(input) {
  const b = input || {};
  const brandKey = String(b.brandKey || '').trim();

  if (!brandKey) {
    return err('Please choose the brand or street name — that is what people search for.');
  }

  let brand, substance;
  if (brandKey === 'other') {
    brand = String(b.brand || '').trim();
    if (!brand) return err('Please type the name printed on the package.');
    substance = SUBSTANCES.includes(b.substance) ? b.substance : (b.substance ? String(b.substance).trim() : 'Something else');
  } else if (brandMap.has(brandKey)) {
    brand = brandKey;
    substance = brandMap.get(brandKey);
  } else {
    return err('Unrecognized brand selection.');
  }

  const incidentDate = String(b.incidentDate || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(incidentDate)) {
    return err('Please give the date this happened — even an approximate day helps us spot spikes.');
  }
  if (incidentDate > TODAY) return err('That date is in the future. Please check it.');

  const symptoms = Array.isArray(b.symptoms)
    ? b.symptoms.filter((s) => SYMPTOM_CHOICES.includes(s))
    : [];
  if (!symptoms.length) {
    return err('Please select at least one symptom — that is the part other people search for.');
  }

  if (b.bot !== true) return err('Please confirm the bot check before submitting.');

  const reporter = REPORTER_CHOICES.includes(b.reporter) ? b.reporter : 'The person it happened to';
  const duration = DURATION_OPTIONS.includes(b.duration) ? b.duration : '3-6 hours';
  const help = HELP_OPTIONS.includes(b.help) ? b.help : 'None';
  const outcome = OUTCOME_OPTIONS.includes(b.outcome) ? b.outcome : 'Recovered';

  // State may arrive as a full name or an abbreviation.
  let state = String(b.state || '').trim();
  if (ST_ABBR[state]) state = ST_ABBR[state];
  else if (state) state = state.slice(0, 2).toUpperCase();
  else state = '';

  return {
    ok: true,
    value: {
      reporter,
      substance,
      brand,
      amount: (b.amount || '').trim() || 'Not given',
      takenWith: (b.takenWith || '').trim() || 'Nothing',
      symptoms,
      duration,
      help,
      outcome,
      state,
      note: (b.note || '').trim(),
      incidentDate,
    },
  };
}

function err(message) { return { ok: false, error: message }; }

module.exports = { validateReport, TODAY };
