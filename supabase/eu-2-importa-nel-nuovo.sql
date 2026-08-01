-- ============================================================
--  PASSO 2 di 2 — da eseguire nel progetto NUOVO (Francoforte)
--
--  PRIMA di lanciarlo devono essere già successe tre cose:
--   1. hai eseguito `schema.sql` sul progetto nuovo;
--   2. hai creato gli account in Authentication → Users, con le
--      STESSE email del progetto vecchio (passo 5b del runbook);
--   3. hai copiato il JSON prodotto dalla query B del passo 1.
--
--  Il JSON porta con sé l'email del proprietario di ogni libro,
--  quindi l'assegnazione è automatica e regge anche se gli
--  account sono più d'uno.
-- ============================================================


-- ------------------------------------------------------------
-- QUERY A — controllo preliminare. Devi vedere elencate le stesse
-- email che ti ha mostrato la query A del passo 1. Se ne manca
-- una, creala prima di andare avanti: i suoi libri verrebbero
-- scartati.
-- ------------------------------------------------------------

select id, email, created_at from auth.users order by created_at;


-- ------------------------------------------------------------
-- QUERY B — l'importazione. Seleziona la scritta INCOLLA_QUI_IL_JSON
-- (solo quella, senza toccare i due `$libri$`) e incollaci sopra il
-- JSON copiato al passo 1.
--
-- I `$libri$` fanno da virgolette. Non sono un vezzo: con i normali
-- apici singoli, il primo titolo che contiene un apostrofo — e in
-- italiano arriva subito, "Un anno sull'Altipiano" — chiuderebbe la
-- stringa a metà e manderebbe tutto in errore. Il dollar quoting di
-- Postgres prende alla lettera qualunque cosa ci sia in mezzo.
--
-- Se un libro ha un proprietario che non esiste tra gli account,
-- la riga viene saltata invece di far fallire tutto: la query C alla
-- fine ti dice se è successo.
-- ------------------------------------------------------------

insert into books (
  id, utente, area, isbn, titolo, sottotitolo, autori, editore, anno, lingua, pagine,
  collana, copertina_url, generi, tag, posizione, note, formato, condizione,
  prezzo_pagato, prezzo_copertina, provenienza, canale_acquisto, data_acquisto,
  stato_lettura, posizione_coda, voto, recensione, data_inizio, data_fine,
  pagina_attuale, stato, prezzo_richiesto, prezzo_vendita, data_vendita,
  canale_vendita, spese, pubblico, creato_il
)
select
  l.id,
  u.id,
  l.area, l.isbn, l.titolo, l.sottotitolo, l.autori, l.editore, l.anno, l.lingua, l.pagine,
  l.collana, l.copertina_url, l.generi, l.tag, l.posizione, l.note, l.formato, l.condizione,
  l.prezzo_pagato, l.prezzo_copertina, l.provenienza, l.canale_acquisto, l.data_acquisto,
  l.stato_lettura, l.posizione_coda, l.voto, l.recensione, l.data_inizio, l.data_fine,
  l.pagina_attuale, l.stato, l.prezzo_richiesto, l.prezzo_vendita, l.data_vendita,
  l.canale_vendita, l.spese, l.pubblico, l.creato_il
from jsonb_array_elements($libri$INCOLLA_QUI_IL_JSON$libri$::jsonb) as e(dato)
cross join lateral json_populate_record(null::books, e.dato::json) as l
join auth.users u on u.email = e.dato ->> '_proprietario'
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- QUERY C — verifica. Il totale deve coincidere con quello che ti
-- sei segnato al passo 1, e la ripartizione per proprietario deve
-- essere la stessa.
--
-- `risparmio` e `margine` sono le colonne calcolate: se sono a
-- zero mentre nel progetto vecchio non lo erano, qualcosa non ha
-- funzionato.
-- ------------------------------------------------------------

select
  u.email                                          as proprietario,
  count(*)                                         as libri,
  count(*) filter (where b.area = 'personale')     as in_libreria,
  count(*) filter (where b.area = 'vendita')       as in_compravendita,
  round(sum(coalesce(b.risparmio, 0)), 2)          as risparmio,
  round(sum(coalesce(b.margine, 0)), 2)            as margine,
  count(*) filter (where b.copertina_url is not null) as con_copertina
from books b
left join auth.users u on u.id = b.utente
group by rollup (u.email)
order by u.email nulls last;
