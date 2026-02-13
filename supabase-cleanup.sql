-- Eliminar transacción duplicada de registro
delete from public.transactions 
where user_id = '1e441004-3972-4158-b77a-93bbd2ce3cfe' 
  and description = 'Bono de registro'
  and id != 'tx-reg-1e441004';
