-- Pipeline check (D30, D31): one small table that the /api/health endpoint
-- reads, to prove each environment reaches its own Neon branch.
-- No agency data, so no agency_id; RLS is on and no policy is granted,
-- so only the server's database owner role can read it.

create table if not exists health_check (
  id smallint primary key check (id = 1),
  created_at timestamptz not null default now()
);

alter table health_check enable row level security;

insert into health_check (id) values (1) on conflict (id) do nothing;
