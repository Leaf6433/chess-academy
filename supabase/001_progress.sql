-- Chess Academy account progress; run once in a Supabase SQL editor.
-- SECURITY: Never expose a service_role/secret key to GitHub Pages.
create table if not exists public.chess_academy_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check (revision >= 1),
  updated_at timestamptz not null default now(),
  constraint payload_is_object check (jsonb_typeof(payload) = 'object'),
  constraint payload_size_limit check (octet_length(payload::text) <= 2097152)
);

alter table public.chess_academy_progress enable row level security;
revoke all on table public.chess_academy_progress from public, anon, authenticated;
grant select, insert, update on table public.chess_academy_progress to authenticated;

drop policy if exists "chess_select_own" on public.chess_academy_progress;
drop policy if exists "chess_insert_own" on public.chess_academy_progress;
drop policy if exists "chess_update_own" on public.chess_academy_progress;

create policy "chess_select_own"
  on public.chess_academy_progress for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "chess_insert_own"
  on public.chess_academy_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "chess_update_own"
  on public.chess_academy_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Revisions are compared by the client for optimistic concurrency;
-- updates with an outdated revision will match zero rows.
-- Test that User A cannot SELECT/INSERT/UPDATE User B's row prior to activation.
