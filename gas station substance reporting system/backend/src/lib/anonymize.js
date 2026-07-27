'use strict';
// Light anonymization pass applied to free-text before storage. We ask users not to
// include identifying detail; this is a safety net that strips the most common PII
// patterns (emails, phone numbers, URLs) and collapses whitespace. It intentionally
// does NOT rewrite the account — only redacts obvious identifiers.

function anonymizeText(input) {
  if (!input) return '';
  let t = String(input);
  t = t.replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, '[removed]');           // emails
  t = t.replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, '[removed]');                     // phone numbers
  t = t.replace(/\bhttps?:\/\/\S+/gi, '[link removed]');                            // urls
  t = t.replace(/\s{2,}/g, ' ').trim();                                            // whitespace
  return t;
}

module.exports = { anonymizeText };
