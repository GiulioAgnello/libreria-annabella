"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icona from "@/components/Icona";

/**
 * La vetrina è pubblica, quindi non ha la navigazione dell'area privata. Ma
 * Annabella ci arriva anche dal menu della compravendita: in quel caso le serve
 * una via per tornare. Il bottone compare solo se si arriva da una pagina
 * dell'app — un cliente che apre il link condiviso non lo vede.
 */
export default function TornaAreaVendita() {
  const [visibile, setVisibile] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisibile(document.referrer.startsWith(window.location.origin)), 0);
    return () => clearTimeout(t);
  }, []);

  if (!visibile) return null;

  return (
    <Link
      href="/vendita"
      className="mb-4 inline-flex items-center gap-1.5 rounded-[9px] border border-tratto bg-superficie px-3 py-1.5 text-[12.5px] font-medium text-inchiostro-2 transition hover:border-inchiostro-3"
    >
      <Icona nome="sinistra" className="size-3.5 shrink-0" />
      Torna a Compravendita
    </Link>
  );
}
