// scripts/sync-tripleseat.mock.js
//
// Mock test for the sanitiser. Runs synthetic events with deliberately seeded
// sensitive data (fake client names, fake $, fake notes) and verifies:
//   1. No sensitive field names appear in output
//   2. No client/financial/note content survives in output
//   3. Status filter works (TENTATIVE filtered out)
//   4. Date filter works (past events filtered out)
//   5. Venue mapping works (unmapped locations filtered out)
//   6. Guest count banding works
//   7. IDs are hashed (raw IDs do not appear)
//   8. Display names follow generic "Category · Venue" format
//
// Run: node scripts/sync-tripleseat.mock.js
// Exit 0 = all checks passed. Non-zero = one or more failures.
//
// No Tripleseat credentials needed. No API calls. No commits.

const { sanitiseEvent, SENSITIVE_KEY_PATTERNS, VENUE_MAP } = require('./sync-tripleseat.cjs');

// Populate VENUE_MAP for the test (mutates module-scope const, fine for mock)
Object.assign(VENUE_MAP, {
  19668: 'Monti',
  19669: 'Alkaff Mansion',
  19670: '1-Arden',
  19671: 'Oumi',
  19672: 'Kaarla',
});

// ─── Synthetic raw events ─────────────────────────────────────────────────
// Each one tests a specific behaviour. Fields prefixed with `_` are test
// metadata that is stripped before sanitisation.

const MOCK_RAW_EVENTS = [
  {
    _why: 'Confirmed wedding, max sensitive payload — must sanitise to generic',
    id: 99001,
    name: 'Smith-Goldberg Wedding Reception — Sarah Smith',
    status: 'DEFINITE',
    event_start: '2026-08-15',
    event_end: '2026-08-15',
    location_id: 19669,
    event_type: 'Wedding',
    guest_count: 150,
    account_name: 'Sarah Smith Family',
    contact_name: 'Sarah Smith',
    contact_email: 'sarah.smith@example.com',
    contact_phone: '+65 9123 4567',
    contact_address: '12 Bukit Timah Road',
    notes: 'Bride wants gold accents only. Allergies: nuts, shellfish.',
    comments: 'Father of bride paying. Discount given.',
    total_amount: 75000,
    deposit_amount: 25000,
    payment_status: 'PAID',
    documents: [{ name: 'BEO_Smith.pdf', url: 'https://example.com/beo' }],
    custom_field_dietary: 'VIP list',
    custom_field_family: 'private',
  },
  {
    _why: 'Confirmed corporate dinner — different category, smaller party',
    id: 99002,
    name: 'Goldman Sachs Q3 Offsite Dinner',
    status: 'CLOSED',
    event_start: '2026-09-20',
    event_end: '2026-09-20',
    location_id: 19668,
    event_type: 'Corporate',
    guest_count: 40,
    account_name: 'Goldman Sachs Singapore',
    contact_email: 'events@gs-example.com',
    notes: 'Strict NDA. No photography.',
    total_amount: 18000,
  },
  {
    _why: 'TENTATIVE — should be filtered by status',
    id: 99003,
    name: 'Pending Birthday Party',
    status: 'TENTATIVE',
    event_start: '2026-07-10',
    location_id: 19670,
    event_type: 'Birthday',
    guest_count: 30,
  },
  {
    _why: 'Past event — should be filtered by date',
    id: 99004,
    name: 'Old Wedding',
    status: 'DEFINITE',
    event_start: '2025-06-15',
    location_id: 19669,
    event_type: 'Wedding',
    guest_count: 100,
  },
  {
    _why: 'Unmapped location_id — should be filtered',
    id: 99005,
    name: 'Mystery Venue Event',
    status: 'DEFINITE',
    event_start: '2026-10-01',
    location_id: 99999,
    event_type: 'Cocktail',
    guest_count: 80,
  },
  {
    _why: 'Tiny party — guest band <25',
    id: 99006,
    name: 'Intimate Anniversary',
    status: 'DEFINITE',
    event_start: '2026-11-12',
    location_id: 19671,
    event_type: 'Private Dining',
    guest_count: 12,
  },
  {
    _why: 'Massive event — guest band 200+',
    id: 99007,
    name: 'Corporate Town Hall',
    status: 'DEFINITE',
    event_start: '2026-12-05',
    location_id: 19672,
    event_type: 'Corporate',
    guest_count: 350,
  },
  {
    _why: 'No guest count — should output null band',
    id: 99008,
    name: 'TBD Cocktail Reception',
    status: 'DEFINITE',
    event_start: '2026-09-30',
    location_id: 19668,
    event_type: 'Cocktail',
  },
];

// ─── Run sanitiser ────────────────────────────────────────────────────────

console.log('━━━ Tripleseat Sanitiser MOCK Test ━━━');
console.log(`Time: ${new Date().toISOString()}`);
console.log(`Synthetic events: ${MOCK_RAW_EVENTS.length}\n`);

// Tripwire: list every field in synthetic raw data that matches sensitive patterns
const allRawKeys = new Set();
MOCK_RAW_EVENTS.forEach((e) => Object.keys(e).forEach((k) => allRawKeys.add(k)));
const flaggedRawKeys = [...allRawKeys].filter((k) =>
  k !== '_why' && SENSITIVE_KEY_PATTERNS.some((re) => re.test(k))
);
console.log(`→ Sensitive field names PRESENT in raw test data (${flaggedRawKeys.length}):`);
flaggedRawKeys.sort().forEach((k) => console.log(`    ${k}`));
console.log('');

