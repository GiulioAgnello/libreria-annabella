import { NextResponse } from "next/server";

type DatiLibro = {
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

/** Un mese: i dati bibliografici di un ISBN non cambiano mai. */
const CACHE = 60 * 60 * 24 * 30;

/** Oltre questo, meglio rispondere "non trovato" che far aspettare davanti alla fotocamera. */
const ATTESA_MASSIMA = 6000;

/**
 * Dato un ISBN, cerca i dati del libro su Google Books e OpenLibrary.
 *
 * Le due fonti vengono interrogate **in parallelo** e i risultati uniti, dando la
 * precedenza a Google (copertura migliore sui libri italiani) e riempiendo i buchi
 * con OpenLibrary. Prima erano in fila, con OpenLibrary usata solo se Google
 * falliva del tutto: bastava che Google rispondesse qualcosa di parziale perché il
 * resto andasse perso, e si pagava comunque la latenza di due chiamate una dietro
 * l'altra.
 *
 * Il motivo per cui questo endpoint smetteva di funzionare è che Google Books,
 * senza chiave API, mette le richieste in una quota condivisa e anonima che si
 * esaurisce di continuo — risponde `429 Quota exceeded` e basta. Impostando
 * `GOOGLE_BOOKS_API_KEY` (gratuita, 1.000 richieste al giorno) si ha una quota
 * propria e il problema sparisce. Senza chiave l'endpoint continua comunque a
 * funzionare, appoggiandosi a OpenLibrary quando Google si rifiuta.
 */
export async function GET(richiesta: Request) {
  const { searchParams } = new URL(richiesta.url);
  const isbn = (searchParams.get("isbn") ?? "").replace(/[^0-9Xx]/g, "");

  if (isbn.length !== 10 && isbn.length !== 13) {
    return NextResponse.json({ trovato: false, errore: "ISBN non valido" }, { status: 400 });
  }

  const [google, openLibrary] = await Promise.all([
    cercaGoogleBooks(isbn).catch(() => null),
    cercaOpenLibrary(isbn).catch(() => null),
  ]);

  /*
   * `?fonti=1` dice quale catalogo ha risposto. Serve a rispondere a una domanda
   * che dall'esterno non si può distinguere: se un ISBN non viene trovato, è
   * perché il libro non è in catalogo o perché una delle due fonti è muta (quota
   * esaurita, chiave sbagliata, rete)? Senza questo, si tira a indovinare.
   */
  const fonti = searchParams.has("fonti")
    ? {
        _fonti: {
          google: google ? "ha risposto" : "niente",
          openLibrary: openLibrary ? "ha risposto" : "niente",
          chiaveGoogle: process.env.GOOGLE_BOOKS_API_KEY ? "impostata" : "assente",
        },
      }
    : null;

  const unito = unisci(google, openLibrary);
  if (!unito) {
    return NextResponse.json({ trovato: false, isbn, ...fonti });
  }

  return NextResponse.json({ trovato: true, isbn, ...unito, ...fonti });
}

/** Google per primo, OpenLibrary a tappare i buchi campo per campo. */
function unisci(primario: DatiLibro | null, secondario: DatiLibro | null): DatiLibro | null {
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

/** `fetch` con un tetto di attesa: una fonte lenta non deve bloccare l'altra. */
async function conAttesa(url: string) {
  return fetch(url, {
    signal: AbortSignal.timeout(ATTESA_MASSIMA),
    next: { revalidate: CACHE },
  });
}

async function cercaGoogleBooks(isbn: string): Promise<DatiLibro | null> {
  const chiave = process.env.GOOGLE_BOOKS_API_KEY;

  // `country` è richiesto per le chiamate che partono da un server: senza, Google
  // non riesce a dedurre da dove arriva la richiesta e può rispondere a vuoto.
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=IT` +
    (chiave ? `&key=${chiave}` : "");

  const risposta = await conAttesa(url);

  // 429 = quota esaurita. Non è un errore da mostrare: si va avanti con l'altra fonte.
  if (!risposta.ok) return null;

  const corpo = await risposta.json();
  const info = corpo?.items?.[0]?.volumeInfo;
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

async function cercaOpenLibrary(isbn: string): Promise<DatiLibro | null> {
  const risposta = await conAttesa(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );
  if (!risposta.ok) return null;

  const corpo = await risposta.json();
  const dati = corpo?.[`ISBN:${isbn}`];
  if (!dati?.title) return null;

  const anno = dati.publish_date ? parseInt(String(dati.publish_date).slice(-4), 10) : NaN;
  const copertina: string | undefined = dati.cover?.medium ?? dati.cover?.large;

  return {
    titolo: dati.title,
    sottotitolo: dati.subtitle,
    autori: (dati.authors ?? []).map((a: { name: string }) => a.name),
    editore: dati.publishers?.[0]?.name,
    anno: Number.isFinite(anno) ? anno : undefined,
    pagine: dati.number_of_pages,
    generi: (dati.subjects ?? []).slice(0, 5).map((s: { name: string }) => s.name),
    copertinaUrl: copertina?.replace("http://", "https://"),
  };
}
