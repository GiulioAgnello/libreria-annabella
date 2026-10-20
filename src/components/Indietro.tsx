"use client";

import { useRouter } from "next/navigation";
import Icona from "@/components/Icona";

/**
 * "Indietro" vero: torna alla pagina da cui si è arrivati — il cruscotto, il
 * catalogo, la coda, il magazzino… — invece che sempre alla stessa lista.
 *
 * Se non c'è una pagina dell'app a cui tornare (link aperto da fuori, scheda
 * nuova, pagina ricaricata dopo un salvataggio) si va su `riserva`, che è
 * l'elenco giusto per l'area del libro.
 */
export default function Indietro({ riserva, testo = "Indietro" }: { riserva: string; testo?: string }) {
  const router = useRouter();

  function vai() {
    const daQui = document.referrer.startsWith(window.location.origin);
    if (daQui && window.history.length > 1) router.back();
    else router.push(riserva);
  }

  return (
    <button
      type="button"
      onClick={vai}
      className="inline-flex items-center gap-1.5 rounded-[9px] border border-tratto bg-superficie px-3 py-1.5 text-[12.5px] font-medium text-inchiostro-2 transition hover:border-inchiostro-3 hover:text-inchiostro"
    >
      <Icona nome="sinistra" className="size-3.5 shrink-0" />
      {testo}
    </button>
  );
}
