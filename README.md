# Formly — guía de puesta en marcha (sin necesidad de programar)

Esta es la aplicación real de Formly: inicio de sesión de verdad, base de datos
propia, y enlaces públicos que cualquier persona puede completar sin cuenta.
Sigue estos pasos en orden. Ninguno requiere saber programar — son formularios
y botones, como crear una cuenta de correo.

## Resumen de lo que vas a hacer
1. Crear una cuenta gratis en **Supabase** (la base de datos).
2. Pegar un script para crear las tablas y la seguridad.
3. Crear las 5 cuentas de acceso (los 5 correos de MARDOM).
4. Crear una cuenta gratis en **Vercel** (donde vivirá la página web) y conectar este código.
5. Copiar 2 claves de Supabase a Vercel.
6. Listo — tu plataforma queda en línea con una URL propia.

---

## Paso 1 — Crear el proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta gratis (con tu correo).
2. Clic en **New project**. Ponle de nombre "Formly", elige una contraseña
   para la base de datos (guárdala en un lugar seguro) y espera 1-2 minutos
   a que se cree.

## Paso 2 — Crear las tablas y la seguridad

1. Dentro de tu proyecto de Supabase, ve al menú **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de esta carpeta, copia todo su
   contenido y pégalo ahí.
3. Clic en **Run**. Esto crea los formularios, las respuestas, y las reglas
   de seguridad que protegen los datos (solo tus 5 correos pueden administrar;
   el público solo puede llenar formularios activos).

## Paso 3 — Crear las 5 cuentas de acceso

Por seguridad real, cada persona debe tener su **propia contraseña** (no una
compartida). Para cada uno de estos 5 correos:

- dpena@mardom.com
- luabreu@mardom.com
- ntejeda@mardom.com
- dgacevedo@mardom.com
- arpineda@mardom.com

Haz lo siguiente en Supabase:
1. Ve a **Authentication** → **Users** → **Add user** → **Create new user**.
2. Escribe el correo y asígnale una contraseña (puedes usar una temporal y
   pedirle a la persona que la cambie después desde "Reset password").
3. Marca "Auto Confirm User" para que quede activo de inmediato.
4. Repite para los 5 correos.

Estas cuentas ya están además en la lista de `allowed_users` (la creó el
script del Paso 2), así que apenas inicien sesión tendrán acceso completo.

## Paso 4 — Publicar la página en Vercel

1. Sube esta carpeta a un repositorio de GitHub (puedes arrastrar los
   archivos directamente en github.com si nunca has usado Git — "Add file" →
   "Upload files").
2. Ve a https://vercel.com, crea una cuenta gratis, clic en **Add New** →
   **Project**, y selecciona ese repositorio.
3. Antes de hacer clic en "Deploy", abre **Environment Variables** y agrega:
   - `NEXT_PUBLIC_SUPABASE_URL` → la encuentras en Supabase, en
     **Project Settings** → **API** → "Project URL".
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → en la misma pantalla, "anon public key".
4. Clic en **Deploy**. En 1-2 minutos tendrás tu URL, por ejemplo
   `formly-mardom.vercel.app`.

## Paso 5 — (Opcional) Usar tu propio dominio

En Vercel, **Settings** → **Domains**, puedes conectar algo como
`formularios.mardom.com` si tienen un dominio propio — Vercel te da las
instrucciones exactas de qué registro DNS agregar.

---

## Cómo queda protegida la información

- Nadie puede entrar al panel administrativo sin ser uno de los 5 correos
  autorizados y sin su contraseña — verificado tanto por Supabase Auth como
  por una regla de base de datos independiente (`allowed_users`).
- Los enlaces públicos (`/f/tu-formulario`) solo permiten **ver y completar**
  ese formulario específico si está en estado "Activo". No exponen ningún
  dato administrativo ni otros formularios.
- Las respuestas solo pueden leerse desde el panel, nunca desde el enlace
  público.

## Qué incluye esta primera versión
Login real, creador visual de formularios con todos los tipos de campo
(incluye firma y subida de archivos), panel con estadísticas, lista de
formularios con duplicar/activar/desactivar/eliminar/copiar enlace, y
respuestas con búsqueda y exportación a CSV.

## Ideas para una segunda etapa
Notificaciones por correo al recibir una respuesta, lógica condicional entre
preguntas, roles de "Editor" y "Solo lectura" (la tabla `allowed_users` ya
tiene el campo `role` listo para esto), gráficos de barras en las respuestas,
y plantillas reutilizables.

---

¿Te trabas en algún paso? Pega aquí el mensaje de error exacto que veas y
seguimos desde ahí.
