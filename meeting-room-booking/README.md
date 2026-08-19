# Meeting Rooms

A small internal web app for booking meeting rooms. Anyone with the office
PIN can see which rooms are free right now on each floor and book a room for
a free-form time slot. A separate admin PIN unlocks room/floor management.

No individual accounts -- just a shared PIN, like a door code. Built with
Next.js (App Router) + Supabase (Postgres, used purely as a database, not
for auth).

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is enough).
2. Click **New project**. Pick any name/region and a database password (save it somewhere).
3. Wait ~2 minutes for it to finish provisioning.

## 2. Run the database migration

1. In your Supabase project, open the **SQL Editor** (left sidebar).
2. Open `supabase/migrations/0001_init.sql` from this project, copy its entire contents, paste into the SQL editor, and click **Run**.
   - This creates the `floors`, `rooms`, `bookings` tables and seeds 3 floors with 3/2/1 rooms (rename these later from the Admin page).

## 3. Get your API keys

In your Supabase project: **Project Settings → API**. You need:
- **Project URL**
- **service_role** key (under "Project API keys" -- NOT the `anon` key). This key is secret: it's only ever used on the server, never in the browser.

## 4. Configure the app

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste in your Project URL and service role key:

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

The door PIN (`2600`) and admin PIN (`4444`) work out of the box. To change
them, uncomment and edit `APP_PIN` / `ADMIN_PIN` in `.env.local` (or set them
as environment variables in Vercel later).

## 5. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, enter the PIN, and you're in.

## 6. Deploy it so colleagues can use it

The easiest option is [Vercel](https://vercel.com) (free tier is enough for
an internal tool):

1. Push this project to a GitHub repo (or use `vercel` CLI directly from this folder).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Under **Environment Variables**, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` with the same values as your `.env.local` (and `APP_PIN`/`ADMIN_PIN`/`SESSION_SECRET` if you customized them).
4. Click **Deploy**. Vercel gives you a URL like `https://your-app.vercel.app`.
5. Generate a QR code for that URL and print it for the door -- no need to share the link with anyone.

## How it works

- **PIN screen (`/login`)** — enter `2600` (or your own PIN) to get in. Entering the admin PIN (`4444`) instead grants both normal and admin access. The session is remembered in the browser for 30 days.
- **Dashboard (`/`)** — every floor with its rooms, showing Available / Busy right now, and when a busy room frees up.
- **Room page (`/rooms/[id]`)** — enter your name and book any start/end time; if it overlaps an existing booking you'll see e.g. *"Room unavailable from 8:00 AM to 9:00 AM."* Upcoming bookings for that room are listed below, with a Cancel button for any booking (there are no individual accounts, so anyone with the PIN can cancel any booking).
- **My bookings (`/my-bookings`)** — search upcoming bookings by the name you used when booking, with cancel.
- **Admin (`/admin`)** — enter the admin PIN to add/rename/delete floors, and add/rename/move/delete rooms between floors.

## Security notes

- This app trades individual accounts for simplicity: the PIN is the only
  gate. That's a reasonable fit for a small trusted team booking meeting
  rooms, but it's not meant for sensitive data -- anyone with the PIN can see
  and cancel everyone's bookings.
- The Supabase **service role** key bypasses all database security rules and
  is only ever read on the server (`src/lib/supabase/server.ts`). Never put
  it in a `NEXT_PUBLIC_...` variable or a client component.
- The PIN session cookie is signed (HMAC) so it can't be forged by editing
  cookies in devtools, but the default `SESSION_SECRET` is a public fallback
  -- set your own random `SESSION_SECRET` in Vercel for a bit more privacy.

## Notes

- `src/lib/database.types.ts` has hand-written TypeScript types for the
  schema. If you change the schema, update this file to match.
