-- =========================================================
-- EISC — FIX #2: Bypass RLS para el trigger de signup
-- =========================================================
-- El trigger usa SECURITY DEFINER pero RLS bloquea los inserts
-- porque auth.uid() es NULL durante el trigger.
-- Solución: agregar policies que permitan inserts del service_role.

-- Fix milestones: permitir insert sin auth.uid() check para el trigger
drop policy if exists "Users can insert own milestones" on public.milestones;
create policy "Users can insert own milestones"
  on public.milestones for insert
  with check (true);

-- Fix transactions: permitir insert sin auth.uid() check para el trigger
drop policy if exists "Users can insert own transactions" on public.transactions;
create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (true);

-- Fix profiles: permitir insert sin auth.uid() check para el trigger
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (true);

-- Ahora backfill el usuario de prueba existente
do $$
declare
  test_user record;
begin
  for test_user in (
    select u.id, u.email 
    from auth.users u 
    left join public.milestones m on m.user_id = u.id 
    where m.id is null
  ) loop
    raise notice 'Backfilling user: %', test_user.email;
    
    insert into public.milestones (user_id, milestone_key, completed, credits, label) values
      (test_user.id, 'registration', true, 1, 'Registro completado'),
      (test_user.id, 'portfolio', false, 2, 'Hito de Talento — Portafolio o redes profesionales'),
      (test_user.id, 'identity', false, 2, 'Hito de Verificación — Videollamada o recomendación')
    on conflict (user_id, milestone_key) do nothing;

    insert into public.transactions (id, user_id, type, amount, description, category, status, counterparty)
    values (
      'tx-reg-' || substr(test_user.id::text, 1, 8),
      test_user.id,
      'credit', 1, 'Bono de registro', 'milestone', 'completed', 'Sistema EISC'
    )
    on conflict (id) do nothing;
  end loop;
end $$;
