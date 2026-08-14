/**
 * Imposta (o cambia) la password di un utente, senza inviare nessuna email.
 *
 * Perché serve: l'account di Annabella finora esisteva solo per il magic link,
 * quindi non ha una password. Il pannello Supabase, per un utente già esistente,
 * offre solo il "Reset password" — che manda un'email. Questo script fa la stessa
 * cosa dal di dentro, con la chiave di servizio, così non parte niente e soprattutto
 * NON si ricrea l'utente (ricrearlo cambierebbe il suo id e lascerebbe orfani tutti
 * i libri, che nel database sono legati proprio a quell'id).
 *
 * USO, dalla cartella `app`:
 *   node scripts/imposta-password.mjs "LaPasswordCheScegli"
 *   node scripts/imposta-password.mjs "LaPasswordCheScegli" email@diannabella.it
 *
 * Il secondo argomento (l'email) serve solo se sul progetto c'è più di un utente.
 * Con un utente solo viene preso da sé.
 *
 * Legge le credenziali da .env.local — le stesse che già usi per l'accesso locale:
 *   NEXT_PUBLIC_SUPABASE_URL  e  SUPABASE_SERVICE_ROLE_KEY  (la chiave `service_role`).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const qui = dirname(fileURLToPath(import.meta.url));

/** Un parser minimo di .env.local: righe `CHIAVE=valore`, salta commenti e vuote. */
function leggiEnv(percorso) {
  const env = {};
  let testo;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch {
    return env;
  }
  for (const riga of testo.split(/\r?\n/)) {
    const pulita = riga.trim();
    if (!pulita || pulita.startsWith("#")) continue;
    const uguale = pulita.indexOf("=");
    if (uguale === -1) continue;
    const chiave = pulita.slice(0, uguale).trim();
    let valore = pulita.slice(uguale + 1).trim();
    if (
      (valore.startsWith('"') && valore.endsWith('"')) ||
      (valore.startsWith("'") && valore.endsWith("'"))
    ) {
      valore = valore.slice(1, -1);
    }
    env[chiave] = valore;
  }
  return env;
}

const env = leggiEnv(resolve(qui, "..", ".env.local"));
const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const CHIAVE_SERVIZIO = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

const password = process.argv[2];
const emailScelta = process.argv[3];

function esci(messaggio) {
  console.error("\n✗ " + messaggio + "\n");
  process.exit(1);
}

if (!URL_SUPABASE || !CHIAVE_SERVIZIO) {
  esci(
    "Mancano NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY in .env.local.\n" +
      "  La chiave giusta è la `service_role` (Project Settings → API), non la pubblica.",
  );
}
if (!password) {
  esci('Manca la password. Esempio:  node scripts/imposta-password.mjs "LaMiaPassword"');
}
if (password.length < 6) {
  esci("La password deve avere almeno 6 caratteri (è il minimo di Supabase).");
}

const supabase = createClient(URL_SUPABASE, CHIAVE_SERVIZIO, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
if (error) esci("Non riesco a leggere gli utenti: " + error.message);

const utenti = data?.users ?? [];
if (utenti.length === 0) esci("Il progetto Supabase non ha nessun utente da aggiornare.");

let utente;
if (emailScelta) {
  utente = utenti.find((u) => (u.email ?? "").toLowerCase() === emailScelta.toLowerCase());
  if (!utente) esci(`Nessun utente con l'email ${emailScelta}. Utenti presenti: ` +
    utenti.map((u) => u.email).join(", "));
} else if (utenti.length === 1) {
  utente = utenti[0];
} else {
  esci(
    "Ci sono più utenti: passa l'email come secondo argomento.\n" +
      "  Utenti presenti: " + utenti.map((u) => u.email).join(", "),
  );
}

const { error: erroreAggiorna } = await supabase.auth.admin.updateUserById(utente.id, {
  password,
  email_confirm: true, // così l'accesso con password funziona anche se il progetto richiede la conferma
});
if (erroreAggiorna) esci("Non riesco a impostare la password: " + erroreAggiorna.message);

console.log(`\n✓ Password impostata per ${utente.email}. Ora può entrare con email e password.\n`);
