"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Vuoto from "@/components/Vuoto";
import Copertina from "@/components/Copertina";
import TogglePubblico from "@/components/TogglePubblico";
import EtichettaStato from "@/components/EtichettaStato";
import BarraFiltri, { CONTROLLO, SceltaVista } from "@/components/BarraFiltri";
import {
  FILTRI_MAGAZZINO_VUOTI,
  ORDINI_MAGAZZINO,
  filtraMagazzino,
  menuMagazzino,
  qualcosaDiScelto,
} from "@/lib/ordinamenti";
import type { RigaMagazzino } from "@/lib/vendita";
import { segnaVenduta, segnaPubblico } from "@/lib/azioni-vendita";

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));
const VIOLA = "#8b5ca8";

export default function ElencoMagazzino({ righe }: { righe: RigaMagazzino[] }) {
  const [filtri, setFiltri] = useState(FILTRI_MAGAZZINO_VUOTI);
  const [aCatalogo, setACatalogo] = useState(false);

  /*
   * La ricerca passa da `useDeferredValue`: quello che si scrive compare subito
   * nella casella, mentre il ricalcolo dell'elenco può restare un attimo
   * indietro se la lista è lunga. È il modo di React di tenere la scrittura
   * fluida — e fa il lavoro che altrove si chiederebbe a un ritardo a tempo,
   * ma senza far aspettare nessuno quando la lista è corta.
   */
  const ricercaPigra = useDeferredValue(filtri.ricerca);

  const menu = useMemo(() => menuMagazzino(righe), [righe]);
  const visibili = useMemo(
    () => filtraMagazzino(righe, { ...filtri, ricerca: ricercaPigra }),
    [righe, filtri, ricercaPigra],
  );

  const attivi = qualcosaDiScelto(filtri, FILTRI_MAGAZZINO_VUOTI);
  const prenotateVisibili = visibili.filter((l) => l.stato === "prenotata").length;

  const cambia = (campo: keyof typeof filtri) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFiltri((f) => ({ ...f, [campo]: e.target.value }));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <BarraFiltri attivi={attivi} azzera={() => setFiltri(FILTRI_MAGAZZINO_VUOTI)}>
          <input
            type="search"
            value={filtri.ricerca}
            onChange={cambia("ricerca")}
            placeholder="Cerca titolo o autore…"
            className={`min-w-[180px] flex-1 ${CONTROLLO}`}
          />

          <select value={filtri.ordina} onChange={cambia("ordina")} className={CONTROLLO}>
            {Object.entries(ORDINI_MAGAZZINO).map(([chiave, etichetta]) => (
              <option key={chiave} value={chiave}>
                {etichetta}
              </option>
            ))}
          </select>

          {/* Ogni menu compare solo se ha davvero qualcosa da offrire. */}
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

          {menu.condizioni.length > 0 && (
            <select value={filtri.condizione} onChange={cambia("condizione")} className={CONTROLLO}>
              <option value="">Ogni condizione</option>
              {menu.condizioni.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {menu.prenotate > 0 && (
            <select value={filtri.stato} onChange={cambia("stato")} className={CONTROLLO}>
              <option value="">Libere e prenotate</option>
              <option value="in magazzino">Solo libere</option>
              <option value="prenotata">Solo prenotate</option>
            </select>
          )}
        </BarraFiltri>

        <SceltaVista aCatalogo={aCatalogo} cambia={setACatalogo} colore={VIOLA} />
      </div>

      {righe.length > 0 && (
        <p className="mb-3 text-[12.5px] text-inchiostro-3">
          {visibili.length === 1 ? "1 copia" : `${visibili.length} copie`}
          {attivi && ` su ${righe.length}`}
          {prenotateVisibili > 0 && `, di cui ${prenotateVisibili} prenotate`}
        </p>
      )}

      {visibili.length === 0 ? (
        <Vuoto
          titolo={attivi ? "Nessuna copia trovata" : "Magazzino vuoto"}
          testo={
            attivi
              ? "Prova a togliere qualche filtro."
              : "Ogni copia comprata per rivendere finirà qui, con costo, prezzo richiesto e giorni di giacenza."
          }
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
                  <EtichettaStato stato={l.stato} />
                </div>
              </Link>
              <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
                <div className="flex items-center justify-between text-[12px] text-inchiostro-2">
                  <span>{EURO(l.prezzo_richiesto)}</span>
                  <span>{l.giorniGiacenza != null ? `${l.giorniGiacenza} gg` : "—"}</span>
                </div>
                <TogglePubblico id={l.id} attuale={l.pubblico} azione={segnaPubblico} />
                <ModuloVendita id={l.id} prezzo={l.prezzo_richiesto} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tessera overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-[13.5px]">
              <thead>
                <tr className="border-b border-tratto text-left text-[11.5px] uppercase tracking-[0.06em] text-inchiostro-3">
                  <th className="px-4 py-2.5 font-medium">Titolo</th>
                  <th className="px-4 py-2.5 font-medium">Editore</th>
                  <th className="px-4 py-2.5 font-medium">Costo</th>
                  <th className="px-4 py-2.5 font-medium">Richiesto</th>
                  <th className="px-4 py-2.5 font-medium">Margine atteso</th>
                  <th className="px-4 py-2.5 font-medium">Giacenza</th>
                  <th className="px-4 py-2.5 font-medium">Vetrina</th>
                  <th className="px-4 py-2.5 font-medium">Vendita</th>
                </tr>
              </thead>
              <tbody>
                {visibili.map((l) => (
                  <tr key={l.id} className="border-b border-tratto last:border-0">
                    <td className="whitespace-nowrap px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <Copertina url={l.copertina_url} />
                        <div>
                          <Link href={`/libro/${l.id}`} className="hover:underline">
                            {l.titolo}
                          </Link>
                          <EtichettaStato stato={l.stato} />
                          {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-3">{l.editore ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_richiesto)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.margineAtteso)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">
                      {l.giorniGiacenza != null ? `${l.giorniGiacenza} gg` : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <TogglePubblico id={l.id} attuale={l.pubblico} azione={segnaPubblico} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <ModuloVendita id={l.id} prezzo={l.prezzo_richiesto} />
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

/** Prezzo incassato e conferma: l'unica cosa che dal magazzino parla col server. */
function ModuloVendita({ id, prezzo }: { id: string; prezzo: number | null }) {
  return (
    <form action={segnaVenduta.bind(null, id)} className="flex items-center gap-1.5">
      <input
        type="text"
        name="prezzo_vendita"
        placeholder="€"
        required
        inputMode="decimal"
        defaultValue={prezzo ?? ""}
        className="w-16 rounded-[7px] border border-tratto bg-superficie px-2 py-1 text-[12.5px] outline-none focus:border-inchiostro-3"
      />
      <button
        type="submit"
        className="shrink-0 rounded-[7px] px-2.5 py-1 text-[12px] font-medium text-white transition"
        style={{ background: VIOLA }}
      >
        Venduto
      </button>
    </form>
  );
}
