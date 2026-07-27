'use strict';
const db = require('./db');
const reports = require('./models/reports');
const { SEED_RECORDS } = require('./data/seed-reports');

// Loads the prototype seed reports if the reports table is empty.
function seedIfEmpty() {
  if (reports.count() > 0) return { seeded: 0 };
  db.exec('BEGIN');
  try {
    for (const rec of SEED_RECORDS) reports.insertReport(rec);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  console.log(`Seeded ${SEED_RECORDS.length} reports.`);
  return { seeded: SEED_RECORDS.length };
}

module.exports = { seedIfEmpty };

// Allow running directly: `npm run seed`
if (require.main === module) {
  const result = seedIfEmpty();
  console.log(result.seeded ? `Done. ${result.seeded} reports.` : 'Already seeded — nothing to do.');
  process.exit(0);
}
