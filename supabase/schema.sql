-- Kiwi Latino: esquema PostgreSQL (Supabase)

create extension if not exists "pgcrypto";

-- ENUMS
create type post_category as enum ('tramites', 'empleo', 'alojamiento', 'experiencias');
create type visa_type as enum ('working_holiday', 'student', 'work', 'visitor', 'otra');
create type post_status as enum ('published', 'hidden');

-- PROFILES (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text not null,
  avatar_url text,
  bio text,
  origin_country text,                -- país de origen en Latinoamérica
  nz_start_city text,                 -- ciudad inicial en NZ
  visa visa_type default 'working_holiday',
  points integer not null default 0,  -- Fase 2: gamificación
  created_at timestamptz not null default now()
);

-- Crear perfil automáticamente al registrarse con Google
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- TRIPS (fechas de viaje a NZ)
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  arrival_date date,                  -- fecha exacta (opcional)
  arrival_month date,                 -- primer día del mes estimado (siempre se completa)
  flight_origin text,                 -- ciudad/aeropuerto de salida (para buscar compañeros de vuelo)
  flight_number text,
  notes text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  check (arrival_date is not null or arrival_month is not null)
);
create index trips_month_idx on public.trips (arrival_month);
create index trips_date_idx on public.trips (arrival_date);

-- POSTS (guías y consejos)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  category post_category not null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,              -- Markdown
  tags text[] default '{}',
  score integer not null default 0,   -- suma de votos (mantenida por trigger)
  status post_status not null default 'published',
  lat double precision,               -- Fase 2: mapa
  lng double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_category_idx on public.posts (category, score desc);

create table public.post_votes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (post_id, user_id)
);

create or replace function public.refresh_post_score()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.post_id, old.post_id);
begin
  update public.posts
     set score = coalesce((select sum(value) from public.post_votes where post_id = pid), 0)
   where id = pid;
  return null;
end; $$;

create trigger post_votes_score
  after insert or update or delete on public.post_votes
  for each row execute function public.refresh_post_score();

-- PHOTOS
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null,         -- bucket "photos"
  caption text,
  location_name text,
  lat double precision,
  lng double precision,
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

-- FASE 2 (descomentar cuando se necesite)
-- create table public.badges (id serial primary key, code text unique, name text, description text, min_points int);
-- create table public.user_badges (user_id uuid references profiles(id), badge_id int references badges(id), awarded_at timestamptz default now(), primary key (user_id, badge_id));
-- create table public.chat_rooms (id uuid primary key default gen_random_uuid(), name text, arrival_month date unique);
-- create table public.chat_messages (id bigserial primary key, room_id uuid references chat_rooms(id), user_id uuid references profiles(id), body text, created_at timestamptz default now());

-- ROW LEVEL SECURITY
alter table public.profiles   enable row level security;
alter table public.trips      enable row level security;
alter table public.posts      enable row level security;
alter table public.post_votes enable row level security;
alter table public.photos     enable row level security;

create policy "perfiles visibles" on public.profiles for select using (true);
create policy "editar mi perfil"  on public.profiles for update using (auth.uid() = id);

create policy "ver viajes públicos o propios" on public.trips for select
  using (is_public or auth.uid() = user_id);
create policy "crear mis viajes"  on public.trips for insert with check (auth.uid() = user_id);
create policy "editar mis viajes" on public.trips for update using (auth.uid() = user_id);
create policy "borrar mis viajes" on public.trips for delete using (auth.uid() = user_id);

create policy "ver guías publicadas" on public.posts for select
  using (status = 'published' or auth.uid() = author_id);
create policy "crear mis guías"  on public.posts for insert with check (auth.uid() = author_id);
create policy "editar mis guías" on public.posts for update using (auth.uid() = author_id);
create policy "borrar mis guías" on public.posts for delete using (auth.uid() = author_id);

create policy "ver votos"   on public.post_votes for select using (true);
create policy "votar"       on public.post_votes for insert with check (auth.uid() = user_id);
create policy "cambiar voto" on public.post_votes for update using (auth.uid() = user_id);
create policy "quitar voto" on public.post_votes for delete using (auth.uid() = user_id);

create policy "ver fotos"    on public.photos for select using (true);
create policy "subir fotos"  on public.photos for insert with check (auth.uid() = user_id);
create policy "borrar fotos" on public.photos for delete using (auth.uid() = user_id);

-- Vista para el timeline: viajes públicos con datos del viajero
create or replace view public.timeline_view as
select t.id, t.user_id, t.arrival_date, t.arrival_month, t.flight_origin,
       p.display_name, p.avatar_url, p.origin_country, p.nz_start_city, p.visa
from public.trips t
join public.profiles p on p.id = t.user_id
where t.is_public;
