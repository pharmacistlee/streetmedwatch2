'use strict';
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite'); // built into Node 22.5+ / 24 — no native build needed
const config = require('./config');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new DatabaseSync(config.dbPath);

// Prefer WAL for concurrency, but fall back gracefully on filesystems that don't
// support it (some network/synced mounts), so the server still starts.
try {
  db.exec('PRAGMA journal_mode = WAL');
} catch (err) {
  console.warn('WAL not supported on this filesystem; falling back to DELETE journal mode.');
  try { db.exec('PRAGMA journal_mode = DELETE'); } catch (_) { /* keep default */ }
}
db.exec('PRAGMA foreign_keys = ON');

// Allow prepared statements to use bare named-parameter keys (e.g. { id } for @id),
// matching how the models bind parameters.
const _prepare = db.prepare.bind(db);
db.prepare = (sql) => {
  const stmt = _prepare(sql);
  stmt.setAllowBareNamedParameters(true);
  return stmt;
};

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id            TEXT PRIMARY KEY,
    incident_date TEXT NOT NULL,
    filed_at      TEXT NOT NULL,
    reporter      TEXT NOT NULL DEFAULT 'The person it happened to',
    substance     TEXT NOT NULL,
    brand         TEXT NOT NULL,
    amount        TEXT NOT NULL DEFAULT 'Not given',
    taken_with    TEXT NOT NULL DEFAULT 'Nothing',
    symptoms      TEXT NOT NULL,          -- JSON array
    duration      TEXT NOT NULL,
    help          TEXT NOT NULL,
    outcome       TEXT NOT NULL,
    state         TEXT NOT NULL,
    note          TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'published', -- published | held | rejected
    flagged_terms TEXT,                    -- JSON array, only for held reports
    created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_reports_status    ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_reports_substance ON reports(substance);
  CREATE INDEX IF NOT EXISTS idx_reports_date      ON reports(incident_date);

  CREATE TABLE IF NOT EXISTS alerts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      TEXT NOT NULL,
    state      TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE(email, state)
  );
`);

module.exports = db;
