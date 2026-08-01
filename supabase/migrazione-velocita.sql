-- ============================================================
--  Migrazione: indici per la velocità
--  Da incollare nell'SQL Editor di Supabase ed eseguire una volta.
--
--  Serve perché `schema.sql` per intero non si può rieseguire: i `create type`
--  darebbero errore su un database già popolato. Qui c'è solo la parte nuova,
--  ed è tutta idempotente — puoi lanciarla anche due volte senza danni.
-- ============================================================

-- La ricerca del catalogo usa `ilike '%testo%'`. Un indice tsvector non serve a
-- niente per un LIKE con il jolly davanti: Postgres finiva sempre per leggere
-- tutta la tabella. Il trigram è l'indice giusto per questo caso.
create extension if not exists pg_trgm;
create index if not exists books_titolo_trgm_idx on books using gin (titolo gin_trgm_ops);

-- Le due liste più aperte — coda di lettura e magazzino — filtrano sempre su
-- utente + area + stato. Un indice che le copre tutte e tre in un colpo solo.
create index if not exists books_personale_idx on books (utente, area, stato_lettura);
create index if not exists books_vendita_idx   on books (utente, area, stato);

-- Controllo: dopo l'esecuzione dovresti vedere i tre indici nuovi nell'elenco.
select indexname from pg_indexes where tablename = 'books' order by indexname;
