-- =========================================================
-- EISC — FIX: Trigger para crear milestones y transacción
--              de registro al hacer signup
-- =========================================================
-- Ejecuta este SQL en tu Supabase SQL Editor

-- Primero, eliminar el trigger y función anteriores
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Recrear la función con permisos correctos
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Insertar perfil
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );

  -- Insertar milestones de onboarding
  insert into public.milestones (user_id, milestone_key, completed, credits, label) values
    (new.id, 'registration', true, 1, 'Registro completado'),
    (new.id, 'portfolio', false, 2, 'Hito de Talento — Portafolio o redes profesionales'),
    (new.id, 'identity', false, 2, 'Hito de Verificación — Videollamada o recomendación');

  -- Insertar transacción de bono de registro
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
$$ language plpgsql security definer set search_path = public;

-- Recrear trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- También completar los datos para el usuario de prueba existente
-- (si existe el usuario creado antes del fix)
do $$
declare
  test_user_id uuid;
begin
  select id into test_user_id from auth.users where email = 'test.eisc.verificacion@gmail.com' limit 1;
  
  if test_user_id is not null then
    -- Insertar milestones si no existen
    insert into public.milestones (user_id, milestone_key, completed, credits, label) values
      (test_user_id, 'registration', true, 1, 'Registro completado'),
      (test_user_id, 'portfolio', false, 2, 'Hito de Talento — Portafolio o redes profesionales'),
      (test_user_id, 'identity', false, 2, 'Hito de Verificación — Videollamada o recomendación')
    on conflict (user_id, milestone_key) do nothing;

    -- Insertar transacción de registro si no existe
    insert into public.transactions (id, user_id, type, amount, description, category, status, counterparty)
    values (
      'tx-reg-' || substr(test_user_id::text, 1, 8),
      test_user_id,
      'credit', 1, 'Bono de registro', 'milestone', 'completed', 'Sistema EISC'
    )
    on conflict (id) do nothing;
  end if;
end $$;
