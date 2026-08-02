"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AREE, type Area } from "@/lib/aree";
import { salvaLibro } from "@/lib/azioni-aggiungi";
import ScannerISBN from "@/components/ScannerISBN";

type Dati = {
  isbn: string;
  titolo: string;
  sottotitolo: string;
  autori: string;
  editore: string;
  anno: string;
  lingua: string;
  pagine: string;
  copertinaUrl: string;
  generi: string;
  formato: string;
  condizione: string;
  provenienza: string;
  canaleAcquisto: string;
  prezzoPagato: string;
  prezzoCopertina: string;
  dataAcquisto: string;
  note: string;
  prezzoRichiesto: string;
  pubblico: boolean;
  /* Solo area vendita: capita di registrare una copia che è già stata venduta,
     tipicamente quando si recupera l'arretrato invece di inserire man mano. */
  giaVenduto: boolean;
  prezzoVendita: string;
  dataVendita: string;
  canaleVendita: string;
};

const OGGI = () => new Date().toISOString().slice(0, 10);

const VUOTO: Dati = {
  isbn: "",
  titolo: "",
  sottotitolo: "",
  autori: "",
  editore: "",
  anno: "",
  lingua: "",
  pagine: "",
  copertinaUrl: "",
  generi: "",
  formato: "",
  condizione: "",
  provenienza: "acquisto",
  canaleAcquisto: "",
  prezzoPagato: "",
  prezzoCopertina: "",
  dataAcquisto: OGGI(),
  note: "",
  prezzoRichiesto: "",
  pubblico: false,
  giaVenduto: false,
  prezzoVendita: "",
  dataVendita: "",
  canaleVendita: "",
};

/** Chiave dell'area nell'URL → valore dell'enum nel database. */
const AREA_DB: Record<Area, "personale" | "vendita"> = { libreria: "personale", vendita: "vendita" };

const CAMPO =
  "w-full rounded-[9px] border border-tratto bg-superficie px-3 py-2.5 text-[14px] outline-none focus:border-bosco";
const ETICHETTA = "mb-1 block text-[12.5px] text-inchiostro-2";

