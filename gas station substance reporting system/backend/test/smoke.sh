#!/usr/bin/env bash
# Smoke test: boots the API against a throwaway DB and exercises every endpoint.
set -u
cd "$(dirname "$0")/.."

export PORT=4055
export DB_PATH="/tmp/smwtest/streetmedwatch.db"
export ADMIN_TOKEN="test-admin-token"
export SUBMIT_RATE_PER_HOUR=100
mkdir -p /tmp/smwtest
rm -f /tmp/smwtest/*.db*

node src/server.js > /tmp/smw.log 2>&1 &
PID=$!
sleep 3

B="http://localhost:$PORT/api"
echo "===== HEALTH ====="; curl -s "$B/health"; echo
echo "===== META (counts) ====="; curl -s "$B/meta" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log("substances",j.substances.length,"brands",j.brands.length,"symptoms",j.symptomChoices.length)})'
echo "===== STATS (leaderboard) ====="; curl -s "$B/stats" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log("total",j.total);j.leaderboard.forEach(x=>console.log(" ",x.rank,x.name,x.count,x.delta));console.log("timeline points",j.timeline.length,"symptomChart",j.symptomChart.length,"outcomeChart",JSON.stringify(j.outcomeChart))})'
echo "===== REPORTS list (Tianeptine, first 3) ====="; curl -s "$B/reports?substance=Tianeptine&limit=3" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log("total",j.total,"returned",j.count);j.reports.forEach(r=>console.log(" ",r.id,r.brand,r.outcome))})'
echo "===== SUBMIT valid report ====="; curl -s -X POST "$B/reports" -H 'content-type: application/json' -d '{"brandKey":"Za Za Red","reporter":"The person it happened to","incidentDate":"2026-07-22","symptoms":["Racing heart","Vomiting"],"duration":"3-6 hours","state":"Ohio","help":"Poison Control","outcome":"Recovered","amount":"one bottle","takenWith":"Nothing","note":"Contact me at test@example.com or 555-123-4567","bot":true}'; echo
echo "===== SUBMIT flagged report (should be HELD) ====="; curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$B/reports" -H 'content-type: application/json' -d '{"brandKey":"Za Za Red","incidentDate":"2026-07-22","symptoms":["Confusion"],"duration":"3-6 hours","state":"Ohio","help":"None","outcome":"Recovered","note":"I wanted to overdose on purpose","bot":true}'
curl -s -X POST "$B/reports" -H 'content-type: application/json' -d '{"brandKey":"Za Za Red","incidentDate":"2026-07-22","symptoms":["Confusion"],"duration":"3-6 hours","state":"Ohio","help":"None","outcome":"Recovered","note":"another one, how much to take to end it","bot":true}' >/dev/null
echo "===== SUBMIT invalid (no symptoms) ====="; curl -s -X POST "$B/reports" -H 'content-type: application/json' -d '{"brandKey":"Za Za Red","incidentDate":"2026-07-22","symptoms":[],"bot":true}'; echo
echo "===== SUBMIT invalid (bot unchecked) ====="; curl -s -X POST "$B/reports" -H 'content-type: application/json' -d '{"brandKey":"Za Za Red","incidentDate":"2026-07-22","symptoms":["Nausea"],"bot":false}'; echo
echo "===== ALERTS subscribe ====="; curl -s -X POST "$B/alerts" -H 'content-type: application/json' -d '{"email":"me@example.com","state":"Ohio"}'; echo
echo "===== ADMIN held (no token -> 401) ====="; curl -s -o /dev/null -w "HTTP %{http_code}\n" "$B/admin/held"
echo "===== ADMIN held (with token) ====="; curl -s "$B/admin/held" -H "x-admin-token: test-admin-token" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log("held count",j.reports.length);j.reports.forEach(r=>console.log(" ",r.id,JSON.stringify(r.flaggedTerms)))})'
echo "===== ADMIN approve first held ====="; HELD_ID=$(curl -s "$B/admin/held" -H "x-admin-token: test-admin-token" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log(j.reports.length?j.reports[0].id:"")})')
echo "approving $HELD_ID"; curl -s -X POST "$B/admin/held/$HELD_ID/approve" -H "x-admin-token: test-admin-token"; echo
echo "===== verify note anonymization on the valid report ====="; curl -s "$B/reports?q=removed&limit=3" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);j.reports.forEach(r=>console.log(" ",r.id,JSON.stringify(r.note)))})'

kill $PID 2>/dev/null
echo "===== server log tail ====="; tail -3 /tmp/smw.log
