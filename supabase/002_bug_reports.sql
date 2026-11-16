create table public.chess_bug_reviewers(user_id uuid primary key references auth.users(id));
alter table public.chess_bug_reviewers enable row level security;
revoke all on public.chess_bug_reviewers from anon,authenticated;
grant select on public.chess_bug_reviewers to authenticated;
create policy reviewer_self on public.chess_bug_reviewers for select to authenticated using (user_id=(select auth.uid()));
create table public.chess_bug_reports(
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 title text not null check(char_length(title) between 3 and 120),
 description text not null check(char_length(description) between 10 and 5000),
 context jsonb not null default '{}' check(octet_length(context::text)<=6000),
 screenshot text check(screenshot is null or (char_length(screenshot)<=1500000 and screenshot ~ '^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$')),
 status text not null default 'open' check(status in ('open','reviewed','resolved','needs_approval'))
);
create index chess_bug_reports_reporter on public.chess_bug_reports(reporter_id,created_at desc);
alter table public.chess_bug_reports enable row level security;
revoke all on public.chess_bug_reports from anon,authenticated;
grant select on public.chess_bug_reports to authenticated;
grant insert(id,title,description,context,screenshot) on public.chess_bug_reports to authenticated;
grant update(status) on public.chess_bug_reports to authenticated;
create policy bug_read on public.chess_bug_reports for select to authenticated using(reporter_id=(select auth.uid()) or exists(select 1 from public.chess_bug_reviewers));
create policy bug_submit on public.chess_bug_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and status='open');
create policy bug_review on public.chess_bug_reports for update to authenticated using(exists(select 1 from public.chess_bug_reviewers)) with check(exists(select 1 from public.chess_bug_reviewers));
-- Reviewer membership is provisioned privately by an authenticated database administrator.
