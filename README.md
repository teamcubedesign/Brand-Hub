# Brand Hub

One place for every client's brand kit: basics, colours, fonts, Drive links, templates and notes. New designers open a client's profile and have everything they need to start.

> **Status: UI prototype.** It runs on local sample data with a mock sign-in. To connect a real database and Google sign-in, see [HANDOVER.md](HANDOVER.md).

## Run it

```bash
npm install
npm run dev
```

1. Open http://localhost:3000.
2. Click **Continue with Google**. This is a mock: it signs you in as the sample admin.
3. To see what editors and viewers see, open the user menu (top right) and pick someone under **Preview as**.

Changes you make are saved to `.mock-db/db.json`. To restore the sample data, run:

```bash
npm run mock:reset
```

## What's in it

- **Dashboard**
  - Client cards showing each brand's colour palette
  - Search across names, industries, tags and services (press `/` to jump to it)
  - Status and industry filters with counts, sorting, and grid or list view
- **Client profile**
  - **Start here:** pinned links shown at the top of the profile
  - **Copy brief:** copies the whole brand kit as text to paste into WhatsApp or email
  - **Overview:** about the brand, tone of voice and social profiles
  - **Colours:** click any HEX, RGB or CMYK value to copy it
  - **Fonts:** previewed in the font itself when it's installed, plus a link to the font files
  - **Do's and don'ts**
  - **Resources:** links grouped by category, with Drive, Docs, Sheets, Slides, Figma, Canva, Dropbox, Notion and other providers detected. Copy, open, pin, edit and delete each one.
  - **Notes**
- **Create, edit, archive and delete clients.** Deleting is admin-only and needs the client's name typed to confirm.
- **Team page:** admins change roles here.
- **General:**
  - Light, dark and system themes
  - Confirmation toasts
  - Loading skeletons
  - Works on phones

## Project layout

| Path | What's there |
|---|---|
| `src/app/(app)/` | Signed-in pages: dashboard, client profile, new/edit, team |
| `src/app/actions.ts` | Server actions for every create, update and delete |
| `src/lib/data/` | Data layer (mock today; see HANDOVER.md) |
| `src/components/` | Shared UI: forms, toasts, copy button, menus |
| `src/lib/links.ts` | Link categories, provider detection, Drive thumbnail URLs |
| `supabase/migrations/` | Suggested database schema for the real backend |
