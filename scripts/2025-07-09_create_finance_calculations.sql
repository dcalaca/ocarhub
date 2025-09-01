-- Run this once in Supabase SQL editor or via psql.
-- It recreates ONLY the table that is missing.

-- SCHEMA:  public.finance_calculations
create table if not exists public.finance_calculations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.finance_users(id) on delete cascade not null,
  type            text not null check (
    type in (
      'juros_compostos',
      'conversor_moedas',
      'financiamento',
      'aposentadoria',
      'inflacao',
      'orcamento',
      'valor_presente_futuro',
      'investimentos'
    )
  ),
  title           text not null,
  inputs          jsonb not null,
  results         jsonb not null,
  tags            text[] default '{}',
  is_favorite     boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Minimal RLS so only the owner can see their rows
alter table public.finance_calculations enable row level security;

create policy finance_calculations_select_own
  on public.finance_calculations
  for select
  using ( auth.uid() = user_id );

create policy finance_calculations_insert_own
  on public.finance_calculations
  for insert
  with check ( auth.uid() = user_id );

create policy finance_calculations_update_own
  on public.finance_calculations
  for update
  using ( auth.uid() = user_id );

create policy finance_calculations_delete_own
  on public.finance_calculations
  for delete
  using ( auth.uid() = user_id );

-- Trigger to autoupdate updated_at
create or replace function public.handle_finance_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_finance_calculations_updated_at
  before update on public.finance_calculations
  for each row execute procedure public.handle_finance_updated_at();

-- Helpful indexes
create index if not exists idx_finance_calculations_user_id
  on public.finance_calculations (user_id);

create index if not exists idx_finance_calculations_created_at
  on public.finance_calculations (created_at desc);
