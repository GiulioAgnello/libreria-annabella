import Link from "next/link";
import Image from "next/image";
import Icona from "@/components/Icona";
import AvanzamentoLettura from "@/components/AvanzamentoLettura";

type Dati = {
  id: string;
  titolo: string;
  autori: string[];
  copertina_url: string | null;
  pagine?: number | null;
  pagina_attuale?: number | null;
};

/**
 * Mini scheda di un libro per il cruscotto: copertina, titolo, autore e — per i
 * libri in lettura — a che punto è arrivata.
 *
 * Per i libri in lettura c'è anche l'avanzamento, con "Aggiorna" per segnare
 * la pagina senza aprire la scheda (vedi `AvanzamentoLettura`). Per questo la
 * scheda non è più un link unico: lo sono la copertina e il titolo.
 */
export default function SchedinaLibro({
  libro,
  avanzamento = false,
  etichetta,
  colore = "#3f5e4e",
  className = "",
}: {
  libro: Dati;
  avanzamento?: boolean;
  etichetta?: string;
  colore?: string;
  className?: string;
}) {
  return (
    <div
      className={`tessera flex gap-3.5 px-3.5 py-3.5 transition hover:-translate-y-[2px] hover:border-inchiostro-3 ${className}`}
    >
      <Link
        href={`/libro/${libro.id}`}
        tabIndex={-1}
        aria-hidden
        className="h-[84px] w-[56px] shrink-0 overflow-hidden rounded-[5px] border border-tratto bg-glicine-tenue shadow-[0_2px_6px_rgba(28,25,23,0.12)]"
      >
        {libro.copertina_url ? (
          <Image
            src={libro.copertina_url}
            alt=""
            width={56}
            height={84}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-inchiostro-3/60">
            <Icona nome="libro" className="size-5" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        {etichetta && (
          <span className="mb-0.5 text-[11px] uppercase tracking-[0.08em]" style={{ color: colore }}>
            {etichetta}
          </span>
        )}
        <Link href={`/libro/${libro.id}`} className="group flex min-w-0 flex-col">
          <span className="line-clamp-2 text-[14.5px] leading-snug group-hover:underline">{libro.titolo}</span>
          {libro.autori[0] && (
            <span className="mt-0.5 truncate text-[12.5px] text-inchiostro-3">{libro.autori[0]}</span>
          )}
        </Link>

        {avanzamento && (
          <div className="mt-auto">
            <AvanzamentoLettura
              id={libro.id}
              pagina={libro.pagina_attuale ?? null}
              pagine={libro.pagine ?? null}
              colore={colore}
            />
          </div>
        )}
      </div>
    </div>
  );
}
