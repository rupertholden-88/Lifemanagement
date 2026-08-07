# Home Base

A personal life-management app: fitness tracking, meal planning, a recipe bank, and household inventory — built around the Weekly Fitness Plan and Weekly Meal Plan.

Works on phone, tablet and laptop. Deploys as a static site + one serverless function on Vercel.

## What's inside

| Section | What it does |
|---|---|
| **Home** | Today at a glance — today's training session, tonight's dinner (with pantry check), weekly fitness score, low-stock alerts |
| **Fitness** | The full weekly plan (easy runs, Strength A/B with exercise checklists, rotating Saturday quality run). Log sessions, earn points, keep streaks, track weight / resting HR / body fat / 5K time against targets |
| **Meals** | Weekly dinner planner, meal suggestions ranked by what's already in stock, meal library with likes and custom meals. "Cook this" logs the meal **and automatically decrements the matching pantry items** |
| **Recipes** | Paste a recipe link — ingredients, timings and method are extracted automatically (schema.org data via a serverless function). Save, like, and push recipes into the meal library |
| **Stock** | Food tracked by exact count (e.g. 4 tins of chopped tomatoes), household essentials by low/medium/high (toilet roll, bin bags…). Add/remove items, Amazon reorder links, low-stock alerts, and an auto-built shopping list |

## Running locally

```bash
npm install
npm run dev
```

With no configuration the app runs in **local-only mode**: no login, data saved in the browser's localStorage. Fine for trying it out on one device.

## Cross-device sync (Firebase)

To get sign-in and real-time sync across phone/tablet/laptop:

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (any name, Analytics optional).
2. **Build → Authentication → Get started → Email/Password → Enable**.
3. **Build → Firestore Database → Create database → Production mode** (pick a region close to you, e.g. `europe-west2`).
4. In Firestore → **Rules**, paste the contents of [`firestore.rules`](./firestore.rules) and publish. (Users can only read/write their own data.)
5. **Project settings → General → Your apps → Web app** (`</>` icon) → register an app → copy the config values.
6. Copy `.env.example` to `.env.local` and fill in the six `VITE_FIREBASE_*` values.

Restart the dev server — the app now shows a sign-in screen, and the same account sees the same data everywhere. On first sign-in, the starter inventory and meal plan are seeded automatically.

## Deploying to Vercel

1. Push this repo to GitHub and import it in [vercel.com](https://vercel.com) → **New Project**. Vercel auto-detects Vite; no build settings needed.
2. In **Project → Settings → Environment Variables**, add the six `VITE_FIREBASE_*` values (same as `.env.local`).
3. Deploy. The recipe importer (`api/recipe-summary.ts`) is picked up automatically as an Edge Function.
4. In Firebase → **Authentication → Settings → Authorized domains**, add your `*.vercel.app` domain (and any custom domain).

Without the Firebase env vars, the deployed app still works — it just runs in single-device, local-storage mode.

## Notes

- **Ingredient ↔ inventory matching** is by name (case-insensitive, partial). Keep inventory item names close to the ingredient names used in meals — e.g. meal ingredient "tinned tomatoes" matches inventory item "Tinned tomatoes".
- **Scoring**: each session has a points value (easy run 10, Strength A 15, Strength B 20, quality run 25, active recovery 5 — 85/week max). Partial completion of a strength circuit earns proportional points.
- The Saturday quality run rotates weekly (intervals → tempo → long easy → 5K benchmark) from the date you first opened the app.
