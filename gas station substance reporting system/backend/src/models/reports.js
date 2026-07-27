'use strict';
const db = require('../db');

function rowToReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    incidentDate: row.incident_date,
    filedAt: row.filed_at,
    reporter: row.reporter,
    substance: row.substance,
    brand: row.brand,
    amount: row.amount,
    takenWith: row.taken_with,
    symptoms: JSON.parse(row.symptoms),
    duration: row.duration,
    help: row.help,
    outcome: row.outcome,
    state: row.state,
    note: row.note,
    status: row.status,
  };
}

// Next sequential public id, e.g. R-2482. Ignores the "R-" prefix and increments the max.
function nextId() {
  const row = db.prepare(
    `SELECT MAX(CAST(substr(id,3) AS INTEGER)) AS maxN FROM reports WHERE id LIKE 'R-%'`
  ).get();
  const n = (row && row.maxN ? row.maxN : 2481) + 1;
  return 'R-' + n;
}

const insertStmt = db.prepare(`
  INSERT INTO reports
    (id, incident_date, filed_at, reporter, substance, brand, amount, taken_with,
     symptoms, duration, help, outcome, state, note, status, flagged_terms)
  VALUES
    (@id, @incident_date, @filed_at, @reporter, @substance, @brand, @amount, @taken_with,
     @symptoms, @duration, @help, @outcome, @state, @note, @status, @flagged_terms)
`);

function insertReport(rec) {
  insertStmt.run({
    id: rec.id,
    incident_date: rec.incidentDate,
    filed_at: rec.filedAt || new Date().toISOString(),
    reporter: rec.reporter,
    substance: rec.substance,
    brand: rec.brand,
    amount: rec.amount,
    taken_with: rec.takenWith,
    symptoms: JSON.stringify(rec.symptoms),
    duration: rec.duration,
    help: rec.help,
    outcome: rec.outcome,
    state: rec.state,
    note: rec.note,
    status: rec.status || 'published',
    flagged_terms: rec.flaggedTerms ? JSON.stringify(rec.flaggedTerms) : null,
  });
  return rec.id;
}

// Public, published reports with optional filters + sorting + pagination.
function listPublished(opts = {}) {
  const { substance, outcome, help, q, sort = 'date', dir = 'desc', limit = 50, offset = 0 } = opts;
  const where = ["status = 'published'"];
  const params = {};

  if (substance && substance !== 'All substances') { where.push('substance = @substance'); params.substance = substance; }
  if (outcome && outcome !== 'Any outcome') { where.push('outcome = @outcome'); params.outcome = outcome; }
  if (help && help !== 'Any') { where.push('help = @help'); params.help = help; }
  if (q && q.trim()) {
    where.push("(substance || ' ' || brand || ' ' || symptoms || ' ' || state || ' ' || note) LIKE @q");
    params.q = '%' + q.trim() + '%';
  }

  const sortCols = { date: 'incident_date', substance: 'substance', help: 'help', outcome: 'outcome' };
  const col = sortCols[sort] || 'incident_date';
  const order = String(dir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const total = db.prepare(`SELECT COUNT(*) AS n FROM reports WHERE ${where.join(' AND ')}`).get(params).n;

  params.limit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  params.offset = Math.max(parseInt(offset, 10) || 0, 0);

  const rows = db.prepare(
    `SELECT * FROM reports WHERE ${where.join(' AND ')} ORDER BY ${col} ${order}, id DESC LIMIT @limit OFFSET @offset`
  ).all(params);

  return { total, count: rows.length, reports: rows.map(rowToReport) };
}

function getPublishedById(id) {
  const row = db.prepare(`SELECT * FROM reports WHERE id = ? AND status = 'published'`).get(id);
  return rowToReport(row);
}

function allPublished() {
  return db.prepare(`SELECT * FROM reports WHERE status = 'published'`).all().map(rowToReport);
}

// Moderation helpers
function listHeld() {
  return db.prepare(`SELECT * FROM reports WHERE status = 'held' ORDER BY created_at DESC`)
    .all()
    .map((r) => Object.assign(rowToReport(r), { flaggedTerms: r.flagged_terms ? JSON.parse(r.flagged_terms) : [] }));
}

function setStatus(id, status) {
  const info = db.prepare(`UPDATE reports SET status = ? WHERE id = ?`).run(status, id);
  return info.changes > 0;
}

function count() {
  return db.prepare(`SELECT COUNT(*) AS n FROM reports`).get().n;
}

module.exports = {
  nextId, insertReport, listPublished, getPublishedById, allPublished,
  listHeld, setStatus, count, rowToReport,
};
