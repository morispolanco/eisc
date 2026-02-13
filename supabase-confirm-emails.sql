-- Fix: solo actualizar email_confirmed_at (confirmed_at es generado)
update auth.users 
set email_confirmed_at = now()
where email_confirmed_at is null;

-- Verificar
select count(*) as total_users from auth.users;

select 'profiles' as tabla, count(*) as total from public.profiles
union all
select 'milestones', count(*) from public.milestones
union all
select 'transactions', count(*) from public.transactions;
