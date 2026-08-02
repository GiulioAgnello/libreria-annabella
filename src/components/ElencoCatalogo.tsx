"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Vuoto from "@/components/Vuoto";
import Copertina from "@/components/Copertina";
import SelezionaStato from "@/components/SelezionaStato";
import BarraFiltri, { CONTROLLO, SceltaVista } from "@/components/BarraFiltri";
import {
  FILTRI_CATALOGO_VUOTI,
  ORDINI_CATALOGO,
  filtraCatalogo,
  menuCatalogo,
  qualcosaDiScelto,
} from "@/lib/ordinamenti";
import { nomeGenere } from "@/lib/generi";
import type { LibroElenco } from "@/lib/libri";
import { segnaStatoLettura } from "@/lib/azioni-libri";

const STATI = ["da leggere", "in lettura", "letto", "abbandonato"] as const;
const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));
const BOSCO = "#3f5e4e";

export default function ElencoCatalogo({ righe }: { righe: LibroElenco[] }) {
  const [filtri, setFiltri] = useState(FILTRI_CATALOGO_VUOTI);
  const [aCatalogo, setACatalogo] = useState(false);
  const ricercaPigra = useDeferredValue(filtri.ricerca);

  const menu = useMemo(() => menuCatalogo(righe), [righe]);
  const visibili = useMemo(
    () => filtraCatalogo(righe, { ...filtri, ricerca: ricercaPigra }),
    [righe, filtri, ricercaPigra],
  );

  const attivi = qualcosaDiScelto(filtri, FILTRI_CATALOGO_VUOTI);

  const cambia = (campo: keyof typeof filtri) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFiltri((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <BarraFiltri attivi={attivi} azzera={() => setFiltri(FILTRI_CATALOGO_VUOTI)}>
          <input
            type="search"
            value={filtri.ricerca}
            onChange={cambia("ricerca")}
            placeholder="Cerca titolo o autore…"
            className={`min-w-[180px] flex-1 ${CONTROLLO}`}
          />

          <select value={filtri.ordina} onChange={cambia("ordina")} className={CONTROLLO}>
            {Object.entries(ORDINI_CATALOGO).map(([chiave, etichetta]) => (
              <option key={chiave} value={chiave}>
                {etichetta}
              </option>
            ))}
          </select>

          <select value={filtri.stato} onChange={cambia("stato")} className={CONTROLLO}>
            <option value="">Tutti gli stati</option>
            {STATI.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* I due menu compaiono solo se c'è qualcosa da scegliere: su una
              libreria appena iniziata sarebbero tende vuote e basta. */}
          {menu.generi.length > 0 && (
            <select value={filtri.genere} onChange={cambia("genere")} className={CONTROLLO}>
              <option value="">Tutti i generi</option>
              {menu.generi.map((g) => (
                // Il valore resta l'originale del catalogo: si traduce solo l'etichetta.
                <option key={g} value={g}>
                  {nomeGenere(g)}
                </option>
              ))}
            </select>
          )}

          {menu.editori.length > 0 && (
            <select value={filtri.editore} onChange={cambia("editore")} className={CONTROLLO}>
              <option value="">Tutti gli editori</option>
              {menu.editori.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}
        </BarraFiltri>

        <SceltaVista aCatalogo={aCatalogo} cambia={setACatalogo} colore={BOSCO} />
      </div>

      {righe.length > 0 && (
        <p className="mb-3 text-[12.5px] text-inchiostro-3">
          {visibili.length === 1 ? "1 libro" : `${visibili.length} libri`}
          {attivi && ` su ${righe.length}`}
        </p>
      )}

      {visibili.length === 0 ? (
        <Vuoto
          titolo="Nessun libro trovato"
          testo={attivi ? "Prova a togliere qualche filtro." : "Aggiungi il tuo primo libro dallo scanner."}
        />
      ) : aCatalogo ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {visibili.map((l) => (
            <div key={l.id} className="tessera flex flex-col overflow-hidden">
              <Link href={`/libro/${l.id}`} className="flex flex-1 flex-col">
                <div className="relative flex aspect-[2/3] items-center justify-center bg-glicine-tenue">
                  {l.copertina_url ? (
                    <Image
                      src={l.copertina_url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-mincho text-[13px] text-glicine-fondo">senza copertina</span>
                  )}
                </div>
                <div className="px-3 pt-3">
                  <div className="line-clamp-2 text-[13.5px] leading-snug hover:underline">{l.titolo}</div>
                  {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                </div>
              </Link>
              <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-3 pt-2">
                <span className="text-[12px] text-inchiostro-3">{EURO(l.risparmio)}</span>
                <SelezionaStato id={l.id} attuale={l.stato_lettura} azione={segnaStatoLettura} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tessera overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13.5px]">
              <thead>
                <tr className="border-b border-tratto text-left text-[11.5px] uppercase tracking-[0.06em] text-inchiostro-3">
                  <th className="px-4 py-2.5 font-medium">Titolo</th>
                  <th className="px-4 py-2.5 font-medium">Autore</th>
                  <th className="px-4 py-2.5 font-medium">Editore</th>
                  <th className="px-4 py-2.5 font-medium">Pagato</th>
                  <th className="px-4 py-2.5 font-medium">Risparmio</th>
                  <th className="px-4 py-2.5 font-medium">Stato</th>
                </tr>
              </thead>
              <tbody>
                {visibili.map((l) => (
                  <tr key={l.id} className="border-b border-tratto last:border-0">
                    <td className="whitespace-nowrap px-4 py-2">
                      <Link href={`/libro/${l.id}`} className="flex items-center gap-2.5 group">
                        <Copertina url={l.copertina_url} />
                        <span className="group-hover:underline">{l.titolo}</span>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{l.autori.join(", ") || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-3">{l.editore ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.risparmio)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <SelezionaStato id={l.id} attuale={l.stato_lettura} azione={segnaStatoLettura} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
