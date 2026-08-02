/**
 * Filtri e ordinamenti degli elenchi.
 *
 * Questo file non parla né col database né coi cookie: prende righe già in mano
 * e ne restituisce altre. È deliberato — così le stesse identiche funzioni
 * girano nel browser, dove sono istantanee, invece di costringere ogni filtrata
 * a un giro fino al server e ritorno.
 *
 * Il conto tornava già prima di provarci: le schermate non hanno paginazione,
 * scaricano tutte le righe comunque. Filtrare sul server voleva dire rimandare
 * ogni volta un sottoinsieme di dati che il browser aveva già ricevuto. Una
 * lettura sola e poi tutto in memoria costa meno traffico, non di più.
 *
 * Perché non serve nessun "debounce": il debounce esiste per non martellare la
 * rete mentre si scrive. Senza rete di mezzo, ogni lettera è già istantanea.
 */

// ─── pezzi di confronto, gli stessi per tutte le schermate ───────────────────

/** Confronto testuale con le regole italiane (accenti e maiuscole al posto giusto). */
export const perTesto = (a: string | null, b: string | null) =>
  (a ?? "").localeCompare(b ?? "", "it", { sensitivity: "base" });

/** Numeri: i vuoti sempre in fondo, che si stia ordinando in su o in giù. */
export const perNumero = (a: number | null | undefined, b: number | null | undefined, crescente = false) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return crescente ? a - b : b - a;
};

/** Date in formato AAAA-MM-GG: il confronto testuale è già cronologico. */
export const perData = (a: string | null, b: string | null, recentiPrima = true) => {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return recentiPrima ? b.localeCompare(a) : a.localeCompare(b);
};

/** Vero se il testo cercato compare nel titolo o fra gli autori. */
export const corrisponde = (l: { titolo: string; autori: string[] }, cerca: string) => {
  const ago = cerca.trim().toLowerCase();
  if (!ago) return true;
  return l.titolo.toLowerCase().includes(ago) || l.autori.some((a) => a.toLowerCase().includes(ago));
};

/** Elenco ordinato e senza doppioni dei valori non vuoti di un campo. */
const voci = <T>(righe: T[], prendi: (r: T) => string | null | undefined) => {
  const insieme = new Set<string>();
  for (const r of righe) {
    const v = prendi(r)?.trim();
    if (v) insieme.add(v);
  }
  return [...insieme].sort((a, b) => a.localeCompare(b, "it"));
};

// ─── magazzino ───────────────────────────────────────────────────────────────

export const ORDINI_MAGAZZINO = {
  giacenza: "Ferme da più tempo",
  recenti: "Caricate di recente",
  vecchi: "Caricate per prime",
  titolo: "Titolo (A → Z)",
  "titolo-desc": "Titolo (Z → A)",
  autore: "Autore",
  editore: "Casa editrice",
  "prezzo-desc": "Prezzo richiesto (dal più alto)",
  "prezzo-asc": "Prezzo richiesto (dal più basso)",
  "margine-desc": "Margine atteso (dal più alto)",
} as const;

export type FiltriMagazzino = {
  ricerca: string;
  editore: string;
  condizione: string;
  stato: string;
  ordina: string;
};

export const FILTRI_MAGAZZINO_VUOTI: FiltriMagazzino = {
  ricerca: "",
  editore: "",
  condizione: "",
  stato: "",
  ordina: "giacenza",
};

type RigaMagazzino = {
  titolo: string;
  autori: string[];
  editore: string | null;
  condizione: string | null;
  stato: string;
  prezzo_richiesto: number | null;
  data_acquisto: string | null;
  margineAtteso: number | null;
  giorniGiacenza: number | null;
};

export function filtraMagazzino<T extends RigaMagazzino>(righe: T[], f: FiltriMagazzino): T[] {
  const scelte = righe.filter(
    (l) =>
      (f.stato ? l.stato === f.stato : true) &&
      (f.editore ? l.editore === f.editore : true) &&
      (f.condizione ? l.condizione === f.condizione : true) &&
      corrisponde(l, f.ricerca),
  );

  return scelte.sort((a, b) => {
    switch (f.ordina) {
      case "recenti":
        return perData(a.data_acquisto, b.data_acquisto, true);
      case "vecchi":
        return perData(a.data_acquisto, b.data_acquisto, false);
      case "titolo":
        return perTesto(a.titolo, b.titolo);
      case "titolo-desc":
        return perTesto(b.titolo, a.titolo);
      case "autore":
        return perTesto(a.autori[0] ?? null, b.autori[0] ?? null) || perTesto(a.titolo, b.titolo);
      case "editore":
        return perTesto(a.editore, b.editore) || perTesto(a.titolo, b.titolo);
      case "prezzo-desc":
        return perNumero(a.prezzo_richiesto, b.prezzo_richiesto);
      case "prezzo-asc":
        return perNumero(a.prezzo_richiesto, b.prezzo_richiesto, true);
      case "margine-desc":
        return perNumero(a.margineAtteso, b.margineAtteso);
      default:
        return perNumero(a.giorniGiacenza, b.giorniGiacenza);
    }
  });
}

export const menuMagazzino = <T extends RigaMagazzino>(righe: T[]) => ({
  editori: voci(righe, (r) => r.editore),
  condizioni: voci(righe, (r) => r.condizione),
  prenotate: righe.filter((r) => r.stato === "prenotata").length,
});

