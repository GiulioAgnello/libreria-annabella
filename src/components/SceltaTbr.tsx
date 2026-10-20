"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Icona from "@/components/Icona";
import { aggiungiTbr } from "@/lib/azioni-tbr";
import { corrisponde } from "@/lib/ordinamenti";
import type { LibroTbr } from "@/lib/libri";

const BOSCO = "#3f5e4e";

/**
 * Il "+" della TBR: apre l'elenco dei libri della libreria non ancora in lista,
 * con una ricerca per titolo o autore. Un tocco e il libro entra nella TBR.
 * Il pannello resta aperto, così se ne possono aggiungere diversi di fila.
 */
export default function SceltaTbr({ candidati }: { candidati: LibroTbr[] }) {
  const [aperto, setAperto] = useState(false);
  const [cerca, setCerca] = useState("");
  const [inCorso, setInCorso] = useState<string | null>(null);
  const [, avvia] = useTransition();
  const cercaPigra = useDeferredValue(cerca);

  const visibili = useMemo(
    () => candidati.filter((l) => corrisponde(l, cercaPigra)).slice(0, 60),
    [candidati, cercaPigra],
  );

  function aggiungi(id: string) {
    setInCorso(id);
    avvia(async () => {
      await aggiungiTbr(id);
      setInCorso(null);
    });
  }

  if (!aperto) {
    return (
      <button
        type="button"
        onClick={() => setAperto(true)}
        className="mb-5 inline-flex items-center gap-2 rounded-[9px] px-4 py-2.5 text-[14px] font-medium text-white transition hover:opacity-90"
        style={{ background: BOSCO }}
      >
        <Icona nome="piu" className="size-3.5" />
        Aggiungi libri alla TBR
      </button>
    );
  }

  return (
    <div className="tessera mb-6 px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[15px] text-inchiostro-2">Scegli dalla tua libreria</h3>
        <button
          type="button"
          onClick={() => {
            setAperto(false);
            setCerca("");
          }}
          aria-label="Chiudi"
          className="rounded-[7px] p-1.5 text-inchiostro-3 transition hover:bg-black/5 hover:text-inchiostro"
        >
          <Icona nome="chiudi" className="size-4" />
        </button>
      </div>

      <input
        type="search"
        value={cerca}
        onChange={(e) => setCerca(e.target.value)}
        placeholder="Cerca titolo o autore…"
        autoFocus
        className="w-full rounded-[9px] border border-tratto bg-superficie px-3 py-2.5 text-[14px] outline-none focus:border-bosco"
      />

      {candidati.length === 0 ? (
        <p className="mt-3 text-[13px] text-inchiostro-3">Tutti i libri della tua libreria sono già nella TBR.</p>
      ) : visibili.length === 0 ? (
        <p className="mt-3 text-[13px] text-inchiostro-3">Nessun libro trovato con questa ricerca.</p>
      ) : (
        <ul className="mt-3 max-h-[360px] divide-y divide-tratto overflow-y-auto">
          {visibili.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-2">
              <div className="h-[45px] w-[30px] shrink-0 overflow-hidden rounded-[3px] border border-tratto bg-glicine-tenue">
                {l.copertina_url && (
                  <Image
                    src={l.copertina_url}
                    alt=""
                    width={30}
                    height={45}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px]">{l.titolo}</div>
                <div className="truncate text-[12px] text-inchiostro-3">
                  {l.autori[0] ?? "—"} · {l.stato_lettura}
                </div>
              </div>
              <button
                type="button"
                onClick={() => aggiungi(l.id)}
                disabled={inCorso !== null}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12.5px] transition hover:bg-bosco-tenue disabled:opacity-50"
                style={{ borderColor: BOSCO, color: BOSCO }}
              >
                <Icona nome="piu" className="size-3" />
                {inCorso === l.id ? "Aggiungo…" : "Aggiungi"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
