/**
 * Dati bibliografici di un ISBN, e come leggerli dalle risposte dei cataloghi.
 *
 * Sta in un file a parte, senza nulla di server, perché serve in due posti: alla
 * rotta `/api/libro` e al modulo di inserimento, che interroga Google Books
 * direttamente dal telefono (vedi `cercaGoogleDalBrowser`).
 */

export type DatiLibro = {
  titolo?: string;
  sottotitolo?: string;
  autori?: string[];
  editore?: string;
  anno?: number;
  lingua?: string;
  pagine?: number;
  generi?: string[];
  copertinaUrl?: string;
};

/** Converte il `volumeInfo` di Google Books nei nostri campi. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function daGoogle(info: any): DatiLibro | null {
  if (!info?.title) return null;
  const anno = info.publishedDate ? parseInt(String(info.publishedDate).slice(0, 4), 10) : NaN;

  return {
    titolo: info.title,
    sottotitolo: info.subtitle,
    autori: info.authors ?? [],
    editore: info.publisher,
    anno: Number.isFinite(anno) ? anno : undefined,
    lingua: info.language,
    pagine: info.pageCount,
    generi: info.categories ?? [],
    copertinaUrl: info.imageLinks?.thumbnail?.replace("http://", "https://"),
  };
}

/** Il primo per primo, il secondo a tappare i buchi campo per campo. */
export function unisci(primario: DatiLibro | null, secondario: DatiLibro | null): DatiLibro | null {
  if (!primario) return secondario;
  if (!secondario) return primario;

  const pieno = <T,>(v: T | undefined): v is T =>
    v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);

  return {
    titolo: pieno(primario.titolo) ? primario.titolo : secondario.titolo,
    sottotitolo: pieno(primario.sottotitolo) ? primario.sottotitolo : secondario.sottotitolo,
    autori: pieno(primario.autori) ? primario.autori : secondario.autori,
    editore: pieno(primario.editore) ? primario.editore : secondario.editore,
    anno: pieno(primario.anno) ? primario.anno : secondario.anno,
    lingua: pieno(primario.lingua) ? primario.lingua : secondario.lingua,
    pagine: pieno(primario.pagine) ? primario.pagine : secondario.pagine,
    generi: pieno(primario.generi) ? primario.generi : secondario.generi,
    copertinaUrl: pieno(primario.copertinaUrl) ? primario.copertinaUrl : secondario.copertinaUrl,
  };
}

/**
 * Google Books interrogato dal browser, senza chiave.
 *
 * Dal server non funziona: Google risponde `503` alle richieste che partono dai
 * datacenter di Vercel, con o senza chiave. Dalla connessione di casa o del
 * telefono invece risponde normalmente, e per pochi libri al giorno la quota
 * senza chiave basta e avanza. Se fallisce per qualunque motivo restituisce
 * null, e il modulo si accontenta di quello che ha trovato il server.
 */
export async function cercaGoogleDalBrowser(isbn: string): Promise<DatiLibro | null> {
  try {
    const risposta = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!risposta.ok) return null;
    const corpo = await risposta.json();
    return daGoogle(corpo?.items?.[0]?.volumeInfo);
  } catch {
    return null;
  }
}
