"use client";

import { useState } from "react";
import { clientBrowser } from "@/lib/supabase/client";

/**
 * Accesso con email e password, più il recupero della password.
 *
 * ACCESSO — `signInWithPassword`: nessuna email, nessun redirect, tutto nella
 * stessa scheda. È quel che risolve il problema del cellulare, dove l'app di posta
 * apriva il magic link in un mini-browser interno che non condivideva i cookie.
 *
 * RECUPERO — a codice, non a link, per la stessa ragione: Annabella riceve un
 * codice di 6 cifre via email, lo digita qui e sceglie la nuova password, sempre
 * senza uscire da questa scheda. Sotto il cofano: `resetPasswordForEmail` manda il
 * codice, `verifyOtp({ type: "recovery" })` apre una sessione, `updateUser` scrive
 * la nuova password.
 *
 * NOTA SUPABASE (una volta sola): perché l'email di recupero contenga il codice e
 * non solo il link, il modello va aggiornato in Authentication → Email Templates →
 * "Reset Password", aggiungendo {{ .Token }} (le 6 cifre).
 */
export default function ModuloAccesso() {
  const [modo, setModo] = useState<"login" | "recupero">("login");

  // accesso
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // recupero
  const [passoRecupero, setPassoRecupero] = useState<"email" | "codice">("email");
  const [codice, setCodice] = useState("");
  const [nuovaPassword, setNuovaPassword] = useState("");

  // comune
  const [stato, setStato] = useState<"fermo" | "invio" | "errore">("fermo");
  const [messaggio, setMessaggio] = useState("");

  function vaiA(nuovoModo: "login" | "recupero") {
    setModo(nuovoModo);
    setPassoRecupero("email");
    setPassword("");
    setCodice("");
    setNuovaPassword("");
    setStato("fermo");
    setMessaggio("");
  }

  /** Accesso normale. */
  async function entra(e: React.FormEvent) {
    e.preventDefault();
    const supabase = clientBrowser();
    if (!supabase) return;

    setStato("invio");
    setMessaggio("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Supabase non distingue tra email inesistente e password sbagliata: un unico
      // messaggio neutro evita di rivelare quali email hanno un account.
      setStato("errore");
      setMessaggio("Email o password non corretti.");
      return;
    }
    window.location.assign("/");
  }

  /** Recupero, passo 1 — chiediamo l'invio del codice. */
  async function chiediCodice(e: React.FormEvent) {
    e.preventDefault();
    const supabase = clientBrowser();
    if (!supabase) return;

    setStato("invio");
    setMessaggio("");
    // Risponde "ok" anche se l'email non ha un account: non si può capire da fuori
    // quali indirizzi esistono. Passiamo comunque al codice.
    await supabase.auth.resetPasswordForEmail(email);
    setStato("fermo");
    setPassoRecupero("codice");
  }

  /** Recupero, passo 2 — verifichiamo il codice e scriviamo la nuova password. */
  async function confermaRecupero(e: React.FormEvent) {
    e.preventDefault();
    const supabase = clientBrowser();
    if (!supabase) return;

    if (nuovaPassword.length < 6) {
      setStato("errore");
      setMessaggio("La nuova password deve avere almeno 6 caratteri.");
      return;
    }

    setStato("invio");
    setMessaggio("");

    // Il codice apre una sessione temporanea…
    const { error: erroreCodice } = await supabase.auth.verifyOtp({
      email,
      token: codice.trim(),
      type: "recovery",
    });
    if (erroreCodice) {
      setStato("errore");
      setMessaggio("Codice errato o scaduto. Controlla l'email o chiedine uno nuovo.");
      return;
    }

    // …e con quella sessione scriviamo la nuova password.
    const { error: erroreAggiorna } = await supabase.auth.updateUser({ password: nuovaPassword });
    if (erroreAggiorna) {
      setStato("errore");
      setMessaggio("Non sono riuscito a salvare la nuova password. Riprova.");
      return;
    }

    // A questo punto è già dentro con la sessione appena creata: la portiamo in casa.
    window.location.assign("/");
  }

  const classeInput =
    "rounded-[9px] border border-tratto bg-superficie px-3 py-2.5 text-[14px] outline-none focus:border-bosco";
  const classeBottone =
    "rounded-[10px] bg-bosco px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-bosco-scuro disabled:opacity-60";
  const classeLink =
    "text-[12.5px] text-inchiostro-3 underline underline-offset-2 hover:text-inchiostro-2";

  // ── Recupero: passo 2 (codice + nuova password) ──────────────────────────────
  if (modo === "recupero" && passoRecupero === "codice") {
    return (
      <form onSubmit={confermaRecupero} className="mt-5 flex flex-col gap-2.5">
        <p className="text-[13px] leading-relaxed text-inchiostro-2">
          Ti ho mandato un codice a <b className="text-inchiostro">{email}</b>. Scrivilo qui e
          scegli la nuova password.
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
          placeholder="Codice a 6 cifre"
          className={`${classeInput} text-center tracking-[0.3em]`}
        />
        <input
          type="password"
          autoComplete="new-password"
          required
          value={nuovaPassword}
          onChange={(e) => setNuovaPassword(e.target.value)}
          placeholder="Nuova password"
          className={classeInput}
        />
        <button type="submit" disabled={stato === "invio"} className={classeBottone}>
          {stato === "invio" ? "Salvataggio in corso…" : "Salva ed entra"}
        </button>
        {stato === "errore" && <p className="text-[12.5px] text-vermiglio">{messaggio}</p>}
        <button type="button" onClick={() => vaiA("login")} className={`mt-1 ${classeLink}`}>
          Torna all&apos;accesso
        </button>
      </form>
    );
  }

  // ── Recupero: passo 1 (email) ────────────────────────────────────────────────
  if (modo === "recupero") {
    return (
      <form onSubmit={chiediCodice} className="mt-5 flex flex-col gap-2.5">
        <p className="text-[13px] leading-relaxed text-inchiostro-2">
          Inserisci la tua email: ti arriverà un codice per scegliere una nuova password.
        </p>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nome@esempio.it"
          className={classeInput}
        />
        <button type="submit" disabled={stato === "invio"} className={classeBottone}>
          {stato === "invio" ? "Invio in corso…" : "Mandami il codice"}
        </button>
        {stato === "errore" && <p className="text-[12.5px] text-vermiglio">{messaggio}</p>}
        <button type="button" onClick={() => vaiA("login")} className={`mt-1 ${classeLink}`}>
          Torna all&apos;accesso
        </button>
      </form>
    );
  }

  // ── Accesso ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={entra} className="mt-5 flex flex-col gap-2.5">
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="nome@esempio.it"
        className={classeInput}
      />
      <input
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className={classeInput}
      />
      <button type="submit" disabled={stato === "invio"} className={classeBottone}>
        {stato === "invio" ? "Accesso in corso…" : "Entra"}
      </button>
      {stato === "errore" && <p className="text-[12.5px] text-vermiglio">{messaggio}</p>}
      <button type="button" onClick={() => vaiA("recupero")} className={`mt-1 ${classeLink}`}>
        Password dimenticata?
      </button>
    </form>
  );
}
