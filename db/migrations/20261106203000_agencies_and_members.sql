-- US-SGN-001: agencies, members, profiles, platform admins, activity log,
-- and the server-only tables behind log-in lockout and verification links.
-- Additive only: nothing existing is changed or dropped.
--
-- Logins and passwords live in Neon Auth (schema neon_auth, D31). Signo keeps
-- only the Neon Auth user id (uuid) and never stores a password.
--
-- How data isolation works (CLAUDE.md rule 1):
-- * The server reads agency data as the role signo_app, after setting
--   app.user_id to the signed-in member for that one transaction.
-- * RLS policies let signo_app see only rows of agencies that member belongs to.
-- * Sign-up and the auth bookkeeping tables are written by the server's owner
--   role, which the browser never reaches (rule 4). The owner bypasses RLS.

-- Role the app switches to for member reads. It cannot log in by itself.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'signo_app') then
    create role signo_app nologin;
  end if;
end
$$;
grant signo_app to current_user;
grant usage on schema public to signo_app;

create schema if not exists app;
grant usage on schema app to signo_app;

-- The signed-in member for this transaction (set by the server), or null.
create or replace function app.current_user_id() returns uuid
  language sql stable
  as $$ select nullif(current_setting('app.user_id', true), '')::uuid $$;

-- ---------------------------------------------------------------------------
-- Agencies (BR1, BR8, BR9, D27)
create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  country text not null check (country in ('egypt', 'saudi_arabia', 'uae', 'other')),
  market text not null check (market in ('egypt', 'gulf')),
  timezone text not null,
  default_language text not null check (default_language in ('ar', 'en')),
  created_at timestamptz not null default now()
);

-- Members: one agency per person in the MVP (BR3).
create table agency_members (
  agency_id uuid not null references agencies (id),
  user_id uuid not null unique,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (agency_id, user_id)
);

-- The agencies the signed-in member belongs to. Security definer so the
-- policies below can look up membership without recursing into themselves.
create or replace function app.member_agency_ids() returns setof uuid
  language sql stable security definer set search_path = public
  as $$ select agency_id from agency_members where user_id = app.current_user_id() $$;
revoke all on function app.member_agency_ids() from public;
grant execute on function app.member_agency_ids() to signo_app;
grant execute on function app.current_user_id() to signo_app;

-- Profiles: the name and the language that follows the member to every
-- device (BR8, D29), and when their email was verified (BR2).
create table member_profiles (
  user_id uuid primary key,
  agency_id uuid not null references agencies (id),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 80),
  email text not null check (email = lower(email)),
  ui_language text not null check (ui_language in ('ar', 'en')),
  email_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (agency_id, user_id) references agency_members (agency_id, user_id)
);
create unique index member_profiles_email_key on member_profiles (email);

alter table agencies enable row level security;
alter table agency_members enable row level security;
alter table member_profiles enable row level security;

create policy agencies_member_read on agencies
  for select to signo_app
  using (id in (select app.member_agency_ids()));

create policy agency_members_member_read on agency_members
  for select to signo_app
  using (agency_id in (select app.member_agency_ids()));

create policy member_profiles_member_read on member_profiles
  for select to signo_app
  using (agency_id in (select app.member_agency_ids()));

-- A member may change only their own profile (their language).
create policy member_profiles_self_update on member_profiles
  for update to signo_app
  using (user_id = app.current_user_id())
  with check (user_id = app.current_user_id());

grant select on agencies, agency_members, member_profiles to signo_app;
grant update (ui_language, updated_at) on member_profiles to signo_app;

-- ---------------------------------------------------------------------------
-- Platform admins (CLAUDE.md rule 6). No screen in this ticket. Server only.
create table platform_admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);
alter table platform_admins enable row level security;

-- ---------------------------------------------------------------------------
-- Activity log (PRD section 5, D28). Append-only (rule 11): members can read
-- their agency's rows; nobody can change or delete a row once written.
create table activity (
  id bigint generated always as identity primary key,
  agency_id uuid not null references agencies (id),
  actor_id uuid,
  actor_label text,
  event text not null,
  subject_type text,
  subject_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_agency_created on activity (agency_id, created_at desc);
alter table activity enable row level security;

create policy activity_member_read on activity
  for select to signo_app
  using (agency_id in (select app.member_agency_ids()));
grant select on activity to signo_app;

create or replace function app.activity_is_append_only() returns trigger
  language plpgsql
  as $$ begin raise exception 'activity rows are append-only'; end $$;

create trigger activity_no_update_or_delete
  before update or delete on activity
  for each row execute function app.activity_is_append_only();
create trigger activity_no_truncate
  before truncate on activity
  for each statement execute function app.activity_is_append_only();

-- ---------------------------------------------------------------------------
-- Log-in lockout (BR7, D20 on the canvas): 5 wrong passwords in 15 minutes
-- blocks password and login-link sign-in for 15 minutes. A password reset
-- clears it. Keyed by a SHA-256 of the lower-cased email. Server only.
create table login_attempts (
  id bigint generated always as identity primary key,
  email_hash text not null,
  outcome text not null check (outcome in ('failed', 'cleared')),
  created_at timestamptz not null default now()
);
create index login_attempts_email_created on login_attempts (email_hash, created_at desc);
alter table login_attempts enable row level security;

-- Verification links (BR2, D19, D21 on the canvas): valid 24 hours, a new
-- link replaces the old one, at most one email a minute and 5 an hour.
-- Only a SHA-256 of each link's secret is stored. Server only.
create table email_verifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references member_profiles (user_id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  replaced_at timestamptz,
  created_at timestamptz not null default now()
);
create index email_verifications_user_created on email_verifications (user_id, created_at desc);
alter table email_verifications enable row level security;
