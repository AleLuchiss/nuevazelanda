# Kiwi Latino: Plataforma Working Holiday NZ para la comunidad latina

## 1. Stack recomendado

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | **Next.js 14+ (App Router) + React + TypeScript** | SSR/SEO para las guías (clave para que la wiki posicione en Google), rutas simples |
| Estilos | **Tailwind CSS** + `lucide-react` (íconos) | Paleta personalizada rápida, mobile-first |
| Backend / DB | **Supabase** (PostgreSQL + Auth + Storage + Realtime) | Google OAuth listo, Row Level Security, almacenamiento de fotos, Realtime para el chat de la Fase 2 |
| Hosting | **Vercel** | Deploy automático desde GitHub, plan gratuito suficiente para el MVP |
| Editor de guías | **Tiptap** (o Markdown + `react-markdown`) | Edición rica y guardado como JSON/Markdown |
| Mapa (Fase 2) | **MapLibre GL** o Leaflet | Gratuito, sin depender de Google Maps |
| Validación | **Zod** | Formularios y API consistentes |

Alternativa: Firebase (Auth + Firestore). Se eligió Supabase porque el contenido es muy relacional (usuarios, guías, votos, viajes) y los filtros del calendario se resuelven mejor con SQL.

## 2. Esquema de base de datos

El SQL completo está en `supabase/schema.sql`. Resumen de entidades:

- **profiles** (Users): extiende `auth.users`. País de origen, ciudad inicial en NZ, tipo de visa, foto, bio.
- **trips** (Flights/Dates): fecha exacta *o* mes estimado de llegada a NZ. Un usuario puede tener varios.
- **posts** (Guides): categoría (`tramites`, `empleo`, `alojamiento`, `experiencias`), contenido, slug, puntaje.
- **post_votes**: un voto por usuario por guía.
- **photos**: URL en Storage, pie de foto, ubicación (texto + lat/lng opcional), etiquetas.
- **Preparado para Fase 2**: `badges`, `user_badges` (gamificación), `points_ledger` y `chat_rooms` / `chat_messages` (chat por mes de llegada). `photos` y `posts` ya tienen lat/lng para el mapa.

## 3. Estructura de carpetas

```
kiwi-latino/
├── ARQUITECTURA.md
├── supabase/
│   └── schema.sql
├── tailwind.config.ts
├── .env.example
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Landing
│   │   ├── login/page.tsx
│   │   ├── auth/callback/route.ts    # Intercambio de código OAuth
│   │   ├── perfil/[username]/page.tsx
│   │   ├── timeline/page.tsx         # Calendario comunitario
│   │   ├── guias/
│   │   │   ├── page.tsx              # Listado + filtros por categoría
│   │   │   ├── nueva/page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── galeria/page.tsx
│   │   └── (fase2)/
│   │       ├── chat/[room]/page.tsx
│   │       ├── mapa/page.tsx
│   │       └── ranking/page.tsx
│   ├── components/
│   │   ├── auth/GoogleLoginButton.tsx
│   │   ├── timeline/CommunityTimeline.tsx
│   │   ├── guides/ (GuideCard, VoteButton, CategoryTabs)
│   │   ├── gallery/ (PhotoGrid, UploadPhotoForm)
│   │   └── ui/ (Button, Card, Navbar)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Navegador
│   │   │   └── server.ts             # Server Components / Route Handlers
│   │   └── constants.ts              # Categorías, visas, países LATAM
│   ├── middleware.ts                 # Refresco de sesión
│   └── types/database.ts             # Tipos generados por Supabase CLI
```

## 4. Puesta en marcha

1. `npx create-next-app@latest kiwi-latino --typescript --tailwind --app`
2. `npm i @supabase/supabase-js @supabase/ssr lucide-react`
3. Crear proyecto en Supabase y ejecutar `supabase/schema.sql` en el SQL Editor.
4. Supabase → Authentication → Providers → **Google**: pegar Client ID/Secret de Google Cloud Console.
   - URI de redirección autorizada en Google: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
   - En Supabase → URL Configuration, agregar `http://localhost:3000/auth/callback` y la URL de producción.
5. Copiar `.env.example` a `.env.local` y completar.
6. Copiar los archivos de `src/` y `tailwind.config.ts` de este paquete.

## 5. Cómo escala a la Fase 2

- **Chat**: tablas `chat_rooms` (una por mes de llegada, creada automáticamente desde `trips`) + Supabase Realtime. No hace falta tocar lo existente.
- **Mapa**: `posts` y `photos` ya guardan `lat/lng`; se agrega una tabla `listings` (alquileres/trabajos) y una página con MapLibre.
- **Gamificación**: triggers SQL que insertan en `points_ledger` al publicar una guía o recibir votos; `profiles.points` se mantiene con un trigger y los `badges` se otorgan por umbrales.

## 6. Recomendaciones de producto

- Moderación desde el inicio: campo `status` en `posts` (`published`/`hidden`) y botón "Reportar".
- Privacidad: el usuario elige si su viaje es público en el timeline (`is_public`) y no se exponen emails.
- Aclarar en las guías de trámites la fecha de última verificación: los requisitos de visa, IRD y bancos cambian.
