# Handover: connecting Brand Hub to a real backend

The UI and its behaviour are finished. Everything currently runs on a **local mock**: sample data saved to `.mock-db/db.json` and a fake sign-in. This note lists exactly what to replace. Nothing outside these files needs to change.

## What's mocked, and where

| File | What it does now | Replace with |
|---|---|---|
| `src/lib/data/index.ts` | **The data layer.** Every read and write in the app goes through these ~20 functions. | The same functions, same signatures, backed by your database. |
| `src/lib/data/store.ts`, `src/lib/data/seed.ts` | JSON-file storage and sample data | Delete both once `index.ts` uses the real database. |
| `src/lib/auth.ts` → `getCurrentUser()` | Reads a profile id from the `bh_mock_user` cookie | Read the real session and return the user's `Profile`, or `redirect("/login")`. |
| `src/app/auth-actions.ts` | `signIn` signs in as the first admin; `switchUser` is demo-only | Google OAuth sign-in and sign-out. **Delete `switchUser`.** |
| `src/components/user-menu.tsx` | Has a "Preview as · Demo" block for switching users | Delete that block (it's marked with a comment). |
| `src/proxy.ts`, `src/lib/auth-cookie.ts` | Redirects to `/login` based on the mock cookie | Check the real session cookie, or refresh it here if your auth library needs that. |
| `src/app/login/page.tsx` | "Continue with Google" posts to the mock `signIn` | Start the real OAuth flow. Keep the UI. |
| `src/app/logout/route.ts` | Clears a stale mock cookie | Keep it or drop it, depending on the auth library. |

## Contract the UI relies on

- **Types:** `src/lib/types.ts` (`Client`, `ClientSummary`, `BrandColor`, `BrandFont`, `Link`, `NoteWithAuthor`, `Profile`).
- **`listClients()`** returns each client with `linkCount` and `palette` (the client's colour hexes, in order). The dashboard cards use both.
- **`getClientDetails(id)`** returns colours and fonts sorted by `position`, links sorted by `position` then `created_at`, and notes newest first with an `author`.
- **Updated time:** any change to a client's links, colours, fonts or notes must bump that client's `updated_at`. The dashboard sorts and labels by it.
- **Roles:**
  - `admin`: everything, plus changing roles and deleting clients.
  - `editor`: create and edit everything else.
  - `viewer`: read-only.
- **Where roles are checked:** `src/app/actions.ts` checks roles for friendly errors. **Enforce the same rules in the database too.**
- **New sign-ins:**
  - Only company Google accounts (`@cubehq.ai`) may sign in.
  - The first user becomes admin.
  - Everyone else joins as a viewer.

## Suggested schema

`supabase/migrations/0001_init.sql` is a ready Postgres schema for this contract. It includes:
- tables matching the types
- row-level security for the three roles
- a trigger that rejects non-company emails and makes the first user admin
- triggers that bump `updated_at`

It was written for Supabase but is plain Postgres apart from `auth.users`. Use it or adapt it.

## Running the mock

```bash
npm install
npm run dev          # http://localhost:3000, click "Continue with Google"
npm run mock:reset   # restore the sample data
```

To try each role, use the user menu (top right) → **Preview as**.
