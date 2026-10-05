-- Trakaboo: transactions
-- Every row belongs to one user; row-level security makes sure nobody can read
-- or change another user's data, even with the public (anon) key.

create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date         date not null,                                  -- purchase date (decides the month)
  amount       numeric(12, 2) not null check (amount <> 0),    -- positive = spent, negative = refund
  currency     char(3) not null default 'ILS',
  merchant     text not null check (length(trim(merchant)) > 0),
  category_id  text not null default 'other',
  source       text not null check (source in ('apple_pay', 'cal', 'max', 'manual')),
  card_last4   text check (card_last4 ~ '^\d{4}$'),
  note         text,
  external_ref text,                                           -- stable id from an import, for dedupe
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (user_id, source, external_ref)
);

create index transactions_user_date_idx on public.transactions (user_id, date desc);

-- Keep updated_at fresh.
create function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_touch_updated_at
before update on public.transactions
for each row execute function public.touch_updated_at();

-- Row-level security: users only ever see and change their own rows.
alter table public.transactions enable row level security;

create policy "own rows: select" on public.transactions
  for select to authenticated using (user_id = (select auth.uid()));

create policy "own rows: insert" on public.transactions
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "own rows: update" on public.transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own rows: delete" on public.transactions
  for delete to authenticated using (user_id = (select auth.uid()));
