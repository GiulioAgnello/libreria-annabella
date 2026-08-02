import { clientServer, utenteCorrente } from "@/lib/supabase/server";
import type { Libro } from "@/lib/libri";

export type LibroVendita = Libro & {
  spese: number;
  data_acquisto: string | null;
  data_vendita: string | null;
  canale_vendita: string | null;
};

/*
 * Come nell'area personale: ogni schermata chiede solo le colonne che disegna.
 * Il cruscotto della compravendita deve fare somme e contare, non ha bisogno
 * delle copertine né dei generi di ogni singola copia.
 */

/** Cruscotto e contabilità: numeri da sommare, più titolo per le due liste corte. */
const CAMPI_CONTI =
  "id, titolo, stato, prezzo_pagato, prezzo_vendita, prezzo_richiesto, margine, data_acquisto, data_vendita";

/** Magazzino: la griglia con copertina, il prezzo richiesto, la giacenza, la vetrina. */
const CAMPI_MAGAZZINO =
  "id, titolo, autori, copertina_url, stato, prezzo_pagato, prezzo_richiesto, spese, data_acquisto, pubblico, editore, condizione";

/** Storico vendite: la tabella con margine e ROI. */
const CAMPI_STORICO =
  "id, titolo, autori, stato, prezzo_pagato, prezzo_vendita, margine, data_vendita, editore, canale_vendita, copertina_url";

/**
 * Cosa vuol dire "in magazzino".
 *
 * Una copia prenotata è promessa a qualcuno ma non ancora pagata: finché non
 * incassi resta merce tua, e va contata fra quello che hai. Prima stava fuori da
 * entrambe le liste — non era "in magazzino" e non era "venduta" — quindi
 * segnarla prenotata la faceva sparire dall'applicazione pur restando nel
 * database. Un elenco solo, usato sia dalla lista sia dai conti del cruscotto,
 * è ciò che impedisce alle due cose di raccontare numeri diversi.
 *
 * Resta invece fuori dalla vetrina pubblica: offrire una copia già promessa
 * sarebbe solo un modo per doversi scusare dopo.
 */
export const STATI_MAGAZZINO = ["in magazzino", "prenotata"] as const;
const inMagazzinoOra = (stato: string) => (STATI_MAGAZZINO as readonly string[]).includes(stato);

export type VenditaConti = Pick<
  LibroVendita,
  "id" | "titolo" | "stato" | "prezzo_pagato" | "prezzo_vendita" | "prezzo_richiesto" | "margine" | "data_acquisto" | "data_vendita"
>;

export type VenditaMagazzino = Pick<
  LibroVendita,
  | "id"
  | "titolo"
  | "autori"
  | "copertina_url"
  | "stato"
  | "prezzo_pagato"
  | "prezzo_richiesto"
  | "spese"
  | "data_acquisto"
  | "pubblico"
  | "editore"
  | "condizione"
>;

export type VenditaStorico = Pick<
  LibroVendita,
  | "id"
  | "titolo"
  | "autori"
  | "stato"
  | "prezzo_pagato"
  | "prezzo_vendita"
  | "margine"
  | "data_vendita"
  | "editore"
  | "canale_vendita"
  | "copertina_url"
>;

/** Verifica la sessione e scarica le copie dell'area vendita, con le sole colonne chieste. */
async function libriVendita<T>(campi: string): Promise<T[] | null> {
  const utente = await utenteCorrente();
  if (!utente) return null;

  const supabase = await clientServer();
  if (!supabase) return null;

  const { data } = await supabase
    .from("books")
    .select(campi)
    .eq("utente", utente.id)
    .eq("area", "vendita");

  return (data ?? []) as unknown as T[];
}

/**
 * Quante copie ci sono nell'area compravendita, e basta.
 *
 * Serve all'ingresso, che di questa area mostra un solo numero. Prima per
 * ottenerlo passava da `statisticheVendita()`, cioè scaricava ogni riga per poi
 * contarle: nove colonne per copia, buttate via subito dopo.
 */
export async function contaVendita(): Promise<number> {
  const utente = await utenteCorrente();
  if (!utente) return 0;

  const supabase = await clientServer();
  if (!supabase) return 0;

  const { count } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("utente", utente.id)
    .eq("area", "vendita");

  return count ?? 0;
}

