-- ============================================================
-- FORMLY — Reparar permisos (se puede ejecutar varias veces sin problema)
-- Supabase > SQL Editor > New query > pegar todo > Run
-- Soluciona: "new row violates row-level security policy for table forms"
-- ============================================================

-- 1) Limpia los correos autorizados (minúsculas y sin espacios escondidos)
update public.allowed_users set email = lower(trim(email));

-- 2) Asegura que estas cuentas sean administradoras
insert into public.allowed_users (email, role) values
  ('arpineda@mardom.com', 'admin'),
  ('reclutamiento@mardom.com', 'admin')
on conflict (email) do update set role = 'admin';

-- 3) Vuelve a crear la función que decide quién tiene permiso
create or replace function public.is_allowed_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.allowed_users au
    where lower(trim(au.email)) = lower(trim(coalesce(auth.jwt() ->> 'email','')))
  );
$$;
grant execute on function public.is_allowed_user() to anon, authenticated;

-- 4) Vuelve a crear las reglas de seguridad
alter table public.forms enable row level security;
alter table public.form_responses enable row level security;
alter table public.allowed_users enable row level security;

drop policy if exists "allowed_users_manage_forms" on public.forms;
create policy "allowed_users_manage_forms" on public.forms
  for all
  using (public.is_allowed_user())
  with check (public.is_allowed_user());

drop policy if exists "public_can_view_active_forms" on public.forms;
create policy "public_can_view_active_forms" on public.forms
  for select
  using (status = 'activo');

drop policy if exists "allowed_users_read_responses" on public.form_responses;
create policy "allowed_users_read_responses" on public.form_responses
  for select
  using (public.is_allowed_user());

drop policy if exists "public_can_submit_responses" on public.form_responses;
create policy "public_can_submit_responses" on public.form_responses
  for insert
  with check (
    exists (
      select 1 from public.forms f
      where f.id = form_id and f.status = 'activo'
    )
  );

drop policy if exists "allowed_users_read_allowed_users" on public.allowed_users;
create policy "allowed_users_read_allowed_users" on public.allowed_users
  for select
  using (public.is_allowed_user());
