"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Chiamato con l'ISBN letto, non appena un codice EAN-13 valido viene riconosciuto. */
  onRilevato: (isbn: string) => void;
};

type Stato = "avvio" | "preparo" | "attivo" | "negato" | "assente" | "motoreKo";

/** Gli ISBN sono sempre codificati come EAN-13 che inizia con 978 o 979. */
const ISBN_VALIDO = /^97[89]\d{10}$/;

type Rilevatore = { detect: (s: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

/**
 * Fotocamera + lettura del codice a barre.
 *
 * Il rilevatore nativo del browser (Chrome su Android) non c'è ovunque: su
 * Safari/iPhone serve un motore ZXing compilato in WebAssembly. Quel file pesa
 * 1,1 MB e la libreria, lasciata a sé stessa, lo scarica dal CDN jsDelivr ogni
 * volta. È esattamente il punto in cui lo scanner si rompeva da telefono: rete
 * mobile lenta, o un DNS che filtra domini esterni, e il motore non arrivava mai.
 *
 * Adesso il file è servito da `public/` — stesso dominio, cache del browser,
 * nessuna dipendenza da terzi — e viene preparato appena il componente compare,
 * non al primo fotogramma: quando la fotocamera è pronta il motore lo è già.
 */
export default function ScannerISBN({ onRilevato }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const flusso = useRef<MediaStream | null>(null);
  const fermo = useRef(false);
  const alRilevamento = useRef(onRilevato);
  const [stato, setStato] = useState<Stato>("avvio");

  useEffect(() => {
    alRilevamento.current = onRilevato;
  }, [onRilevato]);

  useEffect(() => {
    fermo.current = false;
    let intervallo: ReturnType<typeof setInterval> | undefined;

    async function avvia() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStato("assente");
        return;
      }

      // Il motore parte per primo e in parallelo alla fotocamera: è la cosa più
      // lenta delle due, tanto vale che si scaldi mentre l'utente concede il
      // permesso. La promessa viene raccolta più sotto.
      const motore = preparaRilevatore();
      motore.catch(() => {}); // niente "unhandled rejection" se fallisce prima che la attendiamo

      let flussoVideo: MediaStream;
      try {
        flussoVideo = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
      } catch {
        setStato("negato");
        return;
      }

      if (fermo.current) {
        flussoVideo.getTracks().forEach((traccia) => traccia.stop());
        return;
      }
      flusso.current = flussoVideo;

      if (video.current) {
        video.current.srcObject = flussoVideo;
        await video.current.play().catch(() => {});
      }

      setStato("preparo");

      let rilevatore: Rilevatore;
      try {
        rilevatore = await motore;
      } catch {
        // Qui ci si arriva se il motore non si è caricato. Prima finiva nel
        // catch del ciclo di lettura e spariva: la fotocamera restava accesa a
        // non riconoscere niente, senza che nessuno dicesse perché.
        setStato("motoreKo");
        return;
      }

      if (fermo.current) return;
      setStato("attivo");

      intervallo = setInterval(async () => {
        if (!video.current || fermo.current) return;
        try {
          const codici = await rilevatore.detect(video.current);
          const trovato = codici.find((c) => ISBN_VALIDO.test(c.rawValue));
          if (trovato) {
            fermo.current = true;
            alRilevamento.current(trovato.rawValue);
          }
        } catch {
          // Qui invece sì: un fotogramma sfocato o mosso non è un errore,
          // si riprova al giro dopo.
        }
      }, 350);
    }

    avvia();

    return () => {
      fermo.current = true;
      if (intervallo) clearInterval(intervallo);
      flusso.current?.getTracks().forEach((traccia) => traccia.stop());
      flusso.current = null;
    };
  }, []);

  const MESSAGGI: Partial<Record<Stato, string>> = {
    avvio: "Accendo la fotocamera…",
    preparo: "Preparo il lettore…",
    negato:
      "Non riesco a usare la fotocamera: controlla che il browser abbia il permesso, oppure scrivi l'ISBN qui sotto.",
    assente: "Questo browser non ha una fotocamera raggiungibile: scrivi l'ISBN qui sotto.",
    motoreKo:
      "Non riesco ad avviare il lettore dei codici a barre. Riprova, oppure scrivi l'ISBN qui sotto.",
  };

  const inAttesa = stato === "avvio" || stato === "preparo";
  const mostraVideo = stato === "attivo" || stato === "preparo";

  return (
    <div className="overflow-hidden rounded-[10px] border border-tratto bg-inchiostro">
      {MESSAGGI[stato] && (
        <p
          className={`p-6 text-center text-[13.5px] leading-relaxed ${
            inAttesa ? "text-white/60" : "text-white/80"
          }`}
        >
          {MESSAGGI[stato]}
        </p>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        muted
        playsInline
        className={mostraVideo ? "aspect-video w-full object-cover" : "hidden"}
      />
    </div>
  );
}

/**
 * Un rilevatore pronto all'uso: quello nativo se il browser ce l'ha (Chrome su
 * Android, zero peso aggiuntivo), altrimenti il motore ZXing servito dal nostro
 * dominio.
 */
async function preparaRilevatore(): Promise<Rilevatore> {
  const nativo = (globalThis as { BarcodeDetector?: new (o: { formats: string[] }) => Rilevatore })
    .BarcodeDetector;
  if (nativo) return new nativo({ formats: ["ean_13"] });

  const { BarcodeDetector, prepareZXingModule } = await import("barcode-detector/pure");

  await prepareZXingModule({
    overrides: {
      // Emscripten chiede dove sta il file: glielo diamo sul nostro dominio
      // invece di lasciarlo andare su jsDelivr. `scripts/copia-wasm.mjs` tiene
      // la copia allineata alla versione installata, a ogni dev e ogni build.
      locateFile: (percorso: string, prefisso: string) =>
        percorso.endsWith(".wasm") ? "/zxing_reader.wasm" : prefisso + percorso,
    },
    fireImmediately: true,
  });

  return new BarcodeDetector({ formats: ["ean_13"] }) as Rilevatore;
}