const sanitised = [];
const filtered = [];

for (const raw of MOCK_RAW_EVENTS) {
  const why = raw._why;
  const cleanRaw = { ...raw };
  delete cleanRaw._why;
  const result = sanitiseEvent(cleanRaw);
  if (!result) {
    filtered.push({ id: raw.id, why, reason: 'status_or_date' });
  } else if (result.__skipped) {
    filtered.push({ id: raw.id, why, reason: result.reason });
  } else {
    sanitised.push({ ...result, _why: why, _raw_id: raw.id });
  }
}

console.log(`→ Survived sanitiser: ${sanitised.length}`);
console.log(`→ Filtered out:       ${filtered.length}\n`);

console.log('━━━ Filtered-out events ━━━');
filtered.forEach((f) => console.log(`  raw_id=${f.id}  reason=${f.reason}  (${f.why})`));
console.log('');

console.log('━━━ Sanitised output ━━━');
sanitised.forEach((s) => {
  console.log(`  // ${s._why}  (raw_id=${s._raw_id})`);
  const { _why, _raw_id, ...event } = s;
  console.log('  ' + JSON.stringify(event));
});
console.log('');

// ─── Assertions ───────────────────────────────────────────────────────────

console.log('━━━ Assertions ━━━');
let failures = 0;
function check(label, pass, detail = '') {
  console.log(`  ${pass ? '✓' : '✗'} ${label}${detail ? ' — ' + detail : ''}`);
  if (!pass) failures++;
}

// Strip test metadata before key inspection
const sanitisedClean = sanitised.map((s) => { const { _why, _raw_id, ...e } = s; return e; });

// 1. Output contains ONLY the explicitly allowed fields (allowlist, not blocklist)
const ALLOWED_OUTPUT_KEYS = new Set([
  'id', 'layer', 'name', 'venue', 'category', 'guest_band', 'start', 'end',
]);
const sanitisedKeys = new Set();
sanitisedClean.forEach((e) => Object.keys(e).forEach((k) => sanitisedKeys.add(k)));
const unexpectedKeys = [...sanitisedKeys].filter((k) => !ALLOWED_OUTPUT_KEYS.has(k));
check(
  'Output contains only allowlisted fields',
  unexpectedKeys.length === 0,
  unexpectedKeys.length ? `UNEXPECTED: ${unexpectedKeys.join(', ')}` : ''
);

// 2. No raw client/financial/note tokens survived
const dirtyTokens = [
  'Smith', 'Goldberg', 'Sarah', 'Goldman', 'sarah.smith', '+65', 'Bukit Timah',
  'gold accents', 'shellfish', 'NDA', '75000', '25000', '18000', 'BEO_Smith',
  'PAID', 'VIP list', 'private',
];
const allOutputText = JSON.stringify(sanitisedClean);
const leakedTokens = dirtyTokens.filter((t) => allOutputText.includes(t));
check(
  'No raw client/financial/note content survived',
  leakedTokens.length === 0,
  leakedTokens.length ? `LEAKED: ${leakedTokens.join(', ')}` : ''
);

// 3. Status filter
check('TENTATIVE event filtered out', filtered.some((f) => f.id === 99003));

// 4. Date filter
check('Past-dated event filtered out', filtered.some((f) => f.id === 99004));

// 5. Venue filter
check(
  'Unmapped-venue event filtered out',
  filtered.some((f) => f.id === 99005 && f.reason === 'unmapped_location')
);

// 6. Guest banding
const wedding = sanitised.find((s) => s._raw_id === 99001);
check('Wedding (150 guests) → band "100-200"', wedding?.guest_band === '100-200');
const anniv = sanitised.find((s) => s._raw_id === 99006);
check('Anniversary (12 guests) → band "<25"', anniv?.guest_band === '<25');
const town = sanitised.find((s) => s._raw_id === 99007);
check('Town Hall (350 guests) → band "200+"', town?.guest_band === '200+');
const tbd = sanitised.find((s) => s._raw_id === 99008);
check('Missing guest count → null band', tbd?.guest_band === null);

// 7. IDs hashed
const rawIdStrings = MOCK_RAW_EVENTS.map((e) => String(e.id));
const idsLeaked = sanitised.some((s) =>
  rawIdStrings.some((rid) => String(s.id).includes(rid))
);
check('Raw Tripleseat IDs not in output (all hashed)', !idsLeaked);

// 8. Display name format
const nameRe = /^[A-Za-z][A-Za-z &-]* · [A-Za-z0-9][A-Za-z0-9 &-]*$/;
const badNames = sanitisedClean.filter((e) => !nameRe.test(e.name));
check(
  'Display names follow "Category · Venue" format',
  badNames.length === 0,
  badNames.length ? `BAD: ${badNames.map((e) => e.name).join(', ')}` : ''
);

console.log('');
if (failures === 0) {
  console.log('━━━ ALL CHECKS PASSED ━━━');
  console.log('Sanitiser is behaving correctly.');
  console.log('Safe to wire in real Tripleseat credentials.');
} else {
  console.log(`━━━ ${failures} CHECK(S) FAILED ━━━`);
  console.log('DO NOT proceed to live mode until these are fixed.');
  process.exit(1);
}
