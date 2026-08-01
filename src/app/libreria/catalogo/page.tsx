import Link from "next/link";
import Image from "next/image";
import Intestazione from "@/components/Intestazione";
import Vuoto from "@/components/Vuoto";
import SelezionaStato from "@/components/SelezionaStato";
import { catalogoLibreria, elenchiCatalogo } from "@/lib/libri";
import { nomeGenere } from "@/lib/generi";
import { segnaStatoLettura } from "@/lib/azioni-libri";

const STATI = ["da leggere", "in lettura", "letto", "abbandonato"] as const;

const EURO = (n: number | null) => (n == null ? "—" : n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }));

const CONTROLLO =
  "rounded-[9px] border border-tratto bg-superficie px-3 py-2 text-[14px] outline-none focus:border-bosco";

export default async function Pagina({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stato?: string; genere?: string; editore?: string; vista?: string }>;
}) {
  const { q, stato, genere, editore, vista } = await searchParams;

  /* I libri filtrati e le voci dei menu si leggono insieme: sono due query
     indipendenti, non c'è ragione di aspettare la prima per lanciare la seconda. */
  const [libri, elenchi] = await Promise.all([
    catalogoLibreria({ ricerca: q, statoLettura: stato, genere, editore }),
    elenchiCatalogo(),
  ]);
  const aCatalogo = vista === "catalogo";

  const paramsBase = new URLSearchParams();
  if (q) paramsBase.set("q", q);
  if (stato) paramsBase.set("stato", stato);
  if (genere) paramsBase.set("genere", genere);
  if (editore) paramsBase.set("editore", editore);
  const paramsLista = new URLSearchParams(paramsBase);
  const paramsGriglia = new URLSearchParams(paramsBase);
  paramsGriglia.set("vista", "catalogo");

  const filtriAttivi = Boolean(q || stato || genere || editore);

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
            className={`min-w-[180px] flex-1 ${CONTROLLO}`}
          />
          <select name="stato" defaultValue={stato ?? ""} className={CONTROLLO}>
            <option value="">Tutti gli stati</option>
            {STATI.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* I due menu compaiono solo se c'è qualcosa da scegliere: su una
              libreria appena iniziata sarebbero tende vuote e basta. */}
          {elenchi.generi.length > 0 && (
            <select name="genere" defaultValue={genere ?? ""} className={CONTROLLO}>
              <option value="">Tutti i generi</option>
              {elenchi.generi.map((g) => (
                // Il valore resta l'originale del catalogo: si traduce solo l'etichetta.
                <option key={g} value={g}>
                  {nomeGenere(g)}
                </option>
              ))}
            </select>
          )}

          {elenchi.editori.length > 0 && (
            <select name="editore" defaultValue={editore ?? ""} className={CONTROLLO}>
              <option value="">Tutti gli editori</option>
              {elenchi.editori.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            className="rounded-[9px] bg-bosco px-4 py-2 text-[14px] font-medium text-white transition hover:bg-bosco-scuro"
          >
            Filtra
          </button>

          {filtriAttivi && (
            <Link
              href={vista ? `?vista=${vista}` : "?"}
              className="rounded-[9px] border border-tratto px-4 py-2 text-[14px] text-inchiostro-2 transition hover:border-inchiostro-3"
            >
              Azzera
            </Link>
          )}
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
          testo={filtriAttivi ? "Prova a togliere qualche filtro." : "Aggiungi il tuo primo libro dallo scanner."}
        />
      ) : aCatalogo ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {libri.map((l) => (
            <div key={l.id} className="tessera flex flex-col overflow-hidden">
              <Link href={`/libro/${l.id}`} className="flex flex-1 flex-col">
                <div className="relative flex aspect-[2/3] items-center justify-center bg-glicine-tenue">
                  {l.copertina_url ? (
                    <Image
                      src={l.copertina_url}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-mincho text-[13px] text-glicine-fondo">senza copertina</span>
                  )}
                </div>
                <div className="px-3 pt-3">
                  <div className="line-clamp-2 text-[13.5px] leading-snug hover:underline">{l.titolo}</div>
                  {l.autori[0] && <div className="text-[12px] text-inchiostro-3">{l.autori[0]}</div>}
                </div>
              </Link>
              <div className="mt-auto flex items-center justify-between gap-2 px-3 pb-3 pt-2">
                <span className="text-[12px] text-inchiostro-3">{EURO(l.risparmio)}</span>
                <SelezionaStato id={l.id} attuale={l.stato_lettura} azione={segnaStatoLettura} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tessera overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13.5px]">
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
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <Link href={`/libro/${l.id}`} className="hover:underline">
                        {l.titolo}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{l.autori.join(", ") || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.prezzo_pagato)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-inchiostro-2">{EURO(l.risparmio)}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <SelezionaStato id={l.id} attuale={l.stato_lettura} azione={segnaStatoLettura} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
