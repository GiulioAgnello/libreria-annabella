-- ============================================================
--  La Libreria di Annabella — schema del database
--  Da incollare nell'SQL Editor di Supabase ed eseguire una volta.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- profilo ----------
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  nome        text,
  slug        text unique,                    -- indirizzo della vetrina pubblica
  creato_il   timestamptz not null default now()
);

-- ---------- elenchi personalizzabili ----------
create table if not exists generi (
  id        uuid primary key default uuid_generate_v4(),
  utente    uuid not null references auth.users on delete cascade,
  nome      text not null,
  unique (utente, nome)
);

create table if not exists canali (
  id        uuid primary key default uuid_generate_v4(),
  utente    uuid not null references auth.users on delete cascade,
  nome      text not null,
  tipo      text not null default 'entrambi' check (tipo in ('acquisto','vendita','entrambi')),
  unique (utente, nome)
);

-- ---------- i libri: una riga per copia fisica ----------
create type area_libro      as enum ('personale','vendita');
create type stato_lettura   as enum ('da leggere','in lettura','letto','abbandonato');
create type stato_commercio as enum ('in magazzino','venduta','prenotata');
create type provenienza_t   as enum ('acquisto','biblioteca','audible','regalo');
create type formato_t       as enum ('rilegato','brossura','tascabile','ebook','audiolibro');
create type condizione_t    as enum ('nuovo','come nuovo','buono','discreto','danneggiato');

create table if not exists books (
  id                uuid primary key default uuid_generate_v4(),
  utente            uuid not null references auth.users on delete cascade,
  area              area_libro not null default 'personale',

  -- identificazione
  isbn              text,
  titolo            text not null,
  sottotitolo       text,
  autori            text[] not null default '{}',
  editore           text,
  anno              int,
  lingua            text,
  pagine            int,
  collana           text,
  copertina_url     text,

  -- catalogazione
  generi            text[] not null default '{}',
  tag               text[] not null default '{}',
  posizione         text,
  note              text,

  -- stato fisico
  formato           formato_t,
  condizione        condizione_t,

  -- denaro comune alle due aree
  prezzo_pagato     numeric(10,2),
  prezzo_copertina  numeric(10,2),
  provenienza       provenienza_t not null default 'acquisto',
  canale_acquisto   text,
  data_acquisto     date,

  -- solo area personale
  stato_lettura     stato_lettura not null default 'da leggere',
  posizione_coda    int,
  voto              int check (voto between 1 and 5),
  recensione        text,
  data_inizio       date,
  data_fine         date,
  pagina_attuale    int,

  -- solo area vendita
  stato             stato_commercio not null default 'in magazzino',
  prezzo_richiesto  numeric(10,2),
  prezzo_vendita    numeric(10,2),
  data_vendita      date,
  canale_vendita    text,
  spese             numeric(10,2) not null default 0,
  pubblico          boolean not null default false,

  creato_il         timestamptz not null default now(),
  aggiornato_il     timestamptz not null default now()
);

-- ---------- valori calcolati, mai digitati ----------
alter table books
  add column if not exists risparmio numeric(10,2)
    generated always as (prezzo_copertina - prezzo_pagato) stored,
  add column if not exists margine numeric(10,2)
    generated always as (prezzo_vendita - prezzo_pagato - spese) stored,
  add column if not exists giacenza_giorni int
    generated always as (data_vendita - data_acquisto) stored;

-- ---------- indici ----------
create index if not exists books_utente_area_idx on books (utente, area);
create index if not exists books_isbn_idx        on books (utente, isbn);
create index if not exists books_lettura_idx     on books (utente, stato_lettura);
create index if not exists books_stato_idx       on books (utente, stato);
create index if not exists books_coda_idx        on books (utente, posizione_coda);
create index if not exists books_ricerca_idx     on books using gin (to_tsvector('italian', coalesce(titolo,'') || ' ' || coalesce(editore,'')));

-- La ricerca del catalogo usa `ilike '%testo%'`, e un indice tsvector come quello
-- qui sopra Postgres non lo può usare per un LIKE con il jolly davanti: finiva
-- sempre in scansione completa della tabella. Il trigram invece funziona proprio
-- per questo caso.
create extension if not exists pg_trgm;
create index if not exists books_titolo_trgm_idx on books using gin (titolo gin_trgm_ops);

-- Le due liste più aperte in assoluto — coda di lettura e magazzino — filtrano
-- sempre su utente + area + stato. Un indice che copre tutte e tre evita a Postgres
-- di rileggere le righe una per una.
create index if not exists books_personale_idx on books (utente, area, stato_lettura);
create index if not exists books_vendita_idx   on books (utente, area, stato);

-- ---------- aggiornamento automatico del timestamp ----------
create or replace function tocca_aggiornato_il() returns trigger language plpgsql as $$
begin
  new.aggiornato_il = now();
  return new;
end $$;

drop trigger if exists books_tocca on books;
create trigger books_tocca before update on books
  for each row execute function tocca_aggiornato_il();

-- ---------- sicurezza a livello di riga ----------
alter table books    enable row level security;
alter table profiles enable row level security;
alter table generi   enable row level security;
alter table canali   enable row level security;

-- ogni utente vede e modifica soltanto i propri libri
drop policy if exists "libri propri" on books;
create policy "libri propri" on books
  for all using (auth.uid() = utente) with check (auth.uid() = utente);

-- la vetrina: chiunque può leggere le copie in vendita marcate pubbliche
drop policy if exists "vetrina pubblica" on books;
create policy "vetrina pubblica" on books
  for select using (pubblico = true and area = 'vendita' and stato = 'in magazzino');

drop policy if exists "profilo proprio" on profiles;
create policy "profilo proprio" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profilo pubblico" on profiles;
create policy "profilo pubblico" on profiles for select using (true);

drop policy if exists "generi propri" on generi;
create policy "generi propri" on generi
  for all using (auth.uid() = utente) with check (auth.uid() = utente);

drop policy if exists "canali propri" on canali;
create policy "canali propri" on canali
  for all using (auth.uid() = utente) with check (auth.uid() = utente);

-- ---------- profilo creato in automatico alla registrazione ----------
create or replace function crea_profilo() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nome) values (new.id, new.email);
  return new;
end $$;

drop trigger if exists crea_profilo_trigger on auth.users;
create trigger crea_profilo_trigger after insert on auth.users
  for each row execute function crea_profilo();
