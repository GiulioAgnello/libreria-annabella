"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { caricaCopertina, rimuoviCopertina } from "@/lib/azioni-copertina";

/** Lato lungo massimo della copertina salvata: nitida in scheda, leggera negli elenchi. */
const LATO_MASSIMO = 640;

/**
 * La copertina di un libro, con la possibilità di sostituirla con una foto.
 *
 * Si tocca la copertina (o il riquadro vuoto) e il telefono propone fotocamera o
 * galleria. Prima di partire l'immagine viene rimpicciolita qui nel browser: una
 * foto del telefono pesa 3-4 MB, una copertina da 640px ne pesa una sessantina.
 *
 * Due modi d'uso:
 *  - con `libroId` (scheda di un libro già salvato): la nuova copertina viene
 *    salvata subito, senza dover premere "Salva modifiche";
 *  - senza (modulo di inserimento): la foto viene caricata e l'URL passato a
 *    `onCambia`, che lo salva insieme al resto del libro.
 */
export default function CaricaCopertina({
  url: iniziale,
  libroId,
  onCambia,
}: {
  url: string | null;
  libroId?: string;
  onCambia?: (url: string | null) => void;
}) {
  const [url, setUrl] = useState(iniziale);
  const [stato, setStato] = useState<"fermo" | "carico" | "tolgo">("fermo");
  const [errore, setErrore] = useState("");
  const selettore = useRef<HTMLInputElement>(null);
  const router = useRouter();

  /* Nel modulo di inserimento la copertina può arrivare dal catalogo dopo il
     primo render: se il genitore cambia URL, ci si allinea. */
  const [ultimoIniziale, setUltimoIniziale] = useState(iniziale);
  if (iniziale !== ultimoIniziale) {
    setUltimoIniziale(iniziale);
    setUrl(iniziale);
  }

  async function scelto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permette di riscegliere lo stesso file
    if (!file) return;

    setErrore("");
    setStato("carico");
    try {
      const immagine = await rimpicciolisci(file);
      const dati = new FormData();
      dati.append("file", immagine, "copertina.jpg");

      // Nel modulo di inserimento, la foto caricata poco prima diventa inutile.
      const precedente = libroId ? null : url;
      const esito = await caricaCopertina(dati, libroId ?? null, precedente);

      if (!esito.ok) {
        setErrore(esito.messaggio);
        return;
      }
      setUrl(esito.url);
      onCambia?.(esito.url);
      if (libroId) router.refresh();
    } catch {
      setErrore("Non riesco a leggere questa immagine. Prova con un'altra foto.");
    } finally {
      setStato("fermo");
    }
  }

  async function togli() {
    setErrore("");
    if (!libroId) {
      setUrl(null);
      onCambia?.(null);
      return;
    }
    setStato("tolgo");
    const esito = await rimuoviCopertina(libroId);
    setStato("fermo");
    if (!esito.ok) {
      setErrore(esito.messaggio);
      return;
    }
    setUrl(null);
    router.refresh();
  }

  const occupato = stato !== "fermo";

  return (
    <div className="w-[88px] shrink-0">
      <button
        type="button"
        onClick={() => selettore.current?.click()}
        disabled={occupato}
        aria-label={url ? "Cambia la copertina" : "Aggiungi una copertina"}
        className="group relative block h-[132px] w-[88px] overflow-hidden rounded-[6px] border border-tratto bg-glicine-tenue transition hover:border-inchiostro-3"
      >
        {url ? (
          <Image src={url} alt="" width={88} height={132} unoptimized className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center text-[11.5px] leading-tight text-inchiostro-3">
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[20px]"
            >
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Aggiungi copertina
          </span>
        )}

        {occupato && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/75 text-[12px] text-inchiostro-2">
            {stato === "carico" ? "Carico…" : "Tolgo…"}
          </span>
        )}
      </button>

      <input ref={selettore} type="file" accept="image/*" onChange={scelto} className="hidden" />

      {url && !occupato && (
        <div className="mt-1.5 flex justify-between text-[11.5px] text-inchiostro-3">
          <button type="button" onClick={() => selettore.current?.click()} className="underline hover:text-inchiostro-2">
            Cambia
          </button>
          <button type="button" onClick={togli} className="underline hover:text-vermiglio">
            Togli
          </button>
        </div>
      )}

      {errore && <p className="mt-1.5 text-[11.5px] leading-snug text-vermiglio">{errore}</p>}
    </div>
  );
}

/**
 * Ridisegna l'immagine con il lato lungo a `LATO_MASSIMO` e la esporta in JPEG.
 * `createImageBitmap` applica già la rotazione EXIF, quindi le foto fatte col
 * telefono in verticale restano in verticale.
 */
async function rimpicciolisci(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scala = Math.min(1, LATO_MASSIMO / Math.max(bitmap.width, bitmap.height));
  const larghezza = Math.round(bitmap.width * scala);
  const altezza = Math.round(bitmap.height * scala);

  const tela = document.createElement("canvas");
  tela.width = larghezza;
  tela.height = altezza;
  const ctx = tela.getContext("2d");
  if (!ctx) throw new Error("canvas non disponibile");

  // Fondo bianco: un PNG trasparente in JPEG diventerebbe nero.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, larghezza, altezza);
  ctx.drawImage(bitmap, 0, 0, larghezza, altezza);
  bitmap.close();

  return new Promise((risolvi, rifiuta) =>
    tela.toBlob((b) => (b ? risolvi(b) : rifiuta(new Error("conversione fallita"))), "image/jpeg", 0.85),
  );
}
