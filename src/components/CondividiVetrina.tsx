"use client";

import { useState } from "react";
import Icona from "@/components/Icona";

/** Apri la pagina pubblica o copiane il link, da mandare ai clienti. */
export default function CondividiVetrina() {
  const [copiato, setCopiato] = useState(false);

  async function copia() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/vetrina`);
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2000);
    } catch {
      window.prompt("Copia questo link:", `${window.location.origin}/vetrina`);
    }
  }

  const BOTTONE =
    "inline-flex items-center gap-2 rounded-[9px] border border-tratto bg-superficie px-3.5 py-2 text-[13px] text-inchiostro-2 transition hover:border-inchiostro-3";

  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <a href="/vetrina" target="_blank" rel="noopener" className={BOTTONE}>
        <Icona nome="globo" className="size-3.5" />
        Apri la pagina pubblica
      </a>
      <button type="button" onClick={copia} className={BOTTONE}>
        <Icona nome="scontrino" className="size-3.5" />
        {copiato ? "Link copiato!" : "Copia il link per i clienti"}
      </button>
    </div>
  );
}
