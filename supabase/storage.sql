-- Buckets de Storage para fotos de perfil y galería (ejecutar en el SQL Editor de Supabase)

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('photos', 'photos', true)
on conflict (id) do nothing;

-- Cada usuario sube/edita solo dentro de su carpeta: <bucket>/<user_id>/archivo
create policy "avatars lectura pública" on storage.objects for select
  using (bucket_id in ('avatars', 'photos'));

create policy "subir en mi carpeta" on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'photos') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "actualizar en mi carpeta" on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'photos') and (storage.foldername(name))[1] = auth.uid()::text);

create policy "borrar en mi carpeta" on storage.objects for delete to authenticated
  using (bucket_id in ('avatars', 'photos') and (storage.foldername(name))[1] = auth.uid()::text);
