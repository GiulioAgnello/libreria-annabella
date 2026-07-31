import { redirect } from "next/navigation";
import Link from "next/link";
import PaginaSemplice from "@/components/PaginaSemplice";
import BottoneElimina from "@/components/BottoneElimina";
import { dettaglioLibro, aggiornaLibro, cancellaLibro } from "@/lib/azioni-libro";

const CAMPO =
  "w-full rounded-[9px] border border-tratto bg-superficie px-3 py-2.5 text-[14px] outline-none focus:border-bosco";
const ETICHETTA = "mb-1 block text-[12.5px] text-inchiostro-2";

export default async function Pagina({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ salvato?: string }>;
}) {
  const { id } = await params;
  const { salvato } = await searchParams;
  const libro = await dettaglioLibro(id);

  if (!libro) redirect("/");

  const areaColore = libro.area === "personale" ? "#3f5e4e" : "#8b5ca8";
  const torna = libro.area === "personale" ? "/libreria/catalogo" : "/vendita/magazzino";
  const salvaLibro = aggiornaLibro.bind(null, id, libro.area);
  const eliminaLibro = cancellaLibro.bind(null, id, libro.area);

  return (
    <PaginaSemplice titolo={libro.titolo} sottotitolo="Modifica le caratteristiche di questa copia.">
      <p className="mb-4 text-[13px] text-inchiostro-3">
        <span style={{ color: areaColore }}>{libro.area === "personale" ? "La mia libreria" : "Compravendita"}</span>{" "}
        — <Link href={torna} className="underline hover:text-inchiostro-2">torna all&apos;elenco</Link>
      </p>

      {salvato && (
        <p className="tessera mb-4 px-4 py-3 text-[13px] text-bosco">Modifiche salvate.</p>
      )}

      <form action={salvaLibro} className="space-y-5">
        <div className="flex gap-4">
          {libro.copertina_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={libro.copertina_url}
              alt=""
              className="h-[132px] w-[88px] shrink-0 rounded-[6px] border border-tratto object-cover"
            />
          )}
          <div className="flex-1 space-y-3">
            <div>
              <label className={ETICHETTA}>Titolo *</label>
              <input required name="titolo" defaultValue={libro.titolo} className={CAMPO} />
            </div>
            <div>
              <label className={ETICHETTA}>Sottotitolo</label>
              <input name="sottotitolo" defaultValue={libro.sottotitolo ?? ""} className={CAMPO} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={ETICHETTA}>Autori (separati da virgola)</label>
            <input name="autori" defaultValue={libro.autori.join(", ")} className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Editore</label>
            <input name="editore" defaultValue={libro.editore ?? ""} className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Anno</label>
            <input name="anno" defaultValue={libro.anno ?? ""} inputMode="numeric" className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Lingua</label>
            <input name="lingua" defaultValue={libro.lingua ?? ""} className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Pagine</label>
            <input name="pagine" defaultValue={libro.pagine ?? ""} inputMode="numeric" className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Generi (separati da virgola)</label>
            <input name="generi" defaultValue={libro.generi.join(", ")} className={CAMPO} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={ETICHETTA}>Formato</label>
            <select name="formato" defaultValue={libro.formato ?? ""} className={CAMPO}>
              <option value="">—</option>
              <option value="rilegato">Rilegato</option>
              <option value="brossura">Brossura</option>
              <option value="tascabile">Tascabile</option>
              <option value="ebook">Ebook</option>
              <option value="audiolibro">Audiolibro</option>
            </select>
          </div>
          <div>
            <label className={ETICHETTA}>Condizione</label>
            <select name="condizione" defaultValue={libro.condizione ?? ""} className={CAMPO}>
              <option value="">—</option>
              <option value="nuovo">Nuovo</option>
              <option value="come nuovo">Come nuovo</option>
              <option value="buono">Buono</option>
              <option value="discreto">Discreto</option>
              <option value="danneggiato">Danneggiato</option>
            </select>
          </div>
          <div>
            <label className={ETICHETTA}>Provenienza</label>
            <select name="provenienza" defaultValue={libro.provenienza} className={CAMPO}>
              <option value="acquisto">Acquisto</option>
              <option value="biblioteca">Biblioteca</option>
              <option value="audible">Audible</option>
              <option value="regalo">Regalo</option>
            </select>
          </div>
          <div>
            <label className={ETICHETTA}>Canale d&apos;acquisto</label>
            <input name="canale_acquisto" defaultValue={libro.canale_acquisto ?? ""} className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Prezzo pagato (€)</label>
            <input name="prezzo_pagato" defaultValue={libro.prezzo_pagato ?? ""} inputMode="decimal" className={CAMPO} />
          </div>
          <div>
            <label className={ETICHETTA}>Prezzo di copertina (€)</label>
            <input
              name="prezzo_copertina"
              defaultValue={libro.prezzo_copertina ?? ""}
              inputMode="decimal"
              className={CAMPO}
            />
          </div>
          <div>
            <label className={ETICHETTA}>Data d&apos;acquisto</label>
            <input type="date" name="data_acquisto" defaultValue={libro.data_acquisto ?? ""} className={CAMPO} />
          </div>
        </div>

        {libro.area === "personale" ? (
          <div className="tessera space-y-3 px-4 py-4">
            <h3 className="text-[14.5px] text-inchiostro-2">Lettura</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={ETICHETTA}>Stato</label>
                <select name="stato_lettura" defaultValue={libro.stato_lettura} className={CAMPO}>
                  <option value="da leggere">Da leggere</option>
                  <option value="in lettura">In lettura</option>
                  <option value="letto">Letto</option>
                  <option value="abbandonato">Abbandonato</option>
                </select>
              </div>
              <div>
                <label className={ETICHETTA}>Voto (1-5)</label>
                <input
                  name="voto"
                  defaultValue={libro.voto ?? ""}
                  inputMode="numeric"
                  min={1}
                  max={5}
                  type="number"
                  className={CAMPO}
                />
              </div>
              <div>
                <label className={ETICHETTA}>Iniziato il</label>
                <input type="date" name="data_inizio" defaultValue={libro.data_inizio ?? ""} className={CAMPO} />
              </div>
              <div>
                <label className={ETICHETTA}>Finito il</label>
                <input type="date" name="data_fine" defaultValue={libro.data_fine ?? ""} className={CAMPO} />
              </div>
              <div>
                <label className={ETICHETTA}>Pagina attuale</label>
                <input
                  name="pagina_attuale"
                  defaultValue={libro.pagina_attuale ?? ""}
                  inputMode="numeric"
                  className={CAMPO}
                />
              </div>
            </div>
            <div>
              <label className={ETICHETTA}>Recensione</label>
              <textarea name="recensione" defaultValue={libro.recensione ?? ""} rows={3} className={CAMPO} />
            </div>
          </div>
        ) : (
          <div className="tessera space-y-3 px-4 py-4">
            <h3 className="text-[14.5px] text-inchiostro-2">Compravendita</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={ETICHETTA}>Stato</label>
                <select name="stato" defaultValue={libro.stato} className={CAMPO}>
                  <option value="in magazzino">In magazzino</option>
                  <option value="venduta">Venduta</option>
                  <option value="prenotata">Prenotata</option>
                </select>
              </div>
              <div>
                <label className={ETICHETTA}>Prezzo richiesto (€)</label>
                <input
                  name="prezzo_richiesto"
                  defaultValue={libro.prezzo_richiesto ?? ""}
                  inputMode="decimal"
                  className={CAMPO}
                />
              </div>
              <div>
                <label className={ETICHETTA}>Prezzo di vendita (€)</label>
                <input
                  name="prezzo_vendita"
                  defaultValue={libro.prezzo_vendita ?? ""}
                  inputMode="decimal"
                  className={CAMPO}
                />
              </div>
              <div>
                <label className={ETICHETTA}>Data di vendita</label>
                <input type="date" name="data_vendita" defaultValue={libro.data_vendita ?? ""} className={CAMPO} />
              </div>
              <div>
                <label className={ETICHETTA}>Canale di vendita</label>
                <input name="canale_vendita" defaultValue={libro.canale_vendita ?? ""} className={CAMPO} />
              </div>
              <div>
                <label className={ETICHETTA}>Spese (€)</label>
                <input name="spese" defaultValue={libro.spese ?? 0} inputMode="decimal" className={CAMPO} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-[13.5px] text-inchiostro-2">
              <input type="checkbox" name="pubblico" defaultChecked={libro.pubblico} className="size-4" />
              Mostra nella vetrina pubblica
            </label>
          </div>
        )}

        <div>
          <label className={ETICHETTA}>Note</label>
          <textarea name="note" defaultValue={libro.note ?? ""} rows={3} className={CAMPO} />
        </div>

        <button
          type="submit"
          className="w-full rounded-[9px] py-3 text-[14.5px] font-medium text-white transition sm:w-auto sm:px-6"
          style={{ background: areaColore }}
        >
          Salva modifiche
        </button>
      </form>

      <div className="mt-8 border-t border-tratto pt-5">
        <form action={eliminaLibro}>
          <BottoneElimina titolo={libro.titolo} />
        </form>
      </div>
    </PaginaSemplice>
  );
}
