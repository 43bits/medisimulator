# HMS Mobile — Expo Go App

React Native app for MedSimulator HMS. Matches the Meridian design system from the web frontend.

## Setup

```bash
cd mobile
npm install
npm start        # opens Expo Dev Tools
```

Scan the QR with **Expo Go** (iOS App Store / Google Play).

## Physical device

Edit `services/api.ts` — change `API_BASE_URL` to your machine's LAN IP:
```ts
export const API_BASE_URL = 'http://192.168.1.XXX:3000';
```

## Screens

| Screen | Description |
|---|---|
| Login | Username + password, SecureStore token |
| Dashboard | KPIs, quick actions, alerts, pull-to-refresh |
| Appointments | Scheduled list + Online Requests tab (role-gated) |
| Patients | Search, paginated list |
| Profile | Account info, API endpoint, sign out |

## Credentials

Same as web: `admin` / `password123`
