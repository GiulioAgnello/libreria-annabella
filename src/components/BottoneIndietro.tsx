import Link from "next/link";
import Icona from "@/components/Icona";

/**
 * Un link "torna indietro" che si vede: freccia sempre, testo quando c'è spazio.
 * Sostituisce i vecchi link di solo testo (illeggibili sopra lo sfondo).
 */
export default function BottoneIndietro({
  href,
  testo,
  className = "",
}: {
  href: string;
  testo: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-[9px] border border-tratto bg-superficie px-3 py-1.5 text-[12.5px] font-medium text-inchiostro-2 transition hover:border-inchiostro-3 hover:text-inchiostro ${className}`}
    >
      <Icona nome="sinistra" className="size-3.5 shrink-0" />
      <span className="hidden sm:inline">{testo}</span>
    </Link>
  );
}
