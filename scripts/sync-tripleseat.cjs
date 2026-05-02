// scripts/sync-tripleseat.js
//
// Tripleseat → 1-Group Marketing Calendar sync
// =============================================
// Three-layer privacy boundary:
//   Layer 1 — Don't request show_financial=true (financials never leave Tripleseat)
//   Layer 2 — Allowlist mapping (only named fields survive sanitisation)
//   Layer 3 — Transform what we keep (band guest counts, hash IDs, generic titles)
//
// Modes:
//   DRY_RUN=true   — print sanitised output to console, do nothing else
//   DRY_RUN=false  — write public/data/tripleseat-events.json (caller commits)
//
// Run: node scripts/sync-tripleseat.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ─── Config ───────────────────────────────────────────────────────────────

const DRY_RUN = process.env.DRY_RUN === 'true';
const CLIENT_ID = process.env.TRIPLESEAT_CLIENT_ID;
const CLIENT_SECRET = process.env.TRIPLESEAT_CLIENT_SECRET;

const API_BASE = 'https://api.tripleseat.com';

// Statuses we treat as "confirmed". Confirm with Tripleseat admin.
const CONFIRMED_STATUSES = new Set(['DEFINITE', 'CLOSED']);

// Venue mapping: Tripleseat location_id → calendar venue label
// FILL THIS IN after running once and inspecting the locations dump in the log.
const VENUE_MAP = {
  // Example shape (replace with real IDs from Tripleseat):
  // 19667: '1-Altitude',
  // 19668: 'Monti',
  // 19669: 'Alkaff Mansion',
  // 19670: '1-Arden',
  // 19671: 'Oumi',
  // 19672: 'Kaarla',
  // 19673: 'Sol & Luna',
  // 19674: 'Camille',
  // 19675: '1-Flowerhill',
  // 19676: '1-Host',
};

// Guest-count bands. Ranges, never exact figures.
function bandGuests(n) {
  if (n == null || isNaN(n)) return null;
  if (n < 25)  return '<25';
  if (n < 50)  return '25-50';
  if (n < 100) return '50-100';
  if (n < 200) return '100-200';
  return '200+';
}

// Hash ID — stable across runs, can't be reversed to the Tripleseat ID
function hashId(id) {
  return crypto.createHash('sha256')
    .update(`tripleseat:${id}`)
    .digest('hex')
    .slice(0, 12);
}

// ─── Auth: OAuth 2.0 client credentials ───────────────────────────────────

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing TRIPLESEAT_CLIENT_ID or TRIPLESEAT_CLIENT_SECRET in env');
  }

  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OAuth failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  if (!json.access_token) throw new Error('OAuth response missing access_token');
  return json.access_token;
}

// ─── Tripleseat API calls ─────────────────────────────────────────────────

