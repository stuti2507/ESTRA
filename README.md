# ESTRA — Evidence Synthesis Translation Real-World Action

Production-ready SaaS foundation using **React (Vite) + Tailwind + Supabase**.

## Setup

```bash
npm install
cp .env.example .env
```

Set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Run

```bash
npm run dev
npm run build
```

## Supabase SQL schema

```sql
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  institution text,
  linkedin_url text,
  expertise_tags text[] default '{}',
  role text not null default 'public' check (role in ('public','member','admin')),
  created_at timestamptz not null default now()
);

create table if not exists applications (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null,
  role text,
  institution text,
  area_of_expertise text,
  linkedin_url text,
  statement_of_interest text,
  cv_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists insights (
  id bigint generated always as identity primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  discipline text not null,
  region text not null,
  format text not null,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id bigint generated always as identity primary key,
  insight_id bigint not null references insights(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_id bigint not null references insights(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, insight_id)
);

create table if not exists tag_follows (
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tag_key)
);
```

## RLS baseline

Enable RLS for all tables and create policies:
- Public read on `insights`.
- Member insert/read on `comments`, `bookmarks`, `tag_follows`.
- Admin full access on `applications` and moderation paths.
- Profiles self-read/write; admin write role.

This repo provides a production foundation with role-based UX and Supabase integration hooks.
