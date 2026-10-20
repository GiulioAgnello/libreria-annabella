import Link from "next/link";
import Image from "next/image";
import Icona from "@/components/Icona";

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
 * libri in lettura — a che punto è arrivata. Tutta la scheda è un link alla
 * pagina del libro.
 *
 * L'avanzamento compare solo se si conoscono sia le pagine totali sia la pagina
 * attuale; altrimenti un invito discreto a segnarla, che porta proprio lì.
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
  const { pagine, pagina_attuale: pagina } = libro;
  const percento =
    pagine && pagina ? Math.min(100, Math.max(0, Math.round((pagina / pagine) * 100))) : null;

  return (
    <Link
      href={`/libro/${libro.id}`}
      className={`tessera group flex gap-3.5 px-3.5 py-3.5 transition hover:-translate-y-[2px] hover:border-inchiostro-3 ${className}`}
    >
      <div className="h-[84px] w-[56px] shrink-0 overflow-hidden rounded-[5px] border border-tratto bg-glicine-tenue shadow-[0_2px_6px_rgba(28,25,23,0.12)]">
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
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {etichetta && (
          <span className="mb-0.5 text-[11px] uppercase tracking-[0.08em]" style={{ color: colore }}>
            {etichetta}
          </span>
        )}
        <span className="line-clamp-2 text-[14.5px] leading-snug group-hover:underline">{libro.titolo}</span>
        {libro.autori[0] && <span className="mt-0.5 truncate text-[12.5px] text-inchiostro-3">{libro.autori[0]}</span>}

        {avanzamento && (
          <div className="mt-auto pt-2">
            {percento !== null ? (
              <>
                <div className="h-[5px] overflow-hidden rounded-full bg-tratto/60">
                  <div className="h-full rounded-full" style={{ width: `${percento}%`, background: colore }} />
                </div>
                <div className="mt-1 flex justify-between text-[11.5px] text-inchiostro-3">
                  <span>
                    pag. {pagina} di {pagine}
                  </span>
                  <span className="numero" style={{ color: colore }}>
                    {percento}%
                  </span>
                </div>
              </>
            ) : (
              <span className="text-[11.5px] text-inchiostro-3">Segna a che pagina sei →</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
