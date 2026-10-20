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
  pagine: number | null;
  pagina_attuale: number | null;
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

/**
 * Quanti libri ci sono, e basta.
 *
 * L'ingresso mostra due numeri e nient'altro, ma per averli scaricava l'intera
 * collezione — tutte le righe di tutte e due le aree — per poi contarle in
 * memoria e buttarle via. `head: true` chiede al database solo il conteggio:
 * nessuna riga viaggia sulla rete.
 */
export async function contaLibreria(): Promise<number> {
  const utente = await utenteCorrente();
  if (!utente) return 0;

  const supabase = await clientServer();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("utente", utente.id)
    .eq("area", "personale");

  return count ?? 0;
}

/** Cruscotto: contare, sommare, e mostrare titolo e autore di pochi libri. */
const CAMPI_SINTESI =
  "id, titolo, autori, stato_lettura, posizione_coda, provenienza, risparmio, prezzo_pagato, copertina_url, pagine, pagina_attuale";

/** Catalogo: quello che si vede in griglia e in tabella, più i campi su cui si filtra. */
const CAMPI_ELENCO =
  "id, titolo, autori, copertina_url, stato_lettura, prezzo_pagato, risparmio, generi, editore, provenienza";

/** Coda di lettura: numero, titolo, autore. */
const CAMPI_CODA = "id, titolo, autori, posizione_coda";

export type LibroSintesi = Pick<
  Libro,
  | "id"
  | "titolo"
  | "autori"
  | "stato_lettura"
  | "posizione_coda"
  | "provenienza"
  | "risparmio"
  | "prezzo_pagato"
  | "copertina_url"
  | "pagine"
  | "pagina_attuale"
>;

export type LibroElenco = Pick<
  Libro,
  | "id"
  | "titolo"
  | "autori"
  | "copertina_url"
  | "stato_lettura"
  | "prezzo_pagato"
  | "risparmio"
  | "generi"
  | "editore"
  | "provenienza"
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
    speso: 0,
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
  /* Quanto è costata la libreria personale: serve al saldo del cruscotto,
     dove viene messo a confronto con l'utile delle rivendite. */
  const speso = libri.reduce((somma, l) => somma + (l.prezzo_pagato ?? 0), 0);
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
    speso,
    prossimo: daLeggereOrdinati[0] ?? null,
    inCorso,
  };
}

/**
 * Il catalogo completo dell'area personale.
 *
 * Una lettura sola, senza filtri: ricerca, filtri e ordinamento avvengono nel
 * browser (`lib/ordinamenti`). La schermata non ha paginazione — riceve comunque
 * tutti i libri — quindi filtrare qui significava solo rimandare ad ogni tendina
 * un sottoinsieme di dati già arrivati.
 *
 * Anche le voci dei menu si ricavano da queste stesse righe: prima erano una
 * seconda interrogazione al database, ora sono un giro sull'elenco in mano.
 */
export async function catalogoLibreria() {
  const utente = await utenteCorrente();
  if (!utente) return [];

  const supabase = await clientServer();
  if (!supabase) return [];

  const { data } = await supabase
    .from("books")
    .select(CAMPI_ELENCO)
    .eq("utente", utente.id)
    .eq("area", "personale");

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

export type LibroTbr = {
  id: string;
  titolo: string;
  autori: string[];
  copertina_url: string | null;
  stato_lettura: string;
  pagine: number | null;
  pagina_attuale: number | null;
  tbr_aggiunto: string | null;
};

/**
 * La TBR e i libri che ci si possono aggiungere, in una lettura sola: sono tutti
 * libri dell'area personale, cambia solo se `tbr_aggiunto` è pieno o vuoto.
 *
 * Nella TBR prima quelli ancora da finire, nell'ordine in cui sono stati messi;
 * in fondo quelli già letti, che restano lì come spunta del periodo.
 */
export async function tbrLibreria(): Promise<{ tbr: LibroTbr[]; candidati: LibroTbr[] }> {
  const vuoto = { tbr: [], candidati: [] };

  const utente = await utenteCorrente();
  if (!utente) return vuoto;

  const supabase = await clientServer();
  if (!supabase) return vuoto;

  const { data } = await supabase
    .from("books")
    .select("id, titolo, autori, copertina_url, stato_lettura, pagine, pagina_attuale, tbr_aggiunto")
    .eq("utente", utente.id)
    .eq("area", "personale")
    .order("titolo", { ascending: true });

  const libri = (data ?? []) as LibroTbr[];
  const finito = (l: LibroTbr) => l.stato_lettura === "letto" || l.stato_lettura === "abbandonato";

  const tbr = libri
    .filter((l) => l.tbr_aggiunto)
    .sort((a, b) => Number(finito(a)) - Number(finito(b)) || a.tbr_aggiunto!.localeCompare(b.tbr_aggiunto!));

  // Tra i candidati prima quelli da leggere: è lì che di solito si pesca.
  const ordine: Record<string, number> = { "da leggere": 0, "in lettura": 1, abbandonato: 2, letto: 3 };
  const candidati = libri
    .filter((l) => !l.tbr_aggiunto)
    .sort((a, b) => (ordine[a.stato_lettura] ?? 9) - (ordine[b.stato_lettura] ?? 9));

  return { tbr, candidati };
}
