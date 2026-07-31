"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Chiamato con l'ISBN letto, non appena un codice EAN-13 valido viene riconosciuto. */
  onRilevato: (isbn: string) => void;
};

type Stato = "avvio" | "attivo" | "negato" | "assente";

/** Gli ISBN sono sempre codificati come EAN-13 che inizia con 978 o 979. */
const ISBN_VALIDO = /^97[89]\d{10}$/;

/**
 * Fotocamera + lettura del codice a barre. Usa il rilevatore nativo del browser
 * quando c'è (Chrome/Android, zero peso aggiuntivo); altrimenti carica — solo in
 * quel momento, a parte — un polyfill via WebAssembly che funziona ovunque,
 * incluso Safari/iPhone.
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

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
        });
      } catch {
        setStato("negato");
        return;
      }

      if (fermo.current) {
        stream.getTracks().forEach((traccia) => traccia.stop());
        return;
      }
      flusso.current = stream;

      if (video.current) {
        video.current.srcObject = stream;
        await video.current.play().catch(() => {});
      }
      setStato("attivo");

      const { BarcodeDetector } = await import("barcode-detector/pure");
      const rilevatore = new BarcodeDetector({ formats: ["ean_13"] });

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
          // un fotogramma illeggibile non è un errore: si riprova al prossimo giro
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

  return (
    <div className="overflow-hidden rounded-[10px] border border-tratto bg-inchiostro">
      {stato === "negato" && (
        <p className="p-6 text-center text-[13.5px] leading-relaxed text-white/80">
          Non riesco a usare la fotocamera: controlla che il browser abbia il permesso, oppure scrivi
          l&apos;ISBN qui sotto.
        </p>
      )}
      {stato === "assente" && (
        <p className="p-6 text-center text-[13.5px] leading-relaxed text-white/80">
          Questo browser non ha una fotocamera raggiungibile: scrivi l&apos;ISBN qui sotto.
        </p>
      )}
      {stato === "avvio" && (
        <p className="p-6 text-center text-[13.5px] text-white/60">Accendo la fotocamera…</p>
      )}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={video}
        muted
        playsInline
        className={stato === "attivo" ? "aspect-video w-full object-cover" : "hidden"}
      />
    </div>
  );
}