// ─── vendite ─────────────────────────────────────────────────────────────────

export const ORDINI_VENDITE = {
  recenti: "Vendite più recenti",
  vecchie: "Vendite più vecchie",
  "margine-desc": "Guadagno (dal più alto)",
  "margine-asc": "Guadagno (dal più basso)",
  "roi-desc": "Resa sul costo (dalla migliore)",
  "prezzo-desc": "Prezzo di vendita (dal più alto)",
  titolo: "Titolo (A → Z)",
} as const;

export type FiltriVendite = {
  ricerca: string;
  editore: string;
  canale: string;
  anno: string;
  ordina: string;
};

export const FILTRI_VENDITE_VUOTI: FiltriVendite = {
  ricerca: "",
  editore: "",
  canale: "",
  anno: "",
  ordina: "recenti",
};

type RigaVendita = {
  titolo: string;
  autori: string[];
  editore: string | null;
  canale_vendita: string | null;
  data_vendita: string | null;
  margine: number | null;
  prezzo_vendita: number | null;
  roi: number | null;
};

export function filtraVendite<T extends RigaVendita>(righe: T[], f: FiltriVendite): T[] {
  const scelte = righe.filter(
    (l) =>
      (f.editore ? l.editore === f.editore : true) &&
      (f.canale ? l.canale_vendita === f.canale : true) &&
      (f.anno ? (l.data_vendita ?? "").startsWith(f.anno) : true) &&
      corrisponde(l, f.ricerca),
  );

  return scelte.sort((a, b) => {
    switch (f.ordina) {
      case "vecchie":
        return perData(a.data_vendita, b.data_vendita, false);
      case "margine-desc":
        return perNumero(a.margine, b.margine);
      case "margine-asc":
        return perNumero(a.margine, b.margine, true);
      case "roi-desc":
        return perNumero(a.roi, b.roi);
      case "prezzo-desc":
        return perNumero(a.prezzo_vendita, b.prezzo_vendita);
      case "titolo":
        return perTesto(a.titolo, b.titolo);
      default:
        return perData(a.data_vendita, b.data_vendita, true);
    }
  });
}

export const menuVendite = <T extends RigaVendita>(righe: T[]) => ({
  editori: voci(righe, (r) => r.editore),
  canali: voci(righe, (r) => r.canale_vendita),
  // Anni dal più recente: è l'ordine in cui uno li cerca.
  anni: voci(righe, (r) => r.data_vendita?.slice(0, 4)).reverse(),
});

// ─── catalogo personale ──────────────────────────────────────────────────────

export const ORDINI_CATALOGO = {
  titolo: "Titolo (A → Z)",
  "titolo-desc": "Titolo (Z → A)",
  autore: "Autore",
  editore: "Casa editrice",
  "risparmio-desc": "Risparmio (dal più alto)",
  "prezzo-desc": "Prezzo pagato (dal più alto)",
  "prezzo-asc": "Prezzo pagato (dal più basso)",
} as const;

export type FiltriCatalogo = {
  ricerca: string;
  stato: string;
  genere: string;
  editore: string;
  ordina: string;
};

export const FILTRI_CATALOGO_VUOTI: FiltriCatalogo = {
  ricerca: "",
  stato: "",
  genere: "",
  editore: "",
  ordina: "titolo",
};

type RigaCatalogo = {
  titolo: string;
  autori: string[];
  editore: string | null;
  generi: string[];
  stato_lettura: string;
  prezzo_pagato: number | null;
  risparmio: number | null;
};

export function filtraCatalogo<T extends RigaCatalogo>(righe: T[], f: FiltriCatalogo): T[] {
  const scelte = righe.filter(
    (l) =>
      (f.stato ? l.stato_lettura === f.stato : true) &&
      (f.editore ? l.editore === f.editore : true) &&
      (f.genere ? l.generi.includes(f.genere) : true) &&
      corrisponde(l, f.ricerca),
  );

  return scelte.sort((a, b) => {
    switch (f.ordina) {
      case "titolo-desc":
        return perTesto(b.titolo, a.titolo);
      case "autore":
        return perTesto(a.autori[0] ?? null, b.autori[0] ?? null) || perTesto(a.titolo, b.titolo);
      case "editore":
        return perTesto(a.editore, b.editore) || perTesto(a.titolo, b.titolo);
      case "risparmio-desc":
        return perNumero(a.risparmio, b.risparmio);
      case "prezzo-desc":
        return perNumero(a.prezzo_pagato, b.prezzo_pagato);
      case "prezzo-asc":
        return perNumero(a.prezzo_pagato, b.prezzo_pagato, true);
      default:
        return perTesto(a.titolo, b.titolo);
    }
  });
}

export const menuCatalogo = <T extends RigaCatalogo>(righe: T[]) => {
  const generi = new Set<string>();
  for (const r of righe) for (const g of r.generi ?? []) if (g.trim()) generi.add(g.trim());

  return {
    generi: [...generi].sort((a, b) => a.localeCompare(b, "it")),
    editori: voci(righe, (r) => r.editore),
  };
};

/** Vero se almeno un filtro è diverso da come si parte. */
export const qualcosaDiScelto = <T extends object>(attuali: T, vuoti: T) =>
  (Object.keys(vuoti) as (keyof T)[]).some((c) => attuali[c] !== vuoti[c]);
