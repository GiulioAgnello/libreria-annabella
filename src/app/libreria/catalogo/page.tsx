import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import SelezionaStato from "@/components/SelezionaStato";
import { catalogoLibreria } from "@/lib/libri";
import { segnaStatoLettura } from "@/lib/azioni-libri";

const STATI = ["da leggere", "in lettura", "letto", "abbandonato"] as const;

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stato?: string }>;
}) {
  const { q, stato } = await searchParams;
  const libri = await catalogoLibreria({ ricerca: q, statoLettura: stato });

  return (
    <>
      <Intestazione titolo="Catalogo" sottotitolo="Tutti i libri che tieni, con ricerca e filtri." />

      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cerca per titolo…"
          className="min-w-[180px] flex-1 rounded-[9px] border border-tratto bg-superficie px-3 py-2 text-[14px] outline-none focus:border-bosco"
        />
        <select
          name="stato"
          defaultValue={stato ?? ""}
          className="rounded-[9px] border border-tratto bg-superficie px-3 py-2 text-[14px] outline-none focus:border-bosco"
        >
          <option value="">Tutti gli stati</option>
          {STATI.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-[9px] bg-bosco px-4 py-2 text-[14px] font-medium text-white transition hover:bg-bosco-scuro"
        >
          Filtra
        </button>
      </form>

      {libri.length === 0 ? (
        <Vuoto
          titolo="Nessun libro trovato"
          testo={q || stato ? "Prova a togliere qualche filtro." : "Aggiungi il tuo primo libro dallo scanner."}
        />
      ) : (
        <div className="tessera overflow-hidden">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-tratto text-left text-[11.5px] uppercase tracking-[0.06em] text-inchiostro-3">
                <th className="px-4 py-2.5 font-medium">Titolo</th>
                <th className="px-4 py-2.5 font-medium">Autore</th>
                <th className="px-4 py-2.5 font-medium">Pagato</th>
                <th className="px-4 py-2.5 font-medium">Risparmio</th>
                <th className="px-4 py-2.5 font-medium">Stato</th>
              </tr>
            </thead>
            <tbody>
              {libri.map((l) => (
                <tr key={l.id} className="border-b border-tratto last:border-0">
                  <td className="px-4 py-2.5">{l.titolo}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{l.autori.join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                  <td className="px-4 py-2.5 text-inchiostro-2">{EURO(l.risparmio)}</td>
                  <td className="px-4 py-2.5">
                    <SelezionaStato id={l.id} attuale={l.stato_lettura} azione={segnaStatoLettura} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
