import { NextResponse } from "next/server";
import { daGoogle, unisci, type DatiLibro } from "@/lib/dati-libro";

/** Oltre questo, meglio rispondere "non trovato" che far aspettare davanti alla fotocamera. */
const ATTESA_MASSIMA = 6000;

/**
 * Dato un ISBN, cerca i dati del libro su Google Books e OpenLibrary.
 *
 * NB: in produzione Google risponde 503 alle chiamate da Vercel, quindi qui di
 * fatto lavora OpenLibrary. Google lo interroga il modulo di inserimento
 * direttamente dal browser (`cercaGoogleDalBrowser` in `lib/dati-libro.ts`);
 * la parte Google di questa rotta resta per il giorno in cui torni a funzionare.
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

  const [esitoGoogle, esitoOpenLibrary] = await Promise.all([
    cercaGoogleBooks(isbn).catch((e): Esito => ({ dati: null, motivo: descriviErrore(e) })),
    cercaOpenLibrary(isbn).catch((e): Esito => ({ dati: null, motivo: descriviErrore(e) })),
  ]);
  const google = esitoGoogle.dati;
  const openLibrary = esitoOpenLibrary.dati;

  /*
   * `?fonti=1` dice quale catalogo ha risposto. Serve a rispondere a una domanda
   * che dall'esterno non si può distinguere: se un ISBN non viene trovato, è
   * perché il libro non è in catalogo o perché una delle due fonti è muta (quota
   * esaurita, chiave sbagliata, rete)? Senza questo, si tira a indovinare.
   */
  const fonti = searchParams.has("fonti")
    ? {
        _fonti: {
          google: google ? "ha risposto" : esitoGoogle.motivo,
          openLibrary: openLibrary ? "ha risposto" : esitoOpenLibrary.motivo,
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

/** Risultato di una fonte: i dati, oppure il motivo per cui non ce ne sono. */
type Esito = { dati: DatiLibro | null; motivo: string };

function descriviErrore(e: unknown): string {
  if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
    return `nessuna risposta entro ${ATTESA_MASSIMA / 1000}s`;
  }
  return "errore di rete: " + (e instanceof Error ? e.message : String(e));
}

/**
 * `fetch` con un tetto di attesa: una fonte lenta non deve bloccare l'altra.
 *
 * Niente cache, di proposito. Prima ogni risposta restava in memoria un mese —
 * comprese quelle *vuote*: bastava che un giorno Google fosse senza quota (o
 * rispondesse a vuoto, cosa che fa) perché quell'ISBN restasse "non trovato" per
 * trenta giorni, anche riprovando. Le ricerche sono poche, una per libro aggiunto:
 * chiedere ogni volta costa niente e dà sempre la risposta di oggi.
 */
async function conAttesa(url: string) {
  return fetch(url, {
    signal: AbortSignal.timeout(ATTESA_MASSIMA),
    cache: "no-store",
  });
}

/** Il messaggio d'errore di Google, senza mai riportare la chiave. */
async function motivoGoogle(risposta: Response): Promise<string> {
  let dettaglio = "";
  try {
    const corpo = await risposta.json();
    dettaglio = corpo?.error?.message ?? "";
  } catch {
    // corpo non JSON: basta il codice
  }
  const chiave = process.env.GOOGLE_BOOKS_API_KEY;
  if (chiave) dettaglio = dettaglio.split(chiave).join("***");
  return `HTTP ${risposta.status}${dettaglio ? " — " + dettaglio : ""}`;
}

async function cercaGoogleBooks(isbn: string): Promise<Esito> {
  const chiave = process.env.GOOGLE_BOOKS_API_KEY;

  // `country` è richiesto per le chiamate che partono da un server: senza, Google
  // non riesce a dedurre da dove arriva la richiesta e può rispondere a vuoto.
  const base = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&country=IT`;

  let risposta = await conAttesa(base + (chiave ? `&key=${chiave}` : ""));

  /*
   * Chiave rifiutata (400 non valida, 403 API non abilitata o chiave limitata ai
   * "referrer HTTP", che una chiamata da server non ha mai): invece di arrendersi
   * si riprova senza chiave, nella quota anonima. Spesso è esaurita anche quella,
   * ma quando non lo è il libro arriva lo stesso.
   */
  if (chiave && (risposta.status === 400 || risposta.status === 403)) {
    const motivoChiave = await motivoGoogle(risposta);
    risposta = await conAttesa(base);
    if (!risposta.ok) {
      return { dati: null, motivo: `chiave rifiutata (${motivoChiave}); senza chiave: ${await motivoGoogle(risposta)}` };
    }
  }

  // 429 = quota esaurita. Non è un errore da mostrare: si va avanti con l'altra fonte.
  if (!risposta.ok) return { dati: null, motivo: await motivoGoogle(risposta) };

  const corpo = await risposta.json();
  const info = corpo?.items?.[0]?.volumeInfo;
  if (!info?.title) return { dati: null, motivo: "ISBN non presente nel catalogo" };


  const dati = daGoogle(info);
  return { dati, motivo: "ha risposto" };
}

async function cercaOpenLibrary(isbn: string): Promise<Esito> {
  const risposta = await conAttesa(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );
  if (!risposta.ok) return { dati: null, motivo: `HTTP ${risposta.status}` };

  const corpo = await risposta.json();
  const dati = corpo?.[`ISBN:${isbn}`];
  if (!dati?.title) return { dati: null, motivo: "ISBN non presente nel catalogo" };

  const anno = dati.publish_date ? parseInt(String(dati.publish_date).slice(-4), 10) : NaN;
  const copertina: string | undefined = dati.cover?.medium ?? dati.cover?.large;

  const libro: DatiLibro = {
    titolo: dati.title,
    sottotitolo: dati.subtitle,
    autori: (dati.authors ?? []).map((a: { name: string }) => a.name),
    editore: dati.publishers?.[0]?.name,
    anno: Number.isFinite(anno) ? anno : undefined,
    pagine: dati.number_of_pages,
    generi: (dati.subjects ?? []).slice(0, 5).map((s: { name: string }) => s.name),
    copertinaUrl: copertina?.replace("http://", "https://"),
  };
  return { dati: libro, motivo: "ha risposto" };
}
