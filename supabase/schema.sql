-- BudgetRick schema for Supabase
-- Run once in SQL Editor for project ucuzptwfqvxpqnsdcbwh

-- Categories (created first; referenced by transactions and recurring)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  color text not null default '#e6e0f5',
  icon text not null default 'package',
  budget_limit numeric not null default 0,
  is_active boolean not null default true,
  rollover boolean not null default false,
  sort_order integer not null default 0,
  region text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recurring (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  category_id uuid references public.categories(id) on delete set null,
  frequency text not null check (frequency in ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  next_date date not null,
  is_active boolean not null default true,
  notes text,
  reminder_days integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  is_recurring boolean not null default false,
  recurring_id uuid references public.recurring(id) on delete set null,
  splits jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  deadline date,
  color text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists recurring_updated_at on public.recurring;
create trigger recurring_updated_at
  before update on public.recurring
  for each row execute function public.set_updated_at();

drop trigger if exists transactions_updated_at on public.transactions;
create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists goals_updated_at on public.goals;
create trigger goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.categories enable row level security;
alter table public.recurring enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

drop policy if exists "own categories" on public.categories;
create policy "own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own recurring" on public.recurring;
create policy "own recurring" on public.recurring
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own transactions" on public.transactions;
create policy "own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own goals" on public.goals;
create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
