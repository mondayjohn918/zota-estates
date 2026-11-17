# Zota Estates website (ZOTA-ESTATES LTD, Sapele)

Static site: 8 pages, ready for GitHub Pages or Hostinger. `index.html` is at the root. Preview it with the `zota-estates-site` entry in `.claude/launch.json` (port 5196).

**Pages:** Home · Properties · Property detail (`property.html?id=…`) · Services · About · Reviews · Contact · Ask Zota (assistant)

**Design:** "Rooted in Sapele". The palette is Sapele-mahogany (#7a3322) with Ethiope river green (#22302b) on warm cream, and faint timber-batten lines echo the slatted door in their own tour video. Type is Zodiak (display serif) with General Sans, both self-hosted from Fontshare under the free licence.

## Real data used (from their Google Business profile, 17 Nov 2026)
- Address: Total Filling Station, opp. New Road Junction, Sapele 331107, Delta
- Phone: 0703 098 5685 · Open 24 hours · Plus code VPF2+WW
- Rating: 4.8 from 12 reviews. Three reviews are quoted word-for-word.
- Services, from their signboard in their own video: Buy, Sell, Rent, Lease, Developer, Manager
- Media: 2 owner videos and 2 owner photos, in `assets/video` and `assets/img`

## CONFIRM WITH CLIENT before launch
1. Is 0703 098 5685 on **WhatsApp**? (Set in `assets/main.js` → `SITE.whatsapp`.)
2. **Founder name, title and story** for the About page (yellow placeholder).
3. The two listed properties: status, price, rooms, size, exact location and title documents (`listings.json`).
4. More listings with photos and video.
5. Exact scope and fees for each service, particularly "Develop" and "Manage".
6. Real credentials, if any: CAC RC number, REDAN/NIESV membership.
7. Email address, logo (the current mark is a typographic "Z" arch), and domain. Update `BASE` URLs in canonical/og tags.
8. Permission to show the remaining 9 Google reviews, word-for-word.

## Ask Zota assistant
This is a rule-based helper, not AI. It runs in the browser, stores nothing, and turns the visitor's needs into a prefilled WhatsApp message to Zota.

A real AI chat would need an API key held on a server: a serverless proxy such as a Cloudflare Worker, plus a paid model API. Never put a key in this static site.

`_source/` holds the raw downloads. It is ignored by git, so don't deploy it.

## Stock media (Pexels License: free for commercial use, no attribution required)
- Hero video `assets/video/hero-homes.mp4`: a compilation of Pexels videos 40808151, 38675652 and 39105099. Stills `tropical-home`, `villa-lawn`, `timber-lights` and `modern-drive` are frames from Pexels videos 40808151, 38675652, 39105099 and 37544730.
- Photos: `keys-smile` (Pexels 4971275), `key-handover` (7579196), `couple-keys` (7579211), `couple-home` (8470840, unused).
- These are illustrative only. The home-page gallery is captioned as such, and the listings use Zota's own photos.
