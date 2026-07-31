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

/**
 * Data un ISBN, cerca i dati del libro: prima su Google Books (copertura migliore
 * per i libri italiani), poi su OpenLibrary come riserva. Entrambi sono gratuiti
 * e non richiedono una chiave.
 */
export async function GET(richiesta: Request) {
  const { searchParams } = new URL(richiesta.url);
  const isbn = (searchParams.get("isbn") ?? "").replace(/[^0-9Xx]/g, "");

  if (isbn.length !== 10 && isbn.length !== 13) {
    return NextResponse.json({ trovato: false, errore: "ISBN non valido" }, { status: 400 });
  }

  const daGoogle = await cercaGoogleBooks(isbn).catch(() => null);
  if (daGoogle) {
    return NextResponse.json({ trovato: true, isbn, ...daGoogle });
  }

  const daOpenLibrary = await cercaOpenLibrary(isbn).catch(() => null);
  if (daOpenLibrary) {
    return NextResponse.json({ trovato: true, isbn, ...daOpenLibrary });
  }

  return NextResponse.json({ trovato: false, isbn });
}

async function cercaGoogleBooks(isbn: string): Promise<DatiLibro | null> {
  const risposta = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
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
  const risposta = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
  );
  if (!risposta.ok) return null;

  const corpo = await risposta.json();
  const dati = corpo?.[`ISBN:${isbn}`];
  if (!dati?.title) return null;

  const anno = dati.publish_date ? parseInt(String(dati.publish_date).slice(-4), 10) : NaN;

  return {
    titolo: dati.title,
    sottotitolo: dati.subtitle,
    autori: (dati.authors ?? []).map((a: { name: string }) => a.name),
    editore: dati.publishers?.[0]?.name,
    anno: Number.isFinite(anno) ? anno : undefined,
    pagine: dati.number_of_pages,
    generi: (dati.subjects ?? []).slice(0, 5).map((s: { name: string }) => s.name),
    copertinaUrl: dati.cover?.medium ?? dati.cover?.large,
  };
}
