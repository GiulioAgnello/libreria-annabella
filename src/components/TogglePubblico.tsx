"use client";

import { useTransition } from "react";

/** Interruttore per mostrare o nascondere una copia dalla vetrina pubblica. */
export default function TogglePubblico({
  id,
  attuale,
  azione,
}: {
  id: string;
  attuale: boolean;
  azione: (id: string, pubblico: boolean) => Promise<void>;
}) {
  const [inCorso, avvia] = useTransition();

  return (
    <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12.5px] text-inchiostro-2">
      <input
        type="checkbox"
        defaultChecked={attuale}
        disabled={inCorso}
        onChange={(e) => avvia(() => azione(id, e.target.checked))}
        className="size-4"
      />
      vetrina
    </label>
  );
}
