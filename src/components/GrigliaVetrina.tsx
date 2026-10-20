import Image from "next/image";
import Link from "next/link";
import type { CopiaVetrina } from "@/lib/vetrina";

const EURO = (n: number | null) => (n == null ? "" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));

/**
 * La griglia della vetrina. Con `modificabile` (anteprima dentro la
 * compravendita) ogni copia apre la sua scheda; nella pagina pubblica no.
 */
export default function GrigliaVetrina({ copie, modificabile = false }: { copie: CopiaVetrina[]; modificabile?: boolean }) {
  if (copie.length === 0) {
    return (
      <p className="tessera px-6 py-12 text-center text-[14px] text-inchiostro-2">
        Non c&apos;è ancora nessuna copia in vetrina.
        {modificabile && (
          <span className="mt-1 block text-[12.5px] text-inchiostro-3">
            Per metterne una, apri una copia del magazzino e attiva &quot;Mostra nella vetrina pubblica&quot;.
          </span>
        )}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {copie.map((c) => {
        const scheda = (
          <>
            <div className="relative flex aspect-[2/3] items-center justify-center bg-glicine-tenue">
              {c.copertina_url ? (
                <Image
                  src={c.copertina_url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span className="font-mincho text-[13px] text-glicine-fondo">senza copertina</span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 px-3 py-3">
              <div className="line-clamp-2 text-[13.5px] leading-snug">{c.titolo}</div>
              {c.autori[0] && <div className="text-[12px] text-inchiostro-3">{c.autori[0]}</div>}
              <div className="mt-auto flex items-center justify-between pt-2">
                {c.condizione && (
                  <span className="text-[10.5px] uppercase tracking-[0.06em] text-inchiostro-3">{c.condizione}</span>
                )}
                <span className="numero text-[15px]" style={{ color: "#8b5ca8" }}>
                  {EURO(c.prezzo_richiesto)}
                </span>
              </div>
            </div>
          </>
        );

        return modificabile ? (
          <Link
            key={c.id}
            href={`/libro/${c.id}`}
            className="tessera flex flex-col overflow-hidden transition hover:-translate-y-[2px] hover:border-inchiostro-3"
          >
            {scheda}
          </Link>
        ) : (
          <div key={c.id} className="tessera flex flex-col overflow-hidden">
            {scheda}
          </div>
        );
      })}
    </div>
  );
}