/** I numeri del cruscotto compravendita: utile, incassato, ricarico, valore del magazzino. */
export async function statisticheVendita() {
  const vuoto = {
    inMagazzino: 0,
    vendute: 0,
    speso: 0,
    incassato: 0,
    utile: 0,
    ricarico: 1,
    margineMedio: 0,
    valoreMagazzino: 0,
    costoMagazzino: 0,
    ultimeVendite: [] as VenditaConti[],
    ferme: [] as (VenditaConti & { giorniGiacenza: number })[],
  };

  const libri = await libriVendita<VenditaConti>(CAMPI_CONTI);
  if (!libri || libri.length === 0) return vuoto;

  // Stesso metro della lista: se il magazzino mostra anche le prenotate, il
  // cruscotto deve contarle, altrimenti la schermata dice dodici e la pagina
  // accanto ne elenca tredici.
  const inMagazzino = libri.filter((l) => inMagazzinoOra(l.stato));
  const vendute = libri.filter((l) => l.stato === "venduta");

  const speso = vendute.reduce((s, l) => s + (l.prezzo_pagato ?? 0), 0);
  const incassato = vendute.reduce((s, l) => s + (l.prezzo_vendita ?? 0), 0);
  const utile = vendute.reduce((s, l) => s + (l.margine ?? 0), 0);

  const oggi = Date.now();
  const ferme = inMagazzino
    .filter((l) => l.data_acquisto)
    .map((l) => ({
      ...l,
      giorniGiacenza: Math.floor((oggi - new Date(l.data_acquisto as string).getTime()) / 86400000),
    }))
    .filter((l) => l.giorniGiacenza > 90)
    .sort((a, b) => b.giorniGiacenza - a.giorniGiacenza);

  // "Ultime vendite" ora sono davvero le ultime: prima si prendevano le prime cinque
  // nell'ordine in cui capitavano dal database, che non è l'ordine di vendita.
  const ultimeVendite = [...vendute]
    .sort((a, b) => (b.data_vendita ?? "").localeCompare(a.data_vendita ?? ""))
    .slice(0, 5);

  return {
    inMagazzino: inMagazzino.length,
    vendute: vendute.length,
    speso,
    incassato,
    utile,
    ricarico: speso > 0 ? incassato / speso : 1,
    margineMedio: vendute.length > 0 ? utile / vendute.length : 0,
    valoreMagazzino: inMagazzino.reduce((s, l) => s + (l.prezzo_richiesto ?? 0), 0),
    costoMagazzino: inMagazzino.reduce((s, l) => s + (l.prezzo_pagato ?? 0), 0),
    ultimeVendite,
    ferme,
  };
}

/*
 * Da qui in giù si legge e basta.
 *
 * Filtrare e ordinare non si fa più qui: quelle schermate non hanno paginazione,
 * quindi ricevono comunque tutte le righe. Farle rimandare dal server ad ogni
 * cambio di filtro voleva dire ritrasmettere dati che il browser aveva già.
 * Adesso la lettura è una sola e il resto avviene in memoria (`lib/ordinamenti`),
 * dove è istantaneo e non costa niente a nessuno.
 *
 * I campi calcolati (giacenza, margine atteso, resa) restano invece un lavoro da
 * server: dipendono dalla data di oggi, e farli fare al browser significherebbe
 * ottenere numeri diversi da quelli disegnati un istante prima.
 */

export type RigaMagazzino = VenditaMagazzino & {
  margineAtteso: number | null;
  giorniGiacenza: number | null;
};

/** Tutte le copie ancora da incassare, con margine atteso e giorni di giacenza. */
export async function magazzinoVendita(): Promise<RigaMagazzino[]> {
  const libri = await libriVendita<VenditaMagazzino>(CAMPI_MAGAZZINO);
  if (!libri) return [];

  const oggi = Date.now();
  return libri
    .filter((l) => inMagazzinoOra(l.stato))
    .map((l) => ({
      ...l,
      margineAtteso:
        l.prezzo_richiesto != null ? l.prezzo_richiesto - (l.prezzo_pagato ?? 0) - l.spese : null,
      giorniGiacenza: l.data_acquisto
        ? Math.floor((oggi - new Date(l.data_acquisto).getTime()) / 86400000)
        : null,
    }));
}

export type RigaVendita = VenditaStorico & { roi: number | null };

/** Tutte le vendite, con margine e resa sul costo per riga. */
export async function venditeStorico(): Promise<RigaVendita[]> {
  const libri = await libriVendita<VenditaStorico>(CAMPI_STORICO);
  if (!libri) return [];

  return libri
    .filter((l) => l.stato === "venduta")
    .map((l) => ({
      ...l,
      roi:
        l.prezzo_pagato && l.prezzo_pagato > 0 && l.margine != null ? l.margine / l.prezzo_pagato : null,
    }));
}
