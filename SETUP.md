# Guía de puesta en marcha: Kiwi Latino

Tiempo estimado: 45-60 minutos. Todo es gratis para el MVP.

## Qué necesitás
- Node.js 20 o superior (https://nodejs.org)
- Una cuenta de Google (para Google Cloud y para probar el login)
- Cuentas gratuitas en **Supabase** (https://supabase.com) y **Vercel** (https://vercel.com)
- Una cuenta de **GitHub** (para publicar con Vercel)

---

## Paso 1: Crear el proyecto en Supabase
1. Entrá a Supabase → **New project**. Elegí un nombre (ej. `kiwi-latino`), una contraseña para la base y la región más cercana (São Paulo, `sa-east-1`, para Latinoamérica).
2. Esperá un par de minutos a que termine de crearse.
3. Andá a **Project Settings → API** y copiá dos valores:
   - **Project URL**
   - **anon public key**

## Paso 2: Crear las tablas
1. En Supabase abrí **SQL Editor → New query**.
2. Pegá todo el contenido de `supabase/schema.sql` y tocá **Run**.
3. Abrí otra consulta, pegá `supabase/storage.sql` y tocá **Run**. Esto crea los buckets de fotos (`avatars` y `photos`).
4. Verificá en **Table Editor** que aparezcan `profiles`, `trips`, `posts`, `post_votes` y `photos`.

## Paso 3: Configurar el login con Google
1. Entrá a https://console.cloud.google.com y creá un proyecto nuevo (ej. `kiwi-latino`).
2. **APIs y servicios → Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Completá nombre de la app y tu email de contacto.
   - En "Usuarios de prueba" agregá tu Gmail mientras la app esté en modo prueba. Para abrirla al público después, tocá **Publicar app**.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth**:
   - Tipo: **Aplicación web**.
   - En **URI de redirección autorizados** pegá: `https://TU-PROYECTO.supabase.co/auth/v1/callback` (reemplazá por tu Project URL de Supabase).
   - Guardá y copiá el **Client ID** y el **Client Secret**.
4. En Supabase: **Authentication → Providers → Google**. Activalo y pegá el Client ID y el Client Secret.
5. En Supabase: **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (cuando publiques, la cambiás por tu dominio).
   - **Redirect URLs**: agregá `http://localhost:3000/auth/callback`.

## Paso 4: Correr la página en tu computadora
```bash
cd kiwi-latino
cp .env.example .env.local      # en Windows: copy .env.example .env.local
```
Editá `.env.local` con tus valores:
```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
Después:
```bash
npm install
npm run dev
```
Abrí http://localhost:3000.

## Paso 5: Probar que todo funcione
1. Tocá **Ingresar** → **Continuar con Google**.
2. Completá **Perfil** (nombre, usuario, país, ciudad, visa y foto).
3. En **Mis viajes** agregá un viaje.
4. Andá a **Timeline** y chequeá que aparezcas.

## Paso 6: Publicar en internet (Vercel)
1. Subí la carpeta a un repositorio de GitHub (`.env.local` no se sube, ya está en `.gitignore`).
2. En Vercel: **Add New → Project**, elegí el repositorio.
3. En **Environment Variables** cargá las tres variables del Paso 4. En `NEXT_PUBLIC_SITE_URL` poné la URL que te da Vercel.
4. **Deploy**.
5. Volvé a Supabase → **Authentication → URL Configuration**:
   - **Site URL**: la URL de Vercel.
   - **Redirect URLs**: agregá `https://TU-APP.vercel.app/auth/callback`.

> Si más adelante conectás un dominio propio, repetí el punto 5 con ese dominio.

---

## Problemas frecuentes
| Síntoma | Causa probable |
|---|---|
| Google dice `redirect_uri_mismatch` | La URI de redirección en Google Cloud no es exactamente `https://TU-PROYECTO.supabase.co/auth/v1/callback` |
| Después de loguearte volvés a `/login?error=auth` | Falta agregar `/auth/callback` en **Redirect URLs** de Supabase |
| "Access blocked" en Google | La app está en modo prueba y tu Gmail no está en "Usuarios de prueba" |
| El timeline aparece vacío | Todavía nadie cargó un viaje público, o el viaje está marcado como privado |
| Error al guardar el perfil | No ejecutaste `schema.sql`, o falta `storage.sql` si falla la foto |

## Qué falta construir (próximos pasos)
- **Guías (wiki/blog)**: listado por categoría, editor, votos. La tabla `posts` ya está lista.
- **Galería**: subida de fotos con pie, ubicación y etiquetas. La tabla `photos` y el bucket ya están listos.
- **Moderación y reportes**, y una **página de perfil público** (`/perfil/[username]`).
- **Fase 2**: chat por mes de llegada, mapa y gamificación (ver `ARQUITECTURA.md`).
