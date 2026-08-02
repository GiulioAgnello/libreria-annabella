"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Vuoto from "@/components/Vuoto";
import Copertina from "@/components/Copertina";
import BarraFiltri, { CONTROLLO } from "@/components/BarraFiltri";
import {
  FILTRI_VENDITE_VUOTI,
  ORDINI_VENDITE,
  filtraVendite,
  menuVendite,
  qualcosaDiScelto,
} from "@/lib/ordinamenti";
import type { RigaVendita } from "@/lib/vendita";

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));
const PERCENTO = (n: number | null) => (n == null ? "—" : `${(n * 100).toFixed(0)}%`);

export default function ElencoVendite({ righe }: { righe: RigaVendita[] }) {
  const [filtri, setFiltri] = useState(FILTRI_VENDITE_VUOTI);
  const ricercaPigra = useDeferredValue(filtri.ricerca);

  const menu = useMemo(() => menuVendite(righe), [righe]);
  const visibili = useMemo(
    () => filtraVendite(righe, { ...filtri, ricerca: ricercaPigra }),
    [righe, filtri, ricercaPigra],
  );

  const attivi = qualcosaDiScelto(filtri, FILTRI_VENDITE_VUOTI);

  /* I totali sono di quello che si sta guardando, non dell'intero storico: con un
     filtro attivo è proprio la domanda che uno si fa — "quanto ho fatto su questo
     canale", "quanto nel 2025". */
  const incassato = visibili.reduce((s, l) => s + (l.prezzo_vendita ?? 0), 0);
  const guadagno = visibili.reduce((s, l) => s + (l.margine ?? 0), 0);

  const cambia = (campo: keyof typeof filtri) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFiltri((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <>
      <div className="mb-4">
        <BarraFiltri attivi={attivi} azzera={() => setFiltri(FILTRI_VENDITE_VUOTI)}>
          <input
            type="search"
            value={filtri.ricerca}
            onChange={cambia("ricerca")}
            placeholder="Cerca titolo o autore…"
            className={`min-w-[180px] flex-1 ${CONTROLLO}`}
          />

          <select value={filtri.ordina} onChange={cambia("ordina")} className={CONTROLLO}>
            {Object.entries(ORDINI_VENDITE).map(([chiave, etichetta]) => (
              <option key={chiave} value={chiave}>
                {etichetta}
              </option>
            ))}
          </select>

          {menu.anni.length > 1 && (
            <select value={filtri.anno} onChange={cambia("anno")} className={CONTROLLO}>
              <option value="">Tutti gli anni</option>
              {menu.anni.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}

          {menu.canali.length > 0 && (
            <select value={filtri.canale} onChange={cambia("canale")} className={CONTROLLO}>
              <option value="">Tutti i canali</option>
              {menu.canali.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {menu.editori.length > 0 && (
            <select value={filtri.editore} onChange={cambia("editore")} className={CONTROLLO}>
              <option value="">Tutte le case editrici</option>
              {menu.editori.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}
        </BarraFiltri>
      </div>

      {righe.length > 0 && (
        <p className="mb-3 text-[12.5px] text-inchiostro-3">
          {visibili.length === 1 ? "1 vendita" : `${visibili.length} vendite`}
          {attivi && ` su ${righe.length}`} · incassato {EURO(incassato)} · guadagno {EURO(guadagno)}
        </p>
      )}

      {visibili.length === 0 ? (
        <Vuoto
          titolo={attivi ? "Nessuna vendita trovata" : "Nessuna vendita registrata"}
          testo={
            attivi
              ? "Prova a togliere qualche filtro."
              : "Segna una copia come venduta dal magazzino: comparirà qui con margine e resa già calcolati."
          }
        />
      ) : (
        <div className="tessera overflow-hidden">
          {/* Le colonne non stanno in uno schermo da telefono: senza questo
              involucro venivano tagliate e diventavano irraggiungibili. */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13.5px]">
              <thead>
                <tr className="border-b border-tratto text-left text-[11.5px] uppercase tracking-[0.06em] text-inchiostro-3">
                  <th className="px-4 py-2.5 font-medium">Titolo</th>
                  <th className="px-4 py-2.5 font-medium">Pagato</th>
                  <th className="px-4 py-2.5 font-medium">Venduto</th>
                  <th className="px-4 py-2.5 font-medium">Margine</th>
                  <th className="px-4 py-2.5 font-medium">Resa</th>
                  <th className="px-4 py-2.5 font-medium">Canale</th>
                  <th className="px-4 py-2.5 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {visibili.map((l) => (
                  <tr key={l.id} className="border-b border-tratto last:border-0">
                    <td className="whitespace-nowrap px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <Copertina url={l.copertina_url} />
                        <div>
                          {/* Il collegamento è ciò che rende una copia venduta di nuovo
                              modificabile: la scheda ha già tutti i campi e il pulsante
                              per eliminarla. Prima qui c'era solo testo, e una vendita
                              sbagliata restava sbagliata per sempre. */}
                          <Link href={`/libro/${l.id}`} className="hover:underline">
                            {l.titolo}
                          </Link>
                          {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_vendita)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.margine)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{PERCENTO(l.roi)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-3">{l.canale_vendita ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-3">{l.data_vendita ?? "—"}</td>
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
