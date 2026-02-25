-- ProfitGrid — Supabase schema (v2)
-- Run in Supabase SQL Editor.
-- If you already ran v1, this file is SAFE: it uses IF NOT EXISTS + ALTER.

-- ============
-- 0) ENUM-LIKE CHECKS (kept as text for flexibility)
-- plans: free | premium | pro
-- asset_class: Forex | Crypto | Indices | Stocks | Metals | Futures

-- ============
-- 1) Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============
-- 2) Accounts (multi-account, prop-firm ready)
create table if not exists public.accounts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'USD',
  starting_balance numeric not null default 0,
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- ============
-- 3) Risk rules (rule engine)
create table if not exists public.risk_rules (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint not null references public.accounts(id) on delete cascade,
  -- daily max loss (negative number, e.g. -200)
  max_daily_loss numeric,
  -- maximum drawdown from peak equity (positive number, e.g. 1000)
  max_drawdown numeric,
  -- optional profit target
  profit_target numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, account_id)
);

-- ============
-- 4) Strategies + tags
create table if not exists public.strategies (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- ============
-- 5) Daily P&L (now per account)
create table if not exists public.daily_pnl (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.accounts(id) on delete cascade,
  day date not null,
  total_pnl numeric not null default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, account_id, day)
);

-- For v1 compatibility: if an older unique(user_id, day) exists, keep it.

-- ============
-- 6) Trades (journal)
create table if not exists public.trades (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.accounts(id) on delete cascade,
  opened_at timestamptz not null,
  closed_at timestamptz,
  asset_class text not null,
  symbol text not null,
  side text not null,
  entry numeric,
  exit numeric,
  size numeric,
  fees numeric,
  pnl numeric not null,
  rr numeric,
  strategy_id bigint references public.strategies(id) on delete set null,
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

-- Attachments stored in Supabase Storage, referenced here
create table if not exists public.trade_attachments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_id bigint not null references public.trades(id) on delete cascade,
  path text not null,
  created_at timestamptz default now()
);

-- ==========
-- 6b) Weekly review (Premium+)
create table if not exists public.weekly_reviews (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.accounts(id) on delete cascade,
  week_start date not null,
  goals text,
  what_worked text,
  what_failed text,
  rules_followed text,
  improvements text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, account_id, week_start)
);

-- ==========
-- 6c) Payments (Stripe / Crypto providers)
create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null, -- stripe|confirmo|coinbase|nowpayments
  plan text not null,     -- premium|pro
  status text not null default 'pending', -- pending|paid|failed|canceled
  external_id text,
  checkout_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============
-- 7) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- Attach triggers (safe)
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_daily_pnl_updated_at on public.daily_pnl;
create trigger trg_daily_pnl_updated_at before update on public.daily_pnl
for each row execute function public.set_updated_at();

drop trigger if exists trg_risk_rules_updated_at on public.risk_rules;
create trigger trg_risk_rules_updated_at before update on public.risk_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_weekly_reviews_updated_at on public.weekly_reviews;
create trigger trg_weekly_reviews_updated_at before update on public.weekly_reviews
for each row execute function public.set_updated_at();

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

-- ============
-- 8) RLS
alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.risk_rules enable row level security;
alter table public.strategies enable row level security;
alter table public.daily_pnl enable row level security;
alter table public.trades enable row level security;
alter table public.trade_attachments enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.payments enable row level security;

-- profiles policies
create policy if not exists profiles_select_own
on public.profiles for select
using (auth.uid() = id);

create policy if not exists profiles_insert_own
on public.profiles for insert
with check (auth.uid() = id);

create policy if not exists profiles_update_own
on public.profiles for update
using (auth.uid() = id);

-- accounts policies
create policy if not exists accounts_select_own
on public.accounts for select
using (auth.uid() = user_id);

create policy if not exists accounts_insert_own
on public.accounts for insert
with check (auth.uid() = user_id);

create policy if not exists accounts_update_own
on public.accounts for update
using (auth.uid() = user_id);

create policy if not exists accounts_delete_own
on public.accounts for delete
using (auth.uid() = user_id);

-- risk rules policies
create policy if not exists risk_rules_select_own
on public.risk_rules for select
using (auth.uid() = user_id);

create policy if not exists risk_rules_upsert_own
on public.risk_rules for insert
with check (auth.uid() = user_id);

