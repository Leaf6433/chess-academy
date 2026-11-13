# Chess Academy accounts — deployment checklist

The site can run without Supabase. When no valid public config is present, the user can continue saving locally.

## Prerequisites

1. Supabase project `mnunukmarlirfrhttyrp` is connected to ChatGPT and verified.
2. **Completed:** The SQL in [`001_progress.sql`](001_progress.sql) was applied via a Supabase migration on November 12, 2026. The table, RLS, three owner-only policies and authenticated grants were verified; anon has no SELECT permission. Do not run the SQL again unnecessarily.
3. Enable Email provider in Supabase **Authentication → Providers**. Keep email confirmation enabled. Set a secure auth email service for production if needed.
4. In **Authentication → URL Configuration**, set the Site URL to `https://leaf6433.github.io/chess-academy/` and allow that same address in Redirect URLs. For local development also allow `http://localhost:8765/` where appropriate.
5. **Completed:** `supabase-config.js` now has `enabled: true`, your project's URL and its verified public publishable key. Do not add a service-role key, `sb_secret_` key, database password, or personal user password to the repository.
6. Push to `main`; check that the GitHub Pages workflow passes. Test signup and email confirmation with a dedicated test account, sign-out, sign-in, and account-specific data isolation on two test accounts.
7. On first sign in, the website explicitly offers **Use cloud progress** or **Upload this device's progress**. Download a JSON backup before overwriting either copy. Once selected, future local changes sync automatically while online.

## Security and conflict handling

- A single user's complete progress snapshot is stored under their Auth user UUID.
- Public website credentials are **publishable only**; real access control is enforced by owner-only database RLS.
- Optimistic revision matching avoids silently overwriting changes from another device. A revision mismatch pauses syncing and requires user action to choose the desired copy.
- Local storage continues to function if the network is unavailable or account setup isn't configured.
- Email/password is managed by Supabase Auth; Chess Academy never writes passwords into its own stored progress.
- Progress is not automatically uploaded upon sign-in; the user selects which source to keep.
- No server admin API or role key is included.

## Tests still required after backend connection

- Signed-out browser cannot read or write any account progress.
- Signed-in user A cannot read or overwrite B's data.
- Signup with email confirmation, password reset, and sign-out clear the active user.
- New account can upload existing local progress without losing records.
- Existing account can load saved cloud progress on a new browser.
- Simultaneous conflicting edits stop automatic upload until reviewed.
- Offline saves remain intact and sync resumes on reconnection.
