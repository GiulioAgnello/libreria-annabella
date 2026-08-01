-- ============================================================
--  PASSO 1 di 2 — da eseguire nel progetto VECCHIO (Corea)
--
--  Non modifica niente: legge e basta.
--
--  Esegui le due query separatamente (selezionane una alla volta
--  e premi Run, oppure lanciale in ordine).
-- ============================================================


-- ------------------------------------------------------------
-- QUERY A — la fotografia. Guardala prima di procedere:
-- ti dice quanti libri stai portando via e a chi sono intestati.
-- Segnati il totale, al passo 2 deve tornare identico.
-- ------------------------------------------------------------

select
  u.email                                     as proprietario,
  count(*)                                    as libri,
  count(*) filter (where b.area = 'personale') as in_libreria,
  count(*) filter (where b.area = 'vendita')   as in_compravendita
from books b
left join auth.users u on u.id = b.utente
group by rollup (u.email)
order by u.email nulls last;


-- ------------------------------------------------------------
-- QUERY B — i dati. Restituisce una sola cella con tutti i libri
-- in JSON. Clicca sulla cella del risultato e copia tutto:
-- ti serve al passo 2.
--
-- `id` viene portato dietro apposta, così i collegamenti tipo
-- /libro/<id> salvati nei preferiti continuano a funzionare.
--
-- `_proprietario` è l'email di chi possiede il libro: al passo 2
-- serve a riassegnarlo all'account giusto nel progetto nuovo.
--
-- Non compaiono `risparmio`, `margine` e `giacenza_giorni`:
-- sono colonne calcolate, si ricostruiscono da sole.
-- ------------------------------------------------------------

select coalesce(json_agg(t)::text, '[]') as dati_da_copiare
from (
  select
    u.email as _proprietario,
    b.id,
    b.area,
    b.isbn,
    b.titolo,
    b.sottotitolo,
    b.autori,
    b.editore,
    b.anno,
    b.lingua,
    b.pagine,
    b.collana,
    b.copertina_url,
    b.generi,
    b.tag,
    b.posizione,
    b.note,
    b.formato,
    b.condizione,
    b.prezzo_pagato,
    b.prezzo_copertina,
    b.provenienza,
    b.canale_acquisto,
    b.data_acquisto,
    b.stato_lettura,
    b.posizione_coda,
    b.voto,
    b.recensione,
    b.data_inizio,
    b.data_fine,
    b.pagina_attuale,
    b.stato,
    b.prezzo_richiesto,
    b.prezzo_vendita,
    b.data_vendita,
    b.canale_vendita,
    b.spese,
    b.pubblico,
    b.creato_il
  from books b
  left join auth.users u on u.id = b.utente
  order by b.creato_il
) t;
