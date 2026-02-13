-- =========================================================
-- EISC — Ecosistema de Intercambio de Servicios por Créditos
-- Supabase Database Schema
-- =========================================================
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. PROFILES — extends auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text not null,
  specialty text default 'software',
  photo_url text,
  email_verified boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view any profile"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- 2. TRANSACTIONS — wallet ledger
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text check (type in ('credit', 'debit')) not null,
  amount numeric not null,
  description text not null,
  category text not null, -- milestone, service_purchase, service_completed
  status text check (status in ('completed', 'escrow', 'pending', 'refunded')) not null,
  counterparty text not null,
  service_id text,
  created_at timestamptz default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);


-- 3. MILESTONES — onboarding progress
create table if not exists public.milestones (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  milestone_key text not null, -- registration, portfolio, identity
  completed boolean default false,
  credits numeric not null,
  label text not null,
  completed_at timestamptz,
  unique(user_id, milestone_key)
);

alter table public.milestones enable row level security;

create policy "Users can view own milestones"
  on public.milestones for select
  using (auth.uid() = user_id);

create policy "Users can insert own milestones"
  on public.milestones for insert
  with check (auth.uid() = user_id);

create policy "Users can update own milestones"
  on public.milestones for update
  using (auth.uid() = user_id);


-- 4. SERVICES — marketplace listings
create table if not exists public.services (
  id text primary key default 'svc-' || substr(gen_random_uuid()::text, 1, 8),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  price numeric not null,
  category text not null,
  delivery_days integer not null default 7,
  tags text[] default '{}',
  status text check (status in ('active', 'paused', 'deleted')) default 'active',
  provider_name text not null,
  provider_rating numeric default 5.0,
  provider_completed_jobs integer default 0,
  created_at timestamptz default now()
);

alter table public.services enable row level security;

create policy "Anyone can view active services"
  on public.services for select
  using (status = 'active');

create policy "Users can insert own services"
  on public.services for insert
  with check (auth.uid() = user_id);

create policy "Users can update own services"
  on public.services for update
  using (auth.uid() = user_id);


-- 5. CONTRACTS — active service agreements
create table if not exists public.contracts (
  id text primary key default 'ctr-' || substr(gen_random_uuid()::text, 1, 8),
  buyer_id uuid references auth.users(id) on delete cascade not null,
  seller_id uuid,
  service_id text references public.services(id),
  service_title text not null,
  amount numeric not null,
  status text check (status in ('in_progress', 'completed', 'disputed', 'cancelled')) default 'in_progress',
  provider_name text not null,
  expected_delivery timestamptz not null,
  transaction_id text,
  created_at timestamptz default now()
);

alter table public.contracts enable row level security;

create policy "Users can view own contracts"
  on public.contracts for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can insert contracts as buyer"
  on public.contracts for insert
  with check (auth.uid() = buyer_id);

create policy "Users can update own contracts"
  on public.contracts for update
  using (auth.uid() = buyer_id or auth.uid() = seller_id);


-- 6. DISPUTES
create table if not exists public.disputes (
  id text primary key default 'dsp-' || substr(gen_random_uuid()::text, 1, 8),
  user_id uuid references auth.users(id) on delete cascade not null,
  contract_id text references public.contracts(id),
  reason text not null,
  description text,
  status text check (status in ('open', 'reviewing', 'resolved', 'rejected')) default 'open',
  resolution text,
  created_at timestamptz default now()
);

alter table public.disputes enable row level security;

create policy "Users can view own disputes"
  on public.disputes for select
  using (auth.uid() = user_id);

create policy "Users can insert own disputes"
  on public.disputes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own disputes"
  on public.disputes for update
  using (auth.uid() = user_id);


-- 7. FUNCTION — auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );

  -- Create default milestones
  insert into public.milestones (user_id, milestone_key, completed, credits, label) values
    (new.id, 'registration', true, 1, 'Registro completado'),
    (new.id, 'portfolio', false, 2, 'Hito de Talento — Portafolio o redes profesionales'),
    (new.id, 'identity', false, 2, 'Hito de Verificación — Recomendación de miembro'),
    (new.id, 'first_sale', false, 3, 'Primera venta — Bono por completar tu primer servicio');

  -- Create registration bonus transaction
  insert into public.transactions (id, user_id, type, amount, description, category, status, counterparty)
  values (
    'tx-reg-' || substr(new.id::text, 1, 8),
    new.id,
    'credit',
    1,
    'Bono de registro',
    'milestone',
    'completed',
    'Sistema EISC'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
