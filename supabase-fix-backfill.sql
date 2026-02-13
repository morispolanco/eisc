-- =========================================================
-- EISC — FIX #3: Insertar datos directamente para usuarios existentes
-- =========================================================

-- Insertar milestones para TODOS los usuarios de auth.users que no tengan milestones
-- Usamos una query directa con el ID conocido

-- Usuario 1: test.eisc.verificacion@gmail.com
insert into public.milestones (user_id, milestone_key, completed, credits, label) values
  ('1e441004-3972-4158-b77a-93bbd2ce3cfe', 'registration', true, 1, 'Registro completado'),
  ('1e441004-3972-4158-b77a-93bbd2ce3cfe', 'portfolio', false, 2, 'Hito de Talento — Portafolio o redes profesionales'),
  ('1e441004-3972-4158-b77a-93bbd2ce3cfe', 'identity', false, 2, 'Hito de Verificación — Videollamada o recomendación')
on conflict (user_id, milestone_key) do nothing;

insert into public.transactions (id, user_id, type, amount, description, category, status, counterparty)
values ('tx-reg-1e441004', '1e441004-3972-4158-b77a-93bbd2ce3cfe', 'credit', 1, 'Bono de registro', 'milestone', 'completed', 'Sistema EISC')
on conflict (id) do nothing;

-- Buscar y backfill TODOS los usuarios de auth.users que no tengan milestones
-- (Esto sí funciona desde el SQL Editor que tiene permisos de service_role)
insert into public.milestones (user_id, milestone_key, completed, credits, label)
select u.id, m.key, m.completed, m.credits, m.label
from auth.users u
cross join (values
  ('registration', true, 1, 'Registro completado'),
  ('portfolio', false, 2, 'Hito de Talento — Portafolio o redes profesionales'),
  ('identity', false, 2, 'Hito de Verificación — Videollamada o recomendación')
) as m(key, completed, credits, label)
left join public.milestones existing on existing.user_id = u.id and existing.milestone_key = m.key
where existing.id is null;

insert into public.transactions (id, user_id, type, amount, description, category, status, counterparty)
select 'tx-reg-' || substr(u.id::text, 1, 8), u.id, 'credit', 1, 'Bono de registro', 'milestone', 'completed', 'Sistema EISC'
from auth.users u
left join public.transactions t on t.user_id = u.id and t.category = 'milestone' and t.description = 'Bono de registro'
where t.id is null;