create policy if not exists risk_rules_update_own
on public.risk_rules for update
using (auth.uid() = user_id);

-- strategies policies
create policy if not exists strategies_select_own
on public.strategies for select
using (auth.uid() = user_id);

create policy if not exists strategies_insert_own
on public.strategies for insert
with check (auth.uid() = user_id);

create policy if not exists strategies_update_own
on public.strategies for update
using (auth.uid() = user_id);

create policy if not exists strategies_delete_own
on public.strategies for delete
using (auth.uid() = user_id);

-- daily_pnl policies
create policy if not exists daily_pnl_select_own
on public.daily_pnl for select
using (auth.uid() = user_id);

create policy if not exists daily_pnl_insert_own
on public.daily_pnl for insert
with check (auth.uid() = user_id);

create policy if not exists daily_pnl_update_own
on public.daily_pnl for update
using (auth.uid() = user_id);

create policy if not exists daily_pnl_delete_own
on public.daily_pnl for delete
using (auth.uid() = user_id);

-- trades policies
create policy if not exists trades_select_own
on public.trades for select
using (auth.uid() = user_id);

create policy if not exists trades_insert_own
on public.trades for insert
with check (auth.uid() = user_id);

create policy if not exists trades_update_own
on public.trades for update
using (auth.uid() = user_id);

create policy if not exists trades_delete_own
on public.trades for delete
using (auth.uid() = user_id);

-- attachments policies
create policy if not exists trade_attachments_select_own
on public.trade_attachments for select
using (auth.uid() = user_id);

create policy if not exists trade_attachments_insert_own
on public.trade_attachments for insert
with check (auth.uid() = user_id);

create policy if not exists trade_attachments_delete_own
on public.trade_attachments for delete
using (auth.uid() = user_id);

-- weekly_reviews policies
create policy if not exists weekly_reviews_select_own
on public.weekly_reviews for select
using (auth.uid() = user_id);

create policy if not exists weekly_reviews_insert_own
on public.weekly_reviews for insert
with check (auth.uid() = user_id);

create policy if not exists weekly_reviews_update_own
on public.weekly_reviews for update
using (auth.uid() = user_id);

create policy if not exists weekly_reviews_delete_own
on public.weekly_reviews for delete
using (auth.uid() = user_id);

-- payments policies (read own payment sessions)
create policy if not exists payments_select_own
on public.payments for select
using (auth.uid() = user_id);

create policy if not exists payments_insert_own
on public.payments for insert
with check (auth.uid() = user_id);

create policy if not exists payments_update_own
on public.payments for update
using (auth.uid() = user_id);

-- ============
-- 9) Helpful indexes
create index if not exists trades_user_opened_at_idx on public.trades(user_id, opened_at desc);
create index if not exists daily_pnl_user_day_idx on public.daily_pnl(user_id, day);
create index if not exists attachments_trade_idx on public.trade_attachments(trade_id);

-- ============
-- 10) Auto-create profile + default account on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  acc_id bigint;
begin
  insert into public.profiles (id, plan) values (new.id, 'free')
  on conflict (id) do nothing;

  insert into public.accounts (user_id, name, currency, starting_balance)
  values (new.id, 'Main', 'USD', 0)
  on conflict (user_id, name) do nothing;

  select id into acc_id from public.accounts where user_id = new.id and name = 'Main' limit 1;

  insert into public.risk_rules (user_id, account_id, max_daily_loss, max_drawdown, profit_target)
  values (new.id, acc_id, null, null, null)
  on conflict (user_id, account_id) do nothing;

  return new;
end;
$$;

-- trigger on auth.users
-- (safe: drop + recreate)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ============
-- 11) STORAGE BUCKET (create in Supabase UI)
-- Create a bucket named: trade_screens
-- Set bucket privacy: PRIVATE
-- Then add policies below (Storage -> Policies), or use SQL via the UI.
-- Supabase SQL Editor cannot always create storage buckets in all projects.
--
-- Recommended storage policies (add in Storage Policies UI):
-- 1) Allow authenticated users to read their own files:
--    (bucket_id = 'trade_screens' AND auth.uid()::text = (storage.foldername(name))[1])
-- 2) Allow authenticated users to upload to their own folder:
--    (bucket_id = 'trade_screens' AND auth.uid()::text = (storage.foldername(name))[1])
