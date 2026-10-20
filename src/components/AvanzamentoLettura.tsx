"use client";

import { useState, useTransition } from "react";
import Icona from "@/components/Icona";
import { aggiornaPagina } from "@/lib/azioni-libri";

/**
 * La barra "pag. 50 di 149 · 34%" con, accanto, un piccolo "Aggiorna": si apre
 * un campo per la pagina nuova e qualche scorciatoia (+10, +25, +50), si salva
 * e la barra si sposta, senza aprire la scheda del libro.
 *
 * Se il libro non ha ancora il numero di pagine, il campo chiede anche quello.
 */
export default function AvanzamentoLettura({
  id,
  pagina,
  pagine,
  colore,
}: {
  id: string;
  pagina: number | null;
  pagine: number | null;
  colore: string;
}) {
  const [aperto, setAperto] = useState(false);
  const [valore, setValore] = useState(String(pagina ?? ""));
  const [totale, setTotale] = useState("");
  const [errore, setErrore] = useState("");
  const [avviso, setAvviso] = useState("");
  const [salvando, avvia] = useTransition();

  const percento = pagine && pagina ? Math.min(100, Math.max(0, Math.round((pagina / pagine) * 100))) : null;

  function piu(n: number) {
    const base = parseInt(valore, 10) || pagina || 0;
    const nuovo = base + n;
    setValore(String(pagine ? Math.min(nuovo, pagine) : nuovo));
  }

  function salva(e: React.FormEvent) {
    e.preventDefault();
    setErrore("");
    const numero = parseInt(valore, 10);
    if (!Number.isFinite(numero)) {
      setErrore("Scrivi un numero.");
      return;
    }
    avvia(async () => {
      const esito = await aggiornaPagina(id, numero, pagine ? null : parseInt(totale, 10) || null);
      if (!esito.ok) {
        setErrore(esito.messaggio);
        return;
      }
      setAperto(false);
      if (esito.finito) setAvviso("Finito! L'ho segnato come letto.");
    });
  }

  if (!aperto) {
    return (
      <div className="pt-2">
        {percento !== null && (
          <div className="h-[5px] overflow-hidden rounded-full bg-tratto/60">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${percento}%`, background: colore }}
            />
          </div>
        )}
        <div className="mt-1 flex items-center justify-between gap-2 text-[11.5px] text-inchiostro-3">
          <span>
            {percento !== null ? `pag. ${pagina} di ${pagine}` : avviso || "Non hai ancora segnato la pagina"}
          </span>
          <span className="flex items-center gap-2">
            {percento !== null && (
              <span className="numero" style={{ color: colore }}>
                {percento}%
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setValore(String(pagina ?? ""));
                setAvviso("");
                setAperto(true);
              }}
              className="inline-flex items-center gap-1 rounded-[6px] border border-tratto bg-superficie px-2 py-0.5 text-[11.5px] text-inchiostro-2 transition hover:border-inchiostro-3"
            >
              <Icona nome="matita" className="size-2.5" />
              Aggiorna
            </button>
          </span>
        </div>
      </div>
    );
  }

  const CAMPO =
    "w-[68px] rounded-[7px] border border-tratto bg-superficie px-2 py-1 text-[13px] outline-none focus:border-bosco";

  return (
    <form onSubmit={salva} className="pt-2">
      <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-inchiostro-2">
        <span>pag.</span>
        <input
          value={valore}
          onChange={(e) => setValore(e.target.value)}
          inputMode="numeric"
          autoFocus
          onFocus={(e) => e.target.select()}
          aria-label="Pagina a cui sei arrivata"
          className={CAMPO}
        />
        {pagine ? (
          <span>di {pagine}</span>
        ) : (
          <>
            <span>di</span>
            <input
              value={totale}
              onChange={(e) => setTotale(e.target.value)}
              inputMode="numeric"
              placeholder="totale"
              aria-label="Pagine totali del libro"
              className={CAMPO}
            />
          </>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {[10, 25, 50].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => piu(n)}
            className="rounded-[6px] border border-tratto bg-superficie px-2 py-0.5 text-[11.5px] text-inchiostro-2 transition hover:border-inchiostro-3"
          >
            +{n}
          </button>
        ))}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => setAperto(false)}
          className="px-1.5 text-[11.5px] text-inchiostro-3 underline hover:text-inchiostro-2"
        >
          Annulla
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-[6px] px-2.5 py-1 text-[11.5px] font-medium text-white transition disabled:opacity-60"
          style={{ background: colore }}
        >
          {salvando ? "Salvo…" : "Salva"}
        </button>
      </div>

      {errore && <p className="mt-1 text-[11.5px] text-vermiglio">{errore}</p>}
    </form>
  );
}
