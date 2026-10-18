# Amplify — Campaign Amplification Hackathon MVP

A mobile-first React Native (Expo + TypeScript) prototype with an Express API and PostgreSQL/Supabase support.

> **Product rule:** contributions fund distribution of a campaign message, not the cause, person, or organization described in that message. Reach is always an estimate, never a guarantee. Successful funding does not automatically launch advertising.

## Included flows

- Browse Home and Explore without signing in; search, categories and sorting.
- Campaign details with editorial story, visible sources, audience settings and expandable use-of-funds explanation.
- Five-step creation in the required order: **Basics → Story → Campaign & Ad Visuals → Reach → Submit**.
- Automatic draft saves (debounced), manual save, draft resume and form state retention.
- Submission for review and status timeline.
- Simulated contribution checkout with amount presets, configurable fees, estimated reach, receipt and updated progress.
- Activity feed and profile summary.
- Demo review endpoint for requesting changes, approving or rejecting submissions.
- Campaign report fields distinguish raised funds, ad spend, impressions, clicks, estimated reach and measured reach.
- PostgreSQL schema. The backend runs in local demo-memory mode if `DATABASE_URL` is not configured.

## UI/UX polish included

- Refined visual system with clearer typography, spacing, softer surfaces and consistent green brand accents.
- Added a compact Amplify brand header and profile shortcut on Home.
- Improved campaign-card hierarchy, action sizing, input affordances and bottom navigation.
- Centered the content to a readable maximum width on desktop web while preserving mobile-first layouts.
- Wrapped the app in `SafeAreaProvider` to prevent the safe-area context crash on web.
- Set the example API URL for local browser testing; change it for Android emulator or physical-device testing as described below.

## Project structure

```text
campaign-amplify/
  mobile/                 Expo React Native app
  backend/                Express REST API
  database/schema.sql     PostgreSQL schema
  .gitignore
```

## 1. Requirements

Install Node.js 20 LTS or newer and Git. Android Studio is optional for the Android emulator; Expo Go is enough for local device testing.

## 2. Start the backend (PowerShell)

Open PowerShell:

```powershell
cd path\to\campaign-amplify\backend
Copy-Item .env.example .env
npm install
npm run dev
```

The API starts at `http://localhost:5000`. Check `http://localhost:5000/health`.

By default, it uses seeded in-memory demo data. This is intended for a fast hackathon demo; restarting the server resets in-memory data.

### Use Supabase/PostgreSQL (optional, recommended for persistence)

1. Create a Supabase project.
2. In Supabase, open **Project Settings → Database** and copy the connection string. Use the pooler string if your network requires it.
3. Run `database/schema.sql` in the Supabase SQL Editor.
4. Put the connection string into `backend/.env` as `DATABASE_URL=...`.
5. Set `USE_DATABASE=true` and restart the backend.

Do not put database credentials in the mobile app. Keep `DATABASE_URL` only in `backend/.env`.

The API currently uses the database schema for durable campaigns and contributions when configured; demo seed data is used only in memory mode. If connecting to a managed database, ensure the schema has been applied before starting the API.

## 3. Start the mobile app (new PowerShell window)

```powershell
cd path\to\campaign-amplify\mobile
Copy-Item .env.example .env
npm install
```

Set the API URL in `mobile/.env`:
- Android emulator: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api`
- iOS simulator: `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
- Physical phone: use your PC's LAN IPv4 address, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.5:5000/api` (phone and PC on same Wi-Fi).

Then:

```powershell
npx expo start
```

Scan the QR code using Expo Go. If using a phone, allow Node.js through Windows Firewall on private networks.

## 4. Demo journey (recommended)

1. Home → open a campaign → read story and sources.
2. Back this campaign → choose ₹250 → review fees/reach → **Simulate successful payment**.
3. Check updated campaign progress and receipt confirmation.
4. Create → Create manually → complete all five steps → Submit for review.
5. Activity/Profile → see the submitted campaign.
6. Optional reviewer demo: call the review endpoint below to approve or request changes.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/campaigns` | List campaigns; supports `q`, `category`, `sort`, `status` |
| GET | `/api/campaigns/:id` | Campaign detail |
| POST | `/api/campaigns` | Create/update draft |
| PUT | `/api/campaigns/:id` | Update draft |
| POST | `/api/campaigns/:id/submit` | Submit draft for review |
| POST | `/api/campaigns/:id/contributions` | Simulated contribution |
| GET | `/api/campaigns/:id/report` | Distribution report |
| GET | `/api/activity` | Activity and notifications |
| GET | `/api/profile` | Demo profile |
| POST | `/api/review/:id` | Demo reviewer action (`approve`, `changes`, `reject`) |

### Review a submitted campaign

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5000/api/review/CAMPAIGN_ID" `
  -ContentType "application/json" `
  -Body '{"action":"approve","note":"Creative and sources reviewed for demo."}'
```

This endpoint is intentionally a demo-only reviewer shortcut. Before production, add real authentication, reviewer role checks, rate limits, audit controls, and payment provider verification.

## Build an Android APK

For a local installable APK, use EAS Build:

```powershell
cd mobile
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

When prompted, use the Expo account you control. EAS will provide a build URL when complete. The included `eas.json` configures an APK preview build. You can also test locally with Expo Go before building.

## Important demo limitations

- Checkout is simulated. No real money is collected and no payment receipt is a tax invoice.
- Reach estimate is configurable demo math (`REACH_PER_RUPEE`); not guaranteed.
- No real ad network is connected. A campaign remains in `available_for_funding` / `distribution_preparation` until a reviewer explicitly authorizes the next lifecycle step.
- Demo identity is a fixed sample profile; authentication is not production-ready.
- Voice creation uses device speech input only if you add a speech library; manual entry is always available.
- Admin review is exposed as a backend demo endpoint rather than a mobile bottom-navigation destination, as permitted by the brief.
