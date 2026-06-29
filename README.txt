WebsiteGap accuracy fix — what's in here
=========================================

PROBLEM THIS FIXES
-------------------
1. "No Website" was wrong for most leads. The old code only cross-checked
   the first 10 leads per search against Google CSE; the other 600+ just
   inherited OSM's `website` tag, which is frequently blank even for real
   businesses (e.g. Vapiano, which has vapiano.se).
2. Most addresses showed "No address listed" because OSM's addr:* tags are
   often blank too, even though we already have the lat/lon.

WHAT CHANGED
------------
- lib/verifyWebsite.ts (rewritten)
  Every lead now gets a FREE check first: guess a domain from the business
  name + likely TLD (using the search location to guess a country code,
  e.g. .se for Sweden), and see if it actually responds live. This is what
  catches "Vapiano Stureplan" -> vapiano.se without spending any API quota.
  Only leads the free guess can't resolve fall back to Google CSE, capped
  at 90/day (under your 100/day free limit) so it can never run away on you.
  Google CSE itself wasn't touched/replaced — same engine as before, your
  GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID env vars work unchanged.

- types/index.ts
  Added a `confidence` field: 'confirmed' | 'likely' | 'unconfirmed' | 'pending'.
  This is the honesty layer — a lead only gets labeled "No Website" once
  that's actually been confirmed. If we couldn't check it, it now says
  "Unconfirmed" instead of silently asserting something we don't know.

- lib/overpass.ts
  Tags each lead 'confirmed' (OSM had the site) or 'pending' (needs checking)
  on the way in.

- app/api/search/route.ts
  No longer does verification inline (removed the old top-10 cap). Returns
  results immediately; verification now happens in the background (below).

- app/api/verify-batch/route.ts (NEW)
  The dashboard calls this in batches of 15 right after a search, to verify
  every lead instead of just the first 10.

- app/api/reverse-geocode/route.ts (NEW)
  Turns a lead's lat/lon into a real street address via Nominatim, on demand.
  Throttled server-side to ~1 req/sec to stay within Nominatim's usage policy
  regardless of how many users hit it at once.

- lib/nominatim.ts
  Added reverseGeocodeCoords() + the throttle above. Your existing
  geocodeLocation() now goes through the same throttle (harmless, same host).

- app/dashboard/page.tsx
  After a search loads, kicks off two background passes:
    1. runBackgroundVerification - batches of 15 leads to /api/verify-batch
    2. runAddressResolution - one at a time, ~1.1s apart, to /api/reverse-geocode
  Both check a run-id so if you search again before they finish, the stale
  background work quietly stops instead of overwriting the new results.

- components/StatusBadge.tsx + BusinessCard.tsx
  Badge now has 4 states: Verified Website / Has Website / Checking… /
  Unconfirmed / No Website. Address shows "Locating address…" while the
  background reverse-geocode is running for that card.

- app/globals.css
  Added .badge-checking (pulsing gray) and .badge-unconfirmed (amber) to
  match your existing badge styling.

- lib/exportUtils.ts
  CSV export now includes a Confidence column, so a Pro customer exporting
  leads can see which ones were actually verified vs. unconfirmed.

NO ENV CHANGES NEEDED
----------------------
Your existing GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID in .env.local are used
exactly as before — nothing to rotate or add.

HOW TO APPLY
------------
Copy each file over its matching path in leadmap-next, preserving the same
folder structure as in this zip (app/, components/, lib/, types/). Two are
brand new files in brand new folders (app/api/verify-batch/route.ts and
app/api/reverse-geocode/route.ts) — just create those folders.

Verified with: npx tsc --noEmit (clean) and npx next build (clean, both new
routes registered: /api/reverse-geocode, /api/verify-batch).

STILL OPEN: RATINGS
--------------------
You also asked about showing star ratings on each lead. Real ratings data
only exists behind paid APIs right now — Google Places' $200/mo free credit
ended Feb 2025, and Foursquare's ratings field has no free tier either, both
now require a card on file. I didn't wire anything up for this yet since
it's a new recurring cost decision, separate from the fix above. Let me know
which way you want to go and I'll build it.
