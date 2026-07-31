import Link from "next/link";
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
  searchParams: Promise<{ q?: string; stato?: string; vista?: string }>;
}) {
  const { q, stato, vista } = await searchParams;
  const libri = await catalogoLibreria({ ricerca: q, statoLettura: stato });
  const aCatalogo = vista === "catalogo";

  const paramsBase = new URLSearchParams();
  if (q) paramsBase.set("q", q);
  if (stato) paramsBase.set("stato", stato);
  const paramsLista = new URLSearchParams(paramsBase);
  const paramsGriglia = new URLSearchParams(paramsBase);
  paramsGriglia.set("vista", "catalogo");

  return (
    <>
      <Intestazione titolo="Catalogo" sottotitolo="Tutti i libri che tieni, con ricerca e filtri." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <form className="flex flex-wrap gap-2" method="get">
          <input type="hidden" name="vista" value={vista ?? ""} />
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

        <div className="flex gap-1.5 rounded-[9px] border border-tratto bg-superficie p-1 text-[13px]">
          <Link
            href={`?${paramsLista.toString()}`}
            className={`rounded-[6px] px-3 py-1.5 transition ${!aCatalogo ? "bg-bosco text-white" : "text-inchiostro-2"}`}
          >
            Lista
          </Link>
          <Link
            href={`?${paramsGriglia.toString()}`}
            className={`rounded-[6px] px-3 py-1.5 transition ${aCatalogo ? "bg-bosco text-white" : "text-inchiostro-2"}`}
          >
            Catalogo
          </Link>
        </div>
      </div>

      {libri.length === 0 ? (
        <Vuoto
          titolo="Nessun libro trovato"
          testo={q || stato ? "Prova a togliere qualche filtro." : "Aggiungi il tuo primo libro dallo scanner."}
        />
      ) : aCatalogo ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {libri.map((l) => (
            <div key={l.id} className="tessera flex flex-col overflow-hidden">
              <div className="flex aspect-[2/3] items-center justify-center bg-glicine-tenue">
                {l.copertina_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.copertina_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-mincho text-[13px] text-glicine-fondo">senza copertina</span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1.5 px-3 py-3">
                <div className="line-clamp-2 text-[13.5px] leading-snug">{l.titolo}</div>
                {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="text-[12px] text-inchiostro-3">{EURO(l.risparmio)}</span>
                  <SelezionaStato id={l.id} attuale={l.stato_lettura} azione={segnaStatoLettura} />
                </div>
              </div>
            </div>
          ))}
        </div>
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
