-- ============================================================
--  TBR ("to be read") — da eseguire UNA VOLTA
--  Pannello Supabase → SQL Editor → incolla tutto → Run
-- ============================================================
--
-- I libri che Annabella vuole leggere in questo periodo. Una colonna sola: se è
-- vuota il libro non è nella TBR, altrimenti dice quando ce l'ha messo (e da lì
-- l'ordine della lista). Rieseguirlo non fa danni.

alter table books add column if not exists tbr_aggiunto timestamptz;

create index if not exists books_tbr_idx on books (utente, tbr_aggiunto) where tbr_aggiunto is not null;
