'use strict';
const { allPublished } = require('./reports');
const { SOLD_AS } = require('../data/reference');

const TODAY = new Date('2026-07-24T12:00:00Z'); // matches prototype reference date

function daysAgo(dateStr) {
  return (TODAY - new Date(dateStr + 'T12:00:00Z')) / 86400000;
}

function countBy(list, keyFn) {
  const m = new Map();
  list.forEach((r) => {
    const ks = keyFn(r);
    (Array.isArray(ks) ? ks : [ks]).forEach((k) => m.set(k, (m.get(k) || 0) + 1));
  });
  return [...m.entries()].map(([name, cnt]) => ({ name, count: cnt })).sort((a, b) => b.count - a.count);
}

// Leaderboard: last 90 days vs the prior 90, with a percent delta ("new" when no prior).
function leaderboard(list) {
  const recent = list.filter((r) => daysAgo(r.incidentDate) <= 90);
  const prior = list.filter((r) => daysAgo(r.incidentDate) > 90 && daysAgo(r.incidentDate) <= 180);
  const rc = countBy(recent, (r) => r.substance);
  const pc = new Map(countBy(prior, (r) => r.substance).map((x) => [x.name, x.count]));
  const max = rc.length ? rc[0].count : 1;
  return rc.slice(0, 7).map((x, i) => {
    const before = pc.get(x.name) || 0;
    const d = before ? Math.round(((x.count - before) / before) * 100) : null;
    return {
      rank: String(i + 1).padStart(2, '0'),
      name: x.name,
      soldAs: SOLD_AS[x.name] || '',
      count: x.count,
      pct: Math.round((x.count / max) * 100),
      delta: d === null ? 'new' : (d > 0 ? '+' + d + '%' : d + '%'),
    };
  });
}

// Monthly timeline of report volume over the trailing 12 months.
function timeline(list) {
  const buckets = [];
  const base = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    buckets.push({
      key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'),
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      count: 0,
    });
  }
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  list.forEach((r) => {
    const key = r.incidentDate.slice(0, 7);
    if (idx.has(key)) buckets[idx.get(key)].count += 1;
  });
  return buckets;
}

function symptomChart(list) {
  return countBy(list, (r) => r.symptoms).slice(0, 8);
}

function outcomeChart(list) {
  const order = ['Recovered', 'Ongoing', 'Hospitalized'];
  const by = new Map(countBy(list, (r) => r.outcome).map((x) => [x.name, x.count]));
  return order.map((name) => ({ name, count: by.get(name) || 0 }));
}

function buildStats() {
  const list = allPublished();
  return {
    total: list.length,
    leaderboard: leaderboard(list),
    timeline: timeline(list),
    symptomChart: symptomChart(list),
    outcomeChart: outcomeChart(list),
  };
}

module.exports = { buildStats };