async function apiGet(token, pathAndQuery) {
  const url = `${API_BASE}${pathAndQuery}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GET ${pathAndQuery} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function fetchLocations(token) {
  // Pulled once during dry run so we can build VENUE_MAP
  return apiGet(token, '/v1/locations.json');
}

async function fetchAllEvents(token) {
  const events = [];
  let page = 1;
  const today = new Date().toISOString().slice(0, 10);

  while (page < 50) { // Hard cap so a runaway loop can't blow through rate limits
    // NOTE: explicitly NOT including show_financial=true
    const params = new URLSearchParams({
      page: String(page),
      order: 'event_start',
      sort_direction: 'asc',
      // event_start_after: today, // Uncomment after confirming param name with Tripleseat
    });
    const data = await apiGet(token, `/v1/events.json?${params}`);
    const batch = Array.isArray(data) ? data : (data.events || []);
    if (batch.length === 0) break;
    events.push(...batch);
    if (batch.length < 25) break; // Last page
    page++;
    await new Promise((r) => setTimeout(r, 250)); // Polite rate-limit pause
  }
  return events;
}

// ─── Sanitiser: allowlist + transform ─────────────────────────────────────

function sanitiseEvent(raw) {
  // Filter: only confirmed, only future
  const status = (raw.status || '').toUpperCase();
  if (!CONFIRMED_STATUSES.has(status)) return null;

  const start = raw.event_start || raw.start_time || null;
  if (!start) return null;
  const startDate = String(start).slice(0, 10);
  if (startDate < new Date().toISOString().slice(0, 10)) return null;

  // Venue mapping — drop events at unknown locations
  const venue = VENUE_MAP[raw.location_id];
  if (!venue) return { __skipped: true, reason: 'unmapped_location', location_id: raw.location_id };

  // Event type: prefer a known generic category. NEVER use raw.name (contains client info).
  // Adjust this once Tripleseat admin confirms where the category lives.
  const category = (raw.event_type || raw.category || raw.type || 'Private Event')
    .toString()
    .replace(/[^a-zA-Z &-]/g, '')
    .trim()
    .slice(0, 40) || 'Private Event';

  const guestBand = bandGuests(raw.guest_count ?? raw.guests ?? raw.expected_count);

  // Build the templated, generic display title — never include raw.name
  const title = `${category} · ${venue}`;

  return {
    id: `ts-${hashId(raw.id)}`,
    layer: 'tripleseat',
    name: title,
    venue,
    category,
    guest_band: guestBand,
    start: startDate,
    end: (raw.event_end || raw.end_time || start).slice(0, 10),
  };
}

// Detect any field that looks sensitive — used as a tripwire in dry-run logs
const SENSITIVE_KEY_PATTERNS = [
  /name$/i, /email/i, /phone/i, /contact/i, /account/i, /address/i,
  /note/i, /comment/i, /amount/i, /total/i, /revenue/i, /price/i,
  /deposit/i, /payment/i, /tax/i, /balance/i, /document/i, /attachment/i,
  /custom/i,
];
function tripwireScan(rawEvent) {
  const flagged = [];
  for (const k of Object.keys(rawEvent || {})) {
    if (SENSITIVE_KEY_PATTERNS.some((re) => re.test(k))) flagged.push(k);
  }
  return flagged;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('━━━ Tripleseat Sync ━━━');
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE (will write file)'}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  console.log('→ Authenticating...');
  const token = await getAccessToken();
  console.log('  OK\n');

  // Always print locations during dry run so we can build VENUE_MAP
  if (DRY_RUN) {
    console.log('→ Fetching locations (for venue mapping)...');
    const locations = await fetchLocations(token);
    const list = Array.isArray(locations) ? locations : (locations.locations || []);
    console.log(`  Found ${list.length} locations:\n`);
    for (const loc of list) {
      console.log(`    ${String(loc.id).padEnd(10)} ${loc.name}`);
    }
    console.log('');
  }

  console.log('→ Fetching events...');
  const rawEvents = await fetchAllEvents(token);
  console.log(`  Pulled ${rawEvents.length} raw events\n`);

  // Tripwire scan — list every field name we saw across raw events
  const allKeysSeen = new Set();
  rawEvents.forEach((e) => Object.keys(e || {}).forEach((k) => allKeysSeen.add(k)));
  const flaggedKeys = [...allKeysSeen].filter((k) =>
    SENSITIVE_KEY_PATTERNS.some((re) => re.test(k))
  );
  console.log('→ Tripwire scan (sensitive field names present in API response):');
  if (flaggedKeys.length === 0) {
    console.log('  none\n');
  } else {
    flaggedKeys.forEach((k) => console.log(`  ⚠  ${k}`));
    console.log('  ↑ These will be DROPPED by the sanitiser allowlist.\n');
  }

  console.log('→ Sanitising...');
  const sanitised = [];
  const skipped = { unmapped_location: 0, not_confirmed: 0, no_date: 0, in_past: 0 };

  for (const raw of rawEvents) {
    const status = (raw.status || '').toUpperCase();
    if (!CONFIRMED_STATUSES.has(status)) { skipped.not_confirmed++; continue; }

    const result = sanitiseEvent(raw);
    if (!result) { skipped.in_past++; continue; }
    if (result.__skipped) { skipped[result.reason]++; continue; }
    sanitised.push(result);
  }

  console.log(`  Confirmed & sanitised: ${sanitised.length}`);
  console.log(`  Skipped — not confirmed: ${skipped.not_confirmed}`);
  console.log(`  Skipped — past or no date: ${skipped.in_past}`);
  console.log(`  Skipped — unmapped venue: ${skipped.unmapped_location}\n`);

  if (DRY_RUN) {
    console.log('━━━ Sanitised output (sample, first 10) ━━━');
    sanitised.slice(0, 10).forEach((e) => console.log('  ' + JSON.stringify(e)));
    if (sanitised.length > 10) console.log(`  ... and ${sanitised.length - 10} more`);
    console.log('\n━━━ DRY RUN COMPLETE — no files written ━━━');
    console.log('Inspect the output above. Confirm:');
    console.log('  1. No client/account/contact names appear anywhere');
    console.log('  2. No financial values appear anywhere');
    console.log('  3. No free-text notes or BEO content appears anywhere');
    console.log('  4. Event titles are generic ("Wedding · Alkaff Mansion") not specific');
    console.log('  5. Tripwire-flagged fields above are not present in any event');
    return;
  }

  // LIVE mode: write file (caller commits via separate step)
  const outDir = path.join(process.cwd(), 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'tripleseat-events.json');
  const payload = {
    generated_at: new Date().toISOString(),
    count: sanitised.length,
    events: sanitised,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`✓ Wrote ${outPath} (${sanitised.length} events)`);
}

// Export for testing / mock runs (sync-tripleseat.mock.js)
module.exports = {
  sanitiseEvent,
  SENSITIVE_KEY_PATTERNS,
  VENUE_MAP,
};

// Only run main() when invoked directly, not when require()'d by the mock
if (require.main === module) {
  main().catch((err) => {
    console.error('SYNC FAILED:', err.message);
    process.exit(1);
  });
}
