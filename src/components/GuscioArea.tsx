import Link from "next/link";
import { AREE, type Area } from "@/lib/aree";
import Icona from "@/components/Icona";
import Sfondo from "@/components/Sfondo";
import VoceNav from "@/components/VoceNav";

/** Barra laterale su computer, barra in basso su telefono. Il colore cambia con l'area. */
export default function GuscioArea({ area, children }: { area: Area; children: React.ReactNode }) {
  const dati = AREE[area];
  const altra: Area = area === "libreria" ? "vendita" : "libreria";
  // Una velatura di colore appena percettibile: distingue le due aree
  // senza coprire la scena sumi-e che sta dietro.
  const velo = area === "libreria" ? "rgb(63 94 78 / 0.05)" : "rgb(139 92 168 / 0.05)";
  const tintaLato = area === "libreria" ? "rgb(237 240 231 / 0.72)" : "rgb(242 235 243 / 0.72)";

  const voci = [
    ...dati.voci,
    { href: "/aggiungi", etichetta: area === "libreria" ? "Aggiungi libro" : "Nuovo acquisto", icona: "piu" },
    { href: "/impostazioni", etichetta: "Impostazioni", icona: "ingranaggio" },
  ];

  return (
    <div data-area={area} className="flex min-h-dvh">
      <Sfondo />

      <aside
        className="sticky top-0 hidden h-dvh w-[236px] shrink-0 flex-col gap-5 border-r border-tratto p-3.5 md:flex"
        style={{ backgroundColor: tintaLato }}
      >
        <Link href="/" className="rounded-md px-2 py-1 text-[12.5px] text-inchiostro-3 hover:bg-black/5">
          ← Ingresso
        </Link>

        <div className="px-2">
          <div className="font-mincho text-[17.5px] font-semibold leading-tight">{dati.nome}</div>
          <div className="mt-1.5 text-[11px] uppercase tracking-[0.14em]" style={{ color: dati.colore }}>
            {dati.sottotitolo}
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {voci.map((v) => (
            <VoceNav
              key={v.href}
              href={v.href}
              colore={dati.colore}
              className="flex items-center gap-3 rounded-[7px] px-3 py-2.5 text-[14.5px] font-medium text-inchiostro-2 transition hover:bg-black/5 hover:text-inchiostro"
            >
              <Icona nome={v.icona} />
              {v.etichetta}
            </VoceNav>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5">
          <div className="px-2.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-inchiostro-3">
            Passa a
          </div>
          <Link
            href={`/${altra}`}
            className="flex items-center gap-2.5 rounded-[7px] border border-tratto bg-superficie px-3 py-2.5 text-[13.5px] text-inchiostro-2 transition hover:border-inchiostro-3"
          >
            <span className="size-2 shrink-0 rounded-full" style={{ background: AREE[altra].colore }} />
            {AREE[altra].nome}
          </Link>
        </div>
      </aside>

      <main
        className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-9 md:pb-16 md:pt-7"
        style={{ backgroundColor: velo }}
      >
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-tratto bg-carta/95 px-1 pb-2 pt-1.5 backdrop-blur md:hidden">
        {[...dati.voci, { href: "/aggiungi", etichetta: "Aggiungi", icona: "piu" }].map((v) => (
          <VoceNav
            key={v.href}
            href={v.href}
            colore={dati.colore}
            styleAttivo="testo"
            className="flex flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium text-inchiostro-3"
          >
            <Icona nome={v.icona} className="size-5" />
            {v.etichetta.split(" ")[0]}
          </VoceNav>
        ))}
      </nav>
    </div>
  );
}
