import { clientServer } from "@/lib/supabase/server";
import type { Libro } from "@/lib/libri";

const CAMPI =
  "id, isbn, titolo, sottotitolo, autori, editore, anno, copertina_url, generi, formato, condizione, " +
  "prezzo_pagato, prezzo_copertina, risparmio, provenienza, stato_lettura, posizione_coda, voto, " +
  "stato, prezzo_richiesto, prezzo_vendita, margine, pubblico, spese, data_acquisto, data_vendita, canale_vendita";

export type LibroVendita = Libro & {
  spese: number;
  data_acquisto: string | null;
  data_vendita: string | null;
  canale_vendita: string | null;
};

async function utenteELibri() {
  const supabase = await clientServer();
  if (!supabase) return null;
  const { data: utente } = await supabase.auth.getUser();
  if (!utente.user) return null;

  const { data } = await supabase.from("books").select(CAMPI).eq("utente", utente.user.id).eq("area", "vendita");

  return { supabase, utenteId: utente.user.id, libri: (data ?? []) as unknown as LibroVendita[] };
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
    ultimeVendite: [] as LibroVendita[],
    ferme: [] as (LibroVendita & { giorniGiacenza: number })[],
  };

  const contesto = await utenteELibri();
  if (!contesto || contesto.libri.length === 0) return vuoto;

  const { libri } = contesto;
  const inMagazzino = libri.filter((l) => l.stato === "in magazzino");
  const vendute = libri.filter((l) => l.stato === "venduta");

  const speso = vendute.reduce((s, l) => s + (l.prezzo_pagato ?? 0), 0);
  const incassato = vendute.reduce((s, l) => s + (l.prezzo_vendita ?? 0), 0);
  const utile = vendute.reduce((s, l) => s + (l.margine ?? 0), 0);

  const oggi = Date.now();
  const ferme = inMagazzino
    .filter((l) => l.data_acquisto)
    .map((l) => ({ ...l, giorniGiacenza: Math.floor((oggi - new Date(l.data_acquisto as string).getTime()) / 86400000) }))
    .filter((l) => l.giorniGiacenza > 90)
    .sort((a, b) => b.giorniGiacenza - a.giorniGiacenza);

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
    ultimeVendite: [...vendute].slice(0, 5),
    ferme,
  };
}

/** Le copie ancora in magazzino, con margine atteso e giorni di giacenza. */
export async function magazzinoVendita() {
  const contesto = await utenteELibri();
  if (!contesto) return [];

  const oggi = Date.now();
  return contesto.libri
    .filter((l) => l.stato === "in magazzino")
    .map((l) => ({
      ...l,
      margineAtteso: l.prezzo_richiesto != null ? l.prezzo_richiesto - (l.prezzo_pagato ?? 0) - l.spese : null,
      giorniGiacenza: l.data_acquisto ? Math.floor((oggi - new Date(l.data_acquisto).getTime()) / 86400000) : null,
    }))
    .sort((a, b) => (b.giorniGiacenza ?? 0) - (a.giorniGiacenza ?? 0));
}

/** Lo storico completo delle vendite, con margine e ROI per riga. */
export async function venditeStorico() {
  const contesto = await utenteELibri();
  if (!contesto) return [];

  return contesto.libri
    .filter((l) => l.stato === "venduta")
    .map((l) => ({
      ...l,
      roi: l.prezzo_pagato && l.prezzo_pagato > 0 && l.margine != null ? l.margine / l.prezzo_pagato : null,
    }))
    .sort((a, b) => {
      if (!a.data_vendita) return 1;
      if (!b.data_vendita) return -1;
      return new Date(b.data_vendita).getTime() - new Date(a.data_vendita).getTime();
    });
}
