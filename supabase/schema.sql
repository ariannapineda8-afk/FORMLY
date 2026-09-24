-- ============================================================
-- FORMLY — esquema de base de datos y seguridad (Supabase)
-- Copia y pega este archivo completo en: Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pgcrypto;

-- --------------------------------------------------------------
-- Tabla: usuarios autorizados a administrar Formly
-- --------------------------------------------------------------
create table if not exists public.allowed_users (
  email text primary key,
  role text not null default 'admin' check (role in ('admin','editor','lectura')),
  created_at timestamptz default now()
);

insert into public.allowed_users (email, role) values
  ('dpena@mardom.com','admin'),
  ('luabreu@mardom.com','admin'),
  ('ntejeda@mardom.com','admin'),
  ('dgacevedo@mardom.com','admin'),
  ('arpineda@mardom.com','admin')
on conflict (email) do nothing;

-- --------------------------------------------------------------
-- Tabla: formularios
-- --------------------------------------------------------------
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  owner_email text,
  title text not null,
  description text default '',
  slug text unique not null,
  status text not null default 'borrador' check (status in ('activo','inactivo','borrador')),
  color text default '#12294D',
  logo_url text,
  button_text text default 'Enviar',
  thanks_message text default 'Gracias por completar el formulario.',
  fields jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- --------------------------------------------------------------
-- Tabla: respuestas
-- --------------------------------------------------------------
create table if not exists public.form_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.forms(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz default now()
);

create index if not exists idx_responses_form_id on public.form_responses(form_id);

-- --------------------------------------------------------------
-- Función: ¿el usuario autenticado actual está en la lista autorizada?
-- --------------------------------------------------------------
create or replace function public.is_allowed_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.allowed_users au
    where lower(au.email) = lower(coalesce(auth.jwt() ->> 'email',''))
  );
$$;

-- --------------------------------------------------------------
-- Activar seguridad por fila (RLS) en todas las tablas
-- --------------------------------------------------------------
alter table public.forms enable row level security;
alter table public.form_responses enable row level security;
alter table public.allowed_users enable row level security;

-- FORMS: los usuarios autorizados pueden crear, editar, ver y borrar
create policy "allowed_users_manage_forms" on public.forms
  for all
  using (public.is_allowed_user())
  with check (public.is_allowed_user());

-- FORMS: cualquier visitante (sin cuenta) puede LEER un formulario si está Activo
-- (esto es lo que permite que el enlace público funcione sin login)
create policy "public_can_view_active_forms" on public.forms
  for select
  using (status = 'activo');

-- RESPONSES: solo los usuarios autorizados pueden leer respuestas
create policy "allowed_users_read_responses" on public.form_responses
  for select
  using (public.is_allowed_user());

-- RESPONSES: cualquier visitante puede INSERTAR una respuesta,
-- pero únicamente en un formulario que esté Activo. No puede leer, editar ni borrar nada.
create policy "public_can_submit_responses" on public.form_responses
  for insert
  with check (
    exists (
      select 1 from public.forms f
      where f.id = form_id and f.status = 'activo'
    )
  );

-- ALLOWED_USERS: solo usuarios autorizados pueden ver la lista (para gestionar roles después)
create policy "allowed_users_read_allowed_users" on public.allowed_users
  for select
  using (public.is_allowed_user());

-- ============================================================
-- Almacenamiento de archivos (adjuntos y firmas)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('form-uploads', 'form-uploads', true)
on conflict (id) do nothing;

create policy "anyone_can_upload_form_files" on storage.objects
  for insert
  with check (bucket_id = 'form-uploads');

create policy "anyone_can_view_form_files" on storage.objects
  for select
  using (bucket_id = 'form-uploads');

-- ============================================================
-- Fin del script. Siguiente paso: crear los 5 usuarios en
-- Authentication > Users (ver README.md, paso 3).
-- ============================================================
