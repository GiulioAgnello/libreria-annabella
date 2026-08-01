import { clientServer, utenteCorrente } from "@/lib/supabase/server";

export type Libro = {
  id: string;
  isbn: string | null;
  titolo: string;
  sottotitolo: string | null;
  autori: string[];
  editore: string | null;
  anno: number | null;
  copertina_url: string | null;
  generi: string[];
  formato: string | null;
  condizione: string | null;
  prezzo_pagato: number | null;
  prezzo_copertina: number | null;
  risparmio: number | null;
  provenienza: string;
  stato_lettura: string;
  posizione_coda: number | null;
  voto: number | null;
  stato: string;
  prezzo_richiesto: number | null;
  prezzo_vendita: number | null;
  margine: number | null;
  pubblico: boolean;
};

/*
 * Ogni funzione chiede al database soltanto le colonne che la sua schermata disegna.
 * Prima ne chiedevano tutte e ventitré ovunque: per contare i libri del cruscotto
 * viaggiavano anche ISBN, editore, sottotitolo, generi, copertine — dati che nessuno
 * guardava. Su una connessione di telefono è tempo di attesa regalato.
 */

/** Cruscotto: contare, sommare, e mostrare titolo e autore di pochi libri. */
const CAMPI_SINTESI = "id, titolo, autori, stato_lettura, posizione_coda, provenienza, risparmio";

/** Catalogo: quello che si vede in griglia e in tabella, niente di più. */
const CAMPI_ELENCO = "id, titolo, autori, copertina_url, stato_lettura, prezzo_pagato, risparmio";

/** Coda di lettura: numero, titolo, autore. */
const CAMPI_CODA = "id, titolo, autori, posizione_coda";

export type LibroSintesi = Pick<
  Libro,
  "id" | "titolo" | "autori" | "stato_lettura" | "posizione_coda" | "provenienza" | "risparmio"
>;

export type LibroElenco = Pick<
  Libro,
  "id" | "titolo" | "autori" | "copertina_url" | "stato_lettura" | "prezzo_pagato" | "risparmio"
>;

export type LibroCoda = Pick<Libro, "id" | "titolo" | "autori" | "posizione_coda">;

/** Numeri del cruscotto dell'area personale: quanto letto, quanto risparmiato, cosa arriva dopo. */
export async function statisticheLibreria() {
  const vuoto = {
    totale: 0,
    daLeggere: 0,
    inLettura: 0,
    letti: 0,
    abbandonati: 0,
    prestiti: 0,
    audiolibri: 0,
    risparmio: 0,
    prossimo: null as LibroSintesi | null,
    inCorso: [] as LibroSintesi[],
  };

  const utente = await utenteCorrente();
  if (!utente) return vuoto;

  const supabase = await clientServer();
  if (!supabase) return vuoto;

  const { data } = await supabase
    .from("books")
    .select(CAMPI_SINTESI)
    .eq("utente", utente.id)
    .eq("area", "personale");

  const libri = (data ?? []) as unknown as LibroSintesi[];
  if (libri.length === 0) return vuoto;

  const risparmio = libri.reduce((somma, l) => somma + (l.risparmio ?? 0), 0);
  const inCorso = libri
    .filter((l) => l.stato_lettura === "in lettura")
    .sort((a, b) => a.titolo.localeCompare(b.titolo));
  const daLeggereOrdinati = libri
    .filter((l) => l.stato_lettura === "da leggere")
    .sort((a, b) => (a.posizione_coda ?? 9999) - (b.posizione_coda ?? 9999));

  return {
    totale: libri.length,
    daLeggere: daLeggereOrdinati.length,
    inLettura: inCorso.length,
    letti: libri.filter((l) => l.stato_lettura === "letto").length,
    abbandonati: libri.filter((l) => l.stato_lettura === "abbandonato").length,
    prestiti: libri.filter((l) => l.provenienza === "biblioteca").length,
    audiolibri: libri.filter((l) => l.provenienza === "audible").length,
    risparmio,
    prossimo: daLeggereOrdinati[0] ?? null,
    inCorso,
  };
}

/** Il catalogo completo dell'area personale, con ricerca testo e filtro per stato di lettura. */
export async function catalogoLibreria(filtri: { ricerca?: string; statoLettura?: string }) {
  const utente = await utenteCorrente();
  if (!utente) return [];

  const supabase = await clientServer();
  if (!supabase) return [];

  let query = supabase
    .from("books")
    .select(CAMPI_ELENCO)
    .eq("utente", utente.id)
    .eq("area", "personale");

  if (filtri.statoLettura) {
    query = query.eq("stato_lettura", filtri.statoLettura);
  }
  if (filtri.ricerca) {
    query = query.ilike("titolo", `%${filtri.ricerca}%`);
  }

  const { data } = await query.order("titolo", { ascending: true });
  return (data ?? []) as unknown as LibroElenco[];
}

/** La coda "da leggere", in ordine di priorità. */
export async function codaLettura() {
  const utente = await utenteCorrente();
  if (!utente) return [];

  const supabase = await clientServer();
  if (!supabase) return [];

  const { data } = await supabase
    .from("books")
    .select(CAMPI_CODA)
    .eq("utente", utente.id)
    .eq("area", "personale")
    .eq("stato_lettura", "da leggere")
    .order("posizione_coda", { ascending: true });

  return (data ?? []) as unknown as LibroCoda[];
}
