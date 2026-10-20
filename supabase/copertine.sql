-- ============================================================
--  Copertine caricate a mano — da eseguire UNA VOLTA
--  Pannello Supabase → SQL Editor → incolla tutto → Run
-- ============================================================
--
-- Crea il bucket `copertine` nello Storage e le sue regole:
--  - chiunque può *vedere* le copertine (servono anche alla vetrina pubblica);
--  - ognuno può caricare, sostituire e cancellare solo i file nella propria
--    cartella, che si chiama come il suo id utente.
-- Rieseguirlo non fa danni.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('copertine', 'copertine', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "copertine visibili a tutti" on storage.objects;
create policy "copertine visibili a tutti" on storage.objects
  for select using (bucket_id = 'copertine');

drop policy if exists "copertine: carico nella mia cartella" on storage.objects;
create policy "copertine: carico nella mia cartella" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'copertine' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "copertine: modifico le mie" on storage.objects;
create policy "copertine: modifico le mie" on storage.objects
  for update to authenticated
  using (bucket_id = 'copertine' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "copertine: cancello le mie" on storage.objects;
create policy "copertine: cancello le mie" on storage.objects
  for delete to authenticated
  using (bucket_id = 'copertine' and (storage.foldername(name))[1] = auth.uid()::text);
