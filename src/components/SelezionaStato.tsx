"use client";

import { useTransition } from "react";

const STATI = ["da leggere", "in lettura", "letto", "abbandonato"] as const;

/**
 * L'unico controllo interattivo del catalogo: cambia lo stato di lettura
 * e invia da solo, senza bisogno di un pulsante "salva" a parte.
 */
export default function SelezionaStato({
  id,
  attuale,
  azione,
}: {
  id: string;
  attuale: string;
  azione: (id: string, nuovoStato: string) => Promise<void>;
}) {
  const [inCorso, avvia] = useTransition();

  return (
    <select
      defaultValue={attuale}
      disabled={inCorso}
      onChange={(e) => avvia(() => azione(id, e.target.value))}
      className="rounded-[7px] border border-tratto bg-superficie px-2 py-1 text-[12.5px] outline-none focus:border-bosco disabled:opacity-60"
    >
      {STATI.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
