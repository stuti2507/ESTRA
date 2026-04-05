# ESTRA Collaborative Research Platform

A minimal editorial-style multi-user research workspace with a public-facing ESTRA landing experience.

## What changed

- Public site keeps the ESTRA editorial theme and sections.
- `Apply to Participate` now opens **sign up / login** (Supabase email + password).
- After login, users can enter the editable collaborative workspace.
- Every editable record now includes:
  - `is_public` (Public / Private)
  - `is_posted` (willing to publish)
- Public visitors can see only entries that are `is_public = true` and `is_posted = true`.

## 1) Configure environment

```bash
cp .env.example .env
```

Set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 2) Run SQL schema (Supabase SQL Editor)

```sql
create table if not exists flagship_project (
  id bigint generated always as identity primary key,
  section_name text not null unique,
  content text default '',
  last_updated timestamptz default now(),
  updated_by text default '',
  is_public boolean default false,
  is_posted boolean default false
);

create table if not exists geopolitics_tracker (
  id bigint generated always as identity primary key,
  country text default '',
  policy text default '',
  status text default 'Planned' check (status in ('Planned', 'Active', 'Scaling')),
  impact text default '',
  source text default '',
  notes text default '',
  last_updated timestamptz default now(),
  is_public boolean default false,
  is_posted boolean default false
);

create table if not exists insights_signals (
  id bigint generated always as identity primary key,
  title text not null,
  author text default '',
  type text default 'Insight' check (type in ('Insight', 'Misinformation Response')),
  summary text default '',
  tags text default '',
  date date default current_date,
  is_public boolean default false,
  is_posted boolean default false
);
```

If tables already exist, run:

```sql
alter table flagship_project add column if not exists is_public boolean default false;
alter table flagship_project add column if not exists is_posted boolean default false;
alter table geopolitics_tracker add column if not exists is_public boolean default false;
alter table geopolitics_tracker add column if not exists is_posted boolean default false;
alter table insights_signals add column if not exists is_public boolean default false;
alter table insights_signals add column if not exists is_posted boolean default false;
```

## 3) Authentication setup

In Supabase:

- Authentication → Providers → **Email** enabled.
- For easiest local testing, disable email confirmation (or confirm accounts manually).

## 4) Realtime + access

```sql
alter publication supabase_realtime add table flagship_project;
alter publication supabase_realtime add table geopolitics_tracker;
alter publication supabase_realtime add table insights_signals;
```

For quick collaboration testing, allow table reads/writes with your RLS policies (or disable RLS during development).

## 5) Start

```bash
npm install
npm run dev
```

Open in two browsers to verify realtime collaboration and public-post visibility behavior.