export default function ModuloAggiungi() {
  const [area, setArea] = useState<Area | null>(null);
  const [fase, setFase] = useState<"isbn" | "cercando" | "scheda" | "salvato">("isbn");
  const [dati, setDati] = useState<Dati>(VUOTO);
  const [manuale, setManuale] = useState("");
  const [nonTrovato, setNonTrovato] = useState(false);
  const [errore, setErrore] = useState("");
  const [salvando, setSalvando] = useState(false);

  function aggiorna<K extends keyof Dati>(chiave: K, valore: Dati[K]) {
    setDati((d) => ({ ...d, [chiave]: valore }));
  }

  async function cercaIsbn(isbn: string) {
    setFase("cercando");
    setErrore("");
    try {
      const risposta = await fetch(`/api/libro?isbn=${encodeURIComponent(isbn)}`);
      const corpo = await risposta.json();
      setNonTrovato(!corpo.trovato);
      setDati((d) => ({
        ...d,
        isbn,
        titolo: corpo.titolo ?? "",
        sottotitolo: corpo.sottotitolo ?? "",
        autori: (corpo.autori ?? []).join(", "),
        editore: corpo.editore ?? "",
        anno: corpo.anno ? String(corpo.anno) : "",
        lingua: corpo.lingua ?? "",
        pagine: corpo.pagine ? String(corpo.pagine) : "",
        copertinaUrl: corpo.copertinaUrl ?? "",
        generi: (corpo.generi ?? []).join(", "),
      }));
    } catch {
      setNonTrovato(true);
      setDati((d) => ({ ...d, isbn }));
    } finally {
      setFase("scheda");
    }
  }

  function inviaManuale(e: React.FormEvent) {
    e.preventDefault();
    const pulito = manuale.replace(/[^0-9Xx]/g, "");
    if (pulito.length === 10 || pulito.length === 13) cercaIsbn(pulito);
  }

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    if (!area || !dati.titolo.trim()) return;
    setSalvando(true);
    setErrore("");

    const areaDb = AREA_DB[area];

    const payload: Record<string, unknown> = {
      isbn: dati.isbn || null,
      titolo: dati.titolo.trim(),
      sottotitolo: dati.sottotitolo || null,
      autori: elenco(dati.autori),
      editore: dati.editore || null,
      anno: numero(dati.anno),
      lingua: dati.lingua || null,
      pagine: numero(dati.pagine),
      copertina_url: dati.copertinaUrl || null,
      generi: elenco(dati.generi),
      formato: dati.formato || null,
      condizione: dati.condizione || null,
      provenienza: dati.provenienza || "acquisto",
      canale_acquisto: dati.canaleAcquisto || null,
      prezzo_pagato: decimale(dati.prezzoPagato),
      prezzo_copertina: decimale(dati.prezzoCopertina),
      data_acquisto: dati.dataAcquisto || null,
      note: dati.note || null,
    };

    if (areaDb === "vendita") {
      payload.prezzo_richiesto = decimale(dati.prezzoRichiesto);
      payload.pubblico = dati.pubblico;

      if (dati.giaVenduto) {
        // Copia già venduta al momento dell'inserimento: entra direttamente
        // nello storico, senza dover passare dal magazzino per segnarla dopo.
        payload.stato = "venduta";
        payload.prezzo_vendita = decimale(dati.prezzoVendita);
        payload.data_vendita = dati.dataVendita || OGGI();
        payload.canale_vendita = dati.canaleVendita || null;
        // Una copia venduta non ha senso in vetrina: la regola del database la
        // escluderebbe comunque, ma tenere il dato coerente evita sorprese.
        payload.pubblico = false;
      }
    }

    // Chi sei e in che posizione va nella coda li decide il server: qui si manda
    // soltanto quello che c'è nel modulo.
    const esito = await salvaLibro(areaDb, payload);
    setSalvando(false);

    if (!esito.ok) {
      setErrore(esito.messaggio);
      return;
    }
    setFase("salvato");
  }

  function nuovoLibro() {
    setDati(VUOTO);
    setManuale("");
    setNonTrovato(false);
    setErrore("");
    setFase("isbn");
  }

  // ---------- passo 1: scelta dell'area ----------
  if (!area) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(AREE) as Area[]).map((chiave) => (
          <button
            key={chiave}
            type="button"
            onClick={() => setArea(chiave)}
            className="tessera rounded-[10px] px-4 py-7 text-center transition hover:-translate-y-[2px] hover:border-inchiostro-3"
          >
            <span className="text-[18px]" style={{ color: AREE[chiave].colore }}>
              {AREE[chiave].nome}
            </span>
            <p className="mt-1.5 text-[12.5px] text-inchiostro-3">{AREE[chiave].frase}</p>
          </button>
        ))}
      </div>
    );
  }

  const colore = AREE[area].colore;

  // ---------- passo 2: scansione o ISBN a mano ----------
  if (fase === "isbn" || fase === "cercando") {
    return (
      <div>
        <p className="mb-3 text-[13px] text-inchiostro-3">
          Per <span style={{ color: colore }}>{AREE[area].nome}</span> —{" "}
          <button type="button" onClick={() => setArea(null)} className="underline hover:text-inchiostro-2">
            cambia
          </button>
        </p>

        <ScannerISBN onRilevato={cercaIsbn} />

        <form onSubmit={inviaManuale} className="mt-4 flex gap-2">
          <input
            value={manuale}
            onChange={(e) => setManuale(e.target.value)}
            placeholder="…oppure scrivi qui l'ISBN"
            inputMode="numeric"
            className={CAMPO}
          />
          <button
            type="submit"
            disabled={fase === "cercando"}
            className="shrink-0 rounded-[9px] px-4 py-2.5 text-[14px] font-medium text-white transition disabled:opacity-60"
            style={{ background: colore }}
          >
            {fase === "cercando" ? "Cerco…" : "Cerca"}
          </button>
        </form>
      </div>
    );
  }

  // ---------- passo 4: fatto ----------
  if (fase === "salvato") {
    return (
      <div className="tessera px-6 py-10 text-center">
        <h3 className="text-[18px]">Libro salvato</h3>
        <p className="mt-2 text-[14px] text-inchiostro-2">
          &quot;{dati.titolo}&quot; è ora in {AREE[area].nome.toLowerCase()}.
        </p>
        <div className="mt-5 flex justify-center gap-2.5">
          <button
            type="button"
            onClick={nuovoLibro}
            className="rounded-[9px] px-4 py-2.5 text-[14px] font-medium text-white transition"
            style={{ background: colore }}
          >
            Aggiungi un altro
          </button>
          <Link
            href={`/${area}`}
            className="rounded-[9px] border border-tratto px-4 py-2.5 text-[14px] transition hover:border-inchiostro-3"
          >
            Vai a {AREE[area].nome}
          </Link>
        </div>
      </div>
    );
  }

  // ---------- passo 3: la scheda, precompilata e modificabile ----------
  return (
    <form onSubmit={salva} className="space-y-5">
      <p className="text-[13px] text-inchiostro-3">
        Per <span style={{ color: colore }}>{AREE[area].nome}</span> —{" "}
        <button type="button" onClick={nuovoLibro} className="underline hover:text-inchiostro-2">
          ricomincia
        </button>
      </p>

      {nonTrovato && (
        <p className="tessera px-4 py-3 text-[13px] text-inchiostro-2">
          Non ho trovato questo ISBN nei cataloghi online: compila a mano, va bene lo stesso.
        </p>
      )}

      <div className="flex gap-4">
        {dati.copertinaUrl && (
          <Image
            src={dati.copertinaUrl}
            alt=""
            width={88}
            height={132}
            unoptimized
            className="h-[132px] w-[88px] shrink-0 rounded-[6px] border border-tratto object-cover"
          />
        )}
        <div className="flex-1 space-y-3">
          <div>
            <label className={ETICHETTA}>Titolo *</label>
            <input
              required
              value={dati.titolo}
              onChange={(e) => aggiorna("titolo", e.target.value)}
              className={CAMPO}
            />
          </div>
          <div>
            <label className={ETICHETTA}>Sottotitolo</label>
            <input
              value={dati.sottotitolo}
              onChange={(e) => aggiorna("sottotitolo", e.target.value)}
              className={CAMPO}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={ETICHETTA}>Autori (separati da virgola)</label>
          <input value={dati.autori} onChange={(e) => aggiorna("autori", e.target.value)} className={CAMPO} />
        </div>
        <div>
          <label className={ETICHETTA}>Editore</label>
          <input value={dati.editore} onChange={(e) => aggiorna("editore", e.target.value)} className={CAMPO} />
        </div>
        <div>
          <label className={ETICHETTA}>Anno</label>
          <input
            value={dati.anno}
            onChange={(e) => aggiorna("anno", e.target.value)}
            inputMode="numeric"
            className={CAMPO}
          />
        </div>
        <div>
          <label className={ETICHETTA}>Lingua</label>
          <input value={dati.lingua} onChange={(e) => aggiorna("lingua", e.target.value)} className={CAMPO} />
        </div>
        <div>
          <label className={ETICHETTA}>Pagine</label>
          <input
            value={dati.pagine}
            onChange={(e) => aggiorna("pagine", e.target.value)}
            inputMode="numeric"
            className={CAMPO}
          />
        </div>
        <div>
          <label className={ETICHETTA}>Generi (separati da virgola)</label>
          <input value={dati.generi} onChange={(e) => aggiorna("generi", e.target.value)} className={CAMPO} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={ETICHETTA}>Formato</label>
          <select value={dati.formato} onChange={(e) => aggiorna("formato", e.target.value)} className={CAMPO}>
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
          <select
            value={dati.condizione}
            onChange={(e) => aggiorna("condizione", e.target.value)}
            className={CAMPO}
          >
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
          <select
            value={dati.provenienza}
            onChange={(e) => aggiorna("provenienza", e.target.value)}
            className={CAMPO}
          >
            <option value="acquisto">Acquisto</option>
            <option value="biblioteca">Biblioteca</option>
            <option value="audible">Audible</option>
            <option value="regalo">Regalo</option>
          </select>
        </div>
        <div>
          <label className={ETICHETTA}>Canale d&apos;acquisto</label>
          <input
            value={dati.canaleAcquisto}
            onChange={(e) => aggiorna("canaleAcquisto", e.target.value)}
            className={CAMPO}
          />
        </div>
        <div>
          <label className={ETICHETTA}>Prezzo pagato (€)</label>
          <input
            value={dati.prezzoPagato}
            onChange={(e) => aggiorna("prezzoPagato", e.target.value)}
            inputMode="decimal"
            className={CAMPO}
          />
        </div>
        <div>
          <label className={ETICHETTA}>Prezzo di copertina (€)</label>
          <input
            value={dati.prezzoCopertina}
            onChange={(e) => aggiorna("prezzoCopertina", e.target.value)}
            inputMode="decimal"
            className={CAMPO}
          />
        </div>
        <div>
          <label className={ETICHETTA}>Data d&apos;acquisto</label>
          <input
            type="date"
            value={dati.dataAcquisto}
            onChange={(e) => aggiorna("dataAcquisto", e.target.value)}
            className={CAMPO}
          />
        </div>
        {area === "vendita" && (
          <div>
            <label className={ETICHETTA}>Prezzo richiesto (€)</label>
            <input
              value={dati.prezzoRichiesto}
              onChange={(e) => aggiorna("prezzoRichiesto", e.target.value)}
              inputMode="decimal"
              className={CAMPO}
            />
          </div>
        )}
      </div>

      {area === "vendita" && (
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[13.5px] text-inchiostro-2">
            <input
              type="checkbox"
              checked={dati.giaVenduto}
              onChange={(e) => aggiorna("giaVenduto", e.target.checked)}
              className="size-4"
            />
            Questa copia è già stata venduta
          </label>

          {dati.giaVenduto ? (
            <div className="tessera grid gap-3 px-4 py-4 sm:grid-cols-3">
              <div>
                <label className={ETICHETTA}>Prezzo di vendita (€)</label>
                <input
                  value={dati.prezzoVendita}
                  onChange={(e) => aggiorna("prezzoVendita", e.target.value)}
                  inputMode="decimal"
                  className={CAMPO}
                />
              </div>
              <div>
                <label className={ETICHETTA}>Data di vendita</label>
                <input
                  type="date"
                  value={dati.dataVendita}
                  onChange={(e) => aggiorna("dataVendita", e.target.value)}
                  className={CAMPO}
                />
                <p className="mt-1 text-[11.5px] text-inchiostro-3">Se la lasci vuota, metto oggi.</p>
              </div>
              <div>
                <label className={ETICHETTA}>Canale di vendita</label>
                <input
                  value={dati.canaleVendita}
                  onChange={(e) => aggiorna("canaleVendita", e.target.value)}
                  placeholder="Vinted, mercatino…"
                  className={CAMPO}
                />
              </div>
            </div>
          ) : (
            <label className="flex items-center gap-2 text-[13.5px] text-inchiostro-2">
              <input
                type="checkbox"
                checked={dati.pubblico}
                onChange={(e) => aggiorna("pubblico", e.target.checked)}
                className="size-4"
              />
              Mostra nella vetrina pubblica
            </label>
          )}
        </div>
      )}

      <div>
        <label className={ETICHETTA}>Note</label>
        <textarea
          value={dati.note}
          onChange={(e) => aggiorna("note", e.target.value)}
          rows={2}
          className={CAMPO}
        />
      </div>

      {errore && <p className="text-[13px] text-vermiglio">{errore}</p>}

      <button
        type="submit"
        disabled={salvando}
        className="w-full rounded-[9px] py-3 text-[14.5px] font-medium text-white transition disabled:opacity-60 sm:w-auto sm:px-6"
        style={{ background: colore }}
      >
        {salvando ? "Salvo…" : "Salva libro"}
      </button>
    </form>
  );
}

function elenco(testo: string): string[] {
  return testo
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function numero(testo: string): number | null {
  const n = parseInt(testo, 10);
  return Number.isFinite(n) ? n : null;
}

function decimale(testo: string): number | null {
  const n = parseFloat(testo.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
