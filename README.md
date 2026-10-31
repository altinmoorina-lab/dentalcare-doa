# DentalCare DOA: mobile-first prototype

Prototype website/app for **DentalCare DOA**, the dental clinic of Dr. spec. Shkumbin Bajrami
(Prosthodontics / Protetikë Stomatologjike, Kosovo), Instagram
[@dentalcaredoa.ks](https://www.instagram.com/dentalcaredoa.ks/).

One codebase, two ways to open it:

- **Phone:** Expo Go (iOS / Android), designed phone-first.
- **Web:** desktop and laptop browsers (responsive: phone, tablet, desktop layouts).

Albanian is the default language, with a one-tap English toggle.

Want to share it with a friend? See **Deploy the web version to Vercel** below.

## What's inside

- Hero, about the doctor, services (prosthetics, whitening, smile makeovers, general care), gallery with lightbox.
- Every place the phone number appears (sticky button, header, hero, footer, contact) opens a
  **bottom sheet** (centered dialog on desktop) with **Call** (`tel:+38349331466`) and
  **WhatsApp** (`https://wa.me/38349331466?text=…`, prefilled Albanian + English booking message).
- Opening hours table with today highlighted and a live **Open now / Closed** badge (computed in
  Prishtina time, DST aware, independent of the device timezone).
- Location with address, "Open in Maps" button and a key-free OpenStreetMap preview.
- Email `dentalcaredoa@gmail.com` (`mailto:`) in contact and footer.
- **Reviews without an account**: name, star rating, comment. Stored in SQLite through a small
  Express API (`/server`), newest first, average rating, animated cards, offline/error state.

## Quick start

Requirements: Node.js 20+ (LTS recommended; tested on 22) and npm. Nothing in the project is compiled
natively, so no C++ build tools / Python / Visual Studio are needed on any OS.

```bash
npm install          # also installs /server (postinstall; never fails the root install)
npm run dev          # API on :4871 + Expo dev server on :19471
```

- **Phone (Expo Go):** install *Expo Go*, make sure the phone is on the **same Wi-Fi** as the
  computer, then scan the QR code printed in the terminal (iOS: Camera app, Android: Expo Go scanner).
- **Web:** press `w` in the terminal, or open <http://localhost:19471>.

> Expo SDK 57 needs a recent Expo Go from the App Store / Google Play.

### Different networks, or Wi-Fi blocks device-to-device traffic: `--tunnel`

```bash
npm run dev:tunnel   # same as `npx expo start --tunnel --port 19471` + the API
```

The tunnel carries the app bundle only. The phone can't reach `localhost:4871` through it, so
expose the API too and tell the app where it is:

```bash
# in another terminal: any tunnel works (cloudflared, ngrok, localtunnel, ...)
npx localtunnel --port 4871          # prints https://something.loca.lt
EXPO_PUBLIC_API_URL=https://something.loca.lt npm run dev:tunnel
```

Without a reachable API the app still works: on web, reviews fall back to this browser's localStorage with a
"Demo" notice; in Expo Go, the reviews section shows sample reviews with a "can't reach the server" notice and
a retry button.

### How the phone finds the API

`src/config.ts` resolves the API base URL in this order:

1. `EXPO_PUBLIC_API_URL` (copy `.env.example` to `.env` or export it before starting).
2. Web on localhost / a LAN address: the page's own hostname on port `4871`. On a public hostname (e.g. a Vercel deploy)
   there is no API and reviews use browser localStorage (see the Vercel section). The same fallback is used on web if the API can't be reached.
3. Expo Go on LAN: the Metro host IP (your computer's LAN address) on port `4871`, so it works
   with no configuration on the same Wi-Fi. Android emulator falls back to `10.0.2.2`.

If it can't connect, allow Node through your OS firewall for ports `4871` and `19471`.

### Windows notes

- Use **Node.js 20+ LTS** from <https://nodejs.org> and a normal terminal (PowerShell, Windows Terminal or Git Bash).
- Put the project in a plain folder such as `C:\dev\dentalcare-doa`, **not** inside OneDrive, Desktop or
  Documents (sync clients lock files in `node_modules` and the database file and cause odd install errors).
- If you ever see `gyp ERR!`, you are on an old copy: the project no longer uses native modules. Delete
  `node_modules` and `server/node_modules`, update to the latest code and run `npm install` again.
- Allow Node.js through Windows Firewall (private networks) so your phone can reach ports `19471` and `4871`.
- If `npm run dev` prints that the API stopped, the app keeps running with sample reviews; read the
  error above it, fix it and start the API separately with `npm run server`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | API + Expo (LAN, QR code for Expo Go) |
| `npm run dev:tunnel` | API + Expo with `--tunnel` |
| `npm start` / `npm run web` | Expo only (`web` opens the browser) |
| `npm run server` / `npm run server:dev` | API only (`server:dev` auto-restarts). If the API crashes, `npm run dev` keeps Expo running |
| `npm run typecheck` | `tsc` for the app and the server |
| `npm test` | Opening-hours unit tests + API tests |
| `npm run build:web` | Static web build into `dist/` (what Vercel runs) |

Dev servers use uncommon ports: Expo **19471**, API **4871** (`PORT=… npm run server` to change the API port).

## Deploy the web version to Vercel (Windows, no coding needed)

The website is a static build, so it deploys to [Vercel](https://vercel.com) for free. Config is already in
`vercel.json` (build command `npm run build:web`, output folder `dist`, single-page routing, caching).

1. Install **Node.js 20+ LTS** from <https://nodejs.org>, and create a free account at <https://vercel.com/signup>.
2. Put the project in a simple folder such as `C:\dev\dentalcare-doa` (not OneDrive/Desktop), open
   **PowerShell** in it and run:
   ```powershell
   npm install
   npx vercel login
   npx vercel --prod
   ```
   `vercel login` opens your browser to sign in. For the questions of `vercel --prod` answer:
   - *Set up and deploy?* **Y**
   - *Which scope?* your account (just press Enter)
   - *Link to existing project?* **N**
   - *Project name?* e.g. `dentalcare-doa` (press Enter)
   - *In which directory is your code located?* press Enter (`./`)
   - If it asks about settings: framework preset **Other**, build command `npm run build:web`, output directory `dist`
     (these are already set by `vercel.json`, so it normally won't ask).
3. When it finishes it prints a **Production** link like `https://dentalcare-doa.vercel.app`. Send that link to your friend.
4. To publish changes later, run `npx vercel --prod` again.

You can check the build locally first: `npm run build:web`, then `npx serve -s dist` and open the printed address.

### Reviews on the Vercel version (important)

Vercel can't run the Express/SQLite server from `/server`. When the site has no reviews API (the default on
Vercel), reviews fall back to **this browser's localStorage**, merged with the labelled sample reviews: visitors can
write a review without an account and see it right away, but it is **only visible on their own device**, and the
page says so ("Demo: reviews are saved in this browser"). This is a demo behaviour, not a real shared database.

### Shared reviews (recommended next step, not built)

To make reviews shared and permanent for all visitors, host a small database and expose `GET/POST /reviews`:
Vercel serverless functions plus **Vercel Postgres (Neon)**, **Upstash Redis** or **Supabase** all have free tiers.
Then set `EXPO_PUBLIC_API_URL` (Vercel project > Settings > Environment Variables) to that API's address and redeploy;
the app switches to it automatically. The existing `/server` already defines the API contract (validation and spam
rules) to port. Alternatively host `/server` itself on a service with a persistent disk (Render, Railway, Fly.io).

## Reviews API (`/server`)

Node + Express 5 + SQLite via [`sql.js`](https://sql.js.org) (SQLite compiled to WebAssembly, so
`npm install` needs **no native compilation**). The database is kept in memory and written atomically to
`server/data/reviews.sqlite` after every change; the file is created on first run
(git-ignored) and seeded with 4 clearly-labelled **sample** reviews on first run
(`SEED_DEMO_REVIEWS=false` to disable).

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/reviews?limit=20&offset=0` | `{ reviews: [...newest first], stats: { count, average } }` |
| `POST` | `/reviews` | body `{ name, rating, comment }`; `201`, `422` validation, `409` duplicate, `429` limits |
| `GET` | `/health` | liveness |

Validation and spam protection: name 2–60, rating integer 1–5, comment 5–600 characters; HTML angle
brackets and control characters stripped; links rejected; repeated-character spam rejected; 8 KB body
limit; global rate limit (120 req/min/IP) plus 10 posts/hour/IP; max 3 reviews per IP per 24 h
(IP stored only as a salted hash); duplicate comments blocked; honeypot field `website`; CORS
(open in dev, restrict with `ALLOWED_ORIGINS`).

| Env var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4871` | API port |
| `DB_PATH` | `server/data/reviews.sqlite` | SQLite file (`:memory:` for tests) |
| `SEED_DEMO_REVIEWS` | `true` | Seed sample reviews when the DB is empty |
| `ALLOWED_ORIGINS` | any | Comma-separated CORS allow-list |
| `IP_HASH_SALT` | dev value | Salt for hashed IPs (set in production) |
| `TRUST_PROXY` | `false` | Set `true` behind a reverse proxy so IP limits see the real client |

App-side: `EXPO_PUBLIC_API_URL` (see above).

## Project layout

```
App.tsx                 root: fonts, providers, scroll container
src/clinic.ts           clinic data: phone, email, address, hours   <- edit real details here
src/config.ts           API base URL resolution
src/i18n/               Albanian + English strings
src/components/         Hero, About, Services, Reviews, Gallery, Hours, Location, ContactSheet, ...
src/lib/                hours logic (+ tests), API client, reviews store, link helpers
server/                 Express + SQLite reviews API (+ tests)
assets/images/          clinic crops (Instagram) and stock placeholders (see CREDITS.md)
docs/screenshots/       phone and desktop screenshots
```

## Placeholders to replace before launch

- **Address / map pin:** "Bulevardi Nënë Tereza, 10000 Prishtinë" with coordinates near the city
  centre (`src/clinic.ts`) is a placeholder.
- **Opening hours:** Mon–Fri 09:00–19:00, Sat 09:00–14:00, Sun closed is an example schedule.
- **Email:** `dentalcaredoa@gmail.com` as provided for the prototype; phone `+383 49 331 466` is the number given for the prototype.
- **Photos:** hero, about, services and most gallery images are Unsplash stock (they don't show the clinic).
  Logo and three gallery tiles are cropped from an Instagram screenshot (low resolution).
- **Copy:** service descriptions and the about text are general, non-clinical wording; no prices or
  medical claims. Have the doctor review them.
- **Sample reviews** are labelled "Shembull / Sample". Remove them (delete the DB or
  `SEED_DEMO_REVIEWS=false`) before showing real reviews.
- **Map tiles** come from the public OpenStreetMap tile server (fine for a prototype; use a
  provider/plan suited to production traffic when launching).
- Deployment is not set up: host the API somewhere persistent (it needs a writable disk for SQLite) and
  set `EXPO_PUBLIC_API_URL` at build time.
