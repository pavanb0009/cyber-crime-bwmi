# Supabase setup (about 5 minutes)

CyberDesk uses Supabase for optional login, persistent submitted reports, and private evidence files. Guest reports and unfinished drafts still work on the device. The Railway call-scanner service is unchanged.

## Free tier

Supabase free plan includes Auth, Postgres, and **Storage (~1 GB)**. That is enough for a demo of synced screenshots/PDFs. Files are private; only the signed-in owner can open them.

## Steps

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the full contents of [`supabase/reports.sql`](./supabase/reports.sql), and run it once.
   - Creates the `reports` table + RLS
   - Creates private Storage bucket `evidence` + owner-only policies
3. For instant demo accounts, open **Authentication → Providers → Email** and turn off **Confirm email**. Keep email/password enabled.
4. In **Authentication → Users**, create the reviewer account shown on `/login`:
   - Email: `demo@cyberdesk.in`
   - Password: `demo1234`
   Then sign in once and submit a sample report so Track has demo data.
5. Open **Project Settings → API** and copy:
   - Project URL
   - Publishable/anon key (never use the service-role key in the frontend)
6. For local development, copy `.env.example` to `.env` or `.env.local` and set:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

7. Restart `npm run dev` after saving env vars.
8. In Vercel, add the same two variables (mark as safe to expose / Config - the `VITE_` prefix is required). Redeploy.

No Docker, database server, backend migration process, or Railway change is needed.

## Quick test

1. Sign in → Report → **Add sample screenshots** (or upload real images/PDF) → submit.
2. Acknowledgement and **Track** should list the evidence. Synced files show an **Open** link.
3. Sign out, sign in on another browser → Track the same case → evidence still opens.
4. Another account must not see those files.

If Storage was created earlier without policies, re-run the Storage section of `reports.sql`. If Supabase is unavailable, CyberDesk keeps guest/local mode and still lists evidence names on this device.
