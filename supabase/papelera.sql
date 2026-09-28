-- ============================================================
-- FORMLY — Papelera (ejecutar UNA sola vez en Supabase > SQL Editor)
-- ============================================================
alter table public.forms add column if not exists deleted_at timestamptz;

-- OPCIONAL: limpieza automática diaria a las 3:00 a.m.
-- (Formly ya borra lo vencido cada vez que alguien abre la app;
--  esto solo lo garantiza aunque nadie entre.)
-- Requiere activar la extensión pg_cron en Database > Extensions.
--
-- select cron.schedule(
--   'formly-vaciar-papelera',
--   '0 3 * * *',
--   $$ delete from public.forms where deleted_at is not null and deleted_at < now() - interval '30 days' $$
-- );
