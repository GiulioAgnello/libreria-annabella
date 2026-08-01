import { NextResponse } from "next/server";
import { clientServer, utenteCorrente } from "@/lib/supabase/server";

const COLONNE = [
  "area",
  "isbn",
  "titolo",
  "sottotitolo",
  "autori",
  "editore",
  "anno",
  "lingua",
  "pagine",
  "generi",
  "formato",
  "condizione",
  "prezzo_pagato",
  "prezzo_copertina",
  "risparmio",
  "provenienza",
  "canale_acquisto",
  "data_acquisto",
  "stato_lettura",
  "posizione_coda",
  "voto",
  "recensione",
  "stato",
  "prezzo_richiesto",
  "prezzo_vendita",
  "margine",
  "data_vendita",
  "canale_vendita",
  "note",
] as const;

function cellaCsv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const testo = Array.isArray(v) ? v.join("; ") : String(v);
  if (/[",\n;]/.test(testo)) {
    return `"${testo.replace(/"/g, '""')}"`;
  }
  return testo;
}

/** Esporta tutti i libri dell'utente (entrambe le aree) in un CSV: la rete di sicurezza. */
export async function GET() {
  const supabase = await clientServer();
  if (!supabase) {
    return NextResponse.json({ errore: "Database non collegato" }, { status: 503 });
  }

  const utente = await utenteCorrente();
  if (!utente) {
    return NextResponse.json({ errore: "Non sei collegato" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("books")
    .select(COLONNE.join(","))
    .eq("utente", utente.id)
    .order("area", { ascending: true })
    .order("titolo", { ascending: true });

  if (error) {
    return NextResponse.json({ errore: error.message }, { status: 500 });
  }

  const righe = (data ?? []) as unknown as Record<string, unknown>[];
  const testata = COLONNE.join(",");
  const corpo = righe.map((riga) => COLONNE.map((c) => cellaCsv(riga[c])).join(",")).join("\n");
  const csv = "﻿" + testata + "\n" + corpo + "\n";

  const oggi = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="libreria-backup-${oggi}.csv"`,
    },
  });
}
