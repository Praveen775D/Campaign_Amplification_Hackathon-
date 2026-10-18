#  Amplify — Campaign Amplification Hackathon MVP

A mobile-first platform that helps communities amplify campaign messages through collective contributions and estimated reach.

> **Core principle:** Contributions fund campaign message distribution, not the cause itself. Reach is an estimate, and successful funding does not automatically launch advertising.

##  Features

-  Browse campaigns, search, filter, and sort
-  Create campaigns through a five-step guided workflow
-  Auto-save drafts, resume editing, and submit for review
-  Simulate contributions with fee breakdowns and estimated reach
-  View receipts, activity history, and profile summaries
-  Track campaign progress and distribution reports
-  Demo campaign review with approval, rejection, and change requests
-  Responsive, mobile-first UI with polished navigation

##  Tech Stack

- **Frontend:** React Native, Expo, TypeScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL / Supabase
- **Development:** Git, REST API, Expo Go, EAS Build

##  Project Structure

```text
campaign-amplify/
├── mobile/              # Expo mobile application
├── backend/             # Express REST API
├── database/
│   └── schema.sql       # PostgreSQL schema
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

**Prerequisites:** Node.js 20+, npm, and Git.

### 1. Clone the repository

```bash
git clone https://github.com/Praveen775D/Campaign_Amplification_Hackathon-.git
cd Campaign_Amplification_Hackathon-
```

### 2. Start the backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

API health check: `http://localhost:5000/health`

By default, the backend uses in-memory demo data when PostgreSQL is not configured. Data stored in memory resets when the server restarts.

### 3. Start the mobile app

Open a new terminal:

```powershell
cd mobile
Copy-Item .env.example .env
npm install
npx expo start
```

Configure `EXPO_PUBLIC_API_URL` in `mobile/.env`:

| Environment | API URL |
|---|---|
| Android emulator | `http://10.0.2.2:5000/api` |
| iOS simulator | `http://localhost:5000/api` |
| Physical phone | `http://YOUR_PC_IP:5000/api` |

For a physical phone, connect both devices to the same Wi-Fi network and allow backend access through Windows Firewall.

### 4. Optional: Enable PostgreSQL / Supabase

1. Create a Supabase project.
2. Apply `database/schema.sql` using the Supabase SQL Editor.
3. Add your database connection string to `backend/.env` as `DATABASE_URL`.
4. Set `USE_DATABASE=true`.
5. Restart the backend.

Keep database credentials in the backend environment only. Never commit `.env` files.

##  Demo Workflow

1. Explore campaigns and open a campaign detail page.
2. Select a contribution amount and review the estimated reach.
3. Complete the simulated checkout and view the receipt.
4. Create a campaign using **Basics → Story → Campaign & Ad Visuals → Reach → Submit**.
5. Review campaign status, activity, and profile information.
6. Optionally demonstrate the reviewer endpoint for approval or change requests.

##  API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| GET | `/api/campaigns` | List and filter campaigns |
| GET | `/api/campaigns/:id` | Campaign details |
| POST | `/api/campaigns` | Create a campaign draft |
| PUT | `/api/campaigns/:id` | Update a draft |
| POST | `/api/campaigns/:id/submit` | Submit for review |
| POST | `/api/campaigns/:id/contributions` | Simulate a contribution |
| GET | `/api/campaigns/:id/report` | Campaign distribution report |
| GET | `/api/activity` | Activity feed |
| GET | `/api/profile` | Demo profile |
| POST | `/api/review/:id` | Demo reviewer action |

Campaign listing supports query parameters such as `q`, `category`, `sort`, and `status`.

##  Build Android APK

From the directory containing the Expo app's `package.json`:

```powershell
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

Configure the preview profile in `eas.json` to use `"distribution": "internal"` and `"android": { "buildType": "apk" }`. Download and test the resulting APK before sharing it.

##  Demo Limitations

- Checkout is simulated; no real payments are collected.
- Reach calculations are estimates, not guarantees.
- No advertising network is connected.
- Demo authentication and reviewer controls are not production-ready.
- Persistent storage requires a correctly configured database.
- Production deployment requires authentication, authorization, payment verification, and additional security controls.

##  Developer

**Praveen Udugundla**

- GitHub: [@Praveen775D](https://github.com/Praveen775D)

---

*Built for the Campaign Amplification Hackathon.*