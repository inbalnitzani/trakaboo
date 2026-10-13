-- Trakaboo: Apple Pay ingest
-- The iOS Shortcut posts payments without a login session, so it authenticates with a
-- per-user ingest token. Only the token's SHA-256 hash is stored; the plain token is
-- shown to the user once. `ingest_transaction` is the only way in without a session.

create table public.ingest_tokens (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

alter table public.ingest_tokens enable row level security;

create policy "own token: select" on public.ingest_tokens
  for select to authenticated using (user_id = (select auth.uid()));

create policy "own token: insert" on public.ingest_tokens
  for insert to authenticated with check (user_id = (select auth.uid()));

create policy "own token: update" on public.ingest_tokens
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "own token: delete" on public.ingest_tokens
  for delete to authenticated using (user_id = (select auth.uid()));

-- Saves one Apple Pay payment for the token's owner. Returns 'created' or 'duplicate'
-- (same external_ref already saved, e.g. a retried Shortcut run). Raises 28000 for an
-- unknown token. Runs as the owner to bypass RLS, so it must check everything itself.
create function public.ingest_transaction(
  p_token        text,
  p_date         date,
  p_amount       numeric,
  p_currency     text,
  p_merchant     text,
  p_card_last4   text,
  p_external_ref text
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_id      uuid;
begin
  select user_id into v_user_id
  from public.ingest_tokens
  where token_hash = encode(sha256(convert_to(coalesce(p_token, ''), 'UTF8')), 'hex');

  if v_user_id is null then
    raise exception 'invalid ingest token' using errcode = '28000';
  end if;

  insert into public.transactions
    (user_id, date, amount, currency, merchant, source, card_last4, external_ref)
  values
    (v_user_id, p_date, p_amount, p_currency, p_merchant, 'apple_pay', p_card_last4, p_external_ref)
  on conflict (user_id, source, external_ref) do nothing
  returning id into v_id;

  return case when v_id is null then 'duplicate' else 'created' end;
end;
$$;

revoke execute on function public.ingest_transaction from public;
grant execute on function public.ingest_transaction to anon, authenticated;
