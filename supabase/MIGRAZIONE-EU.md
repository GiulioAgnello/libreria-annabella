# Trasloco del database da Seul a Francoforte

Il progetto Supabase è stato creato nella regione **Corea**. L'app è usata dall'Italia
e le funzioni girano su Vercel. Ogni lettura fa quindi Italia → server Vercel → Seul
e ritorno: circa 180 ms di viaggio per ogni singola interrogazione, prima ancora che
il database inizi a lavorare.

Supabase non permette di cambiare regione a un progetto esistente. Si crea un progetto
nuovo a Francoforte e si portano i dati. Sono venti minuti scarsi, senza installare
niente: tutto dal pannello e dall'SQL Editor.

**Guadagno atteso:** da ~280 ms a ~30 ms di attesa di rete per pagina.

> Non cancellare il progetto coreano finché non hai verificato che il nuovo funzioni.
> Il piano gratuito consente due progetti attivi: per qualche giorno puoi tenerli
> entrambi in piedi.

---

## 1. Creare il progetto nuovo

Su <https://database.new>, regione **Central EU (Frankfurt) — `eu-central-1`**.
Scegli una password del database e conservala.

## 2. Ricostruire lo schema

SQL Editor → New query → incolla tutto `supabase/schema.sql` → Run.

Crea tabelle, tipi, colonne calcolate, regole di sicurezza e **tutti** gli indici,
compresi i tre aggiunti per la velocità. Su un progetto nuovo `schema.sql` basta da
solo: `migrazione-velocita.sql` serviva solo per aggiornare quello vecchio.

## 3. Rifare la migrazione delle chiavi JWT

**Questo passaggio si dimentica facilmente e costa caro.** Il progetto nuovo nasce con
le vecchie chiavi simmetriche HS256. Finché restano quelle, `getClaims()` non può
verificare i token in locale e ricade sulla chiamata di rete — cioè il problema che
avevamo appena tolto di mezzo.

Project Settings → JWT Keys → scheda **JWT Signing Keys** → migra a **ECC (P-256)**,
esattamente come avevi fatto sul progetto coreano. Verifica che `CURRENT KEY` risulti
`ECC (P-256)` prima di andare avanti.

## 4. Riportare le impostazioni di autenticazione

Authentication → Sign In / Providers:

- **Email**: abilitato.
- **Confirm email**: attivo, come nel vecchio progetto.
- **Allow new users to sign up**: irrilevante per questa app, vedi il passo 5.

Authentication → URL Configuration:

- **Site URL**: l'indirizzo di produzione su Vercel (`https://….vercel.app`).
- **Redirect URLs**: aggiungi sia `https://….vercel.app/**` sia
  `http://localhost:3000/**`.

Senza questi due campi il collegamento che arriva via email rimanda a un indirizzo
sbagliato e l'accesso fallisce senza dire perché.

## 5. Ricreare gli account e l'invio email

### 5a. Rifare le impostazioni SMTP

**Le credenziali SMTP non si trasferiscono col progetto.** Il progetto nuovo riparte
dal servizio email integrato di Supabase, che spedisce solo agli indirizzi membri
dell'organizzazione e con un tetto di 2 messaggi all'ora — quindi a tua moglie non
scriverebbe affatto.

Authentication → Emails → SMTP Settings, e rimetti la configurazione Gmail:

```
Sender email address:  agnellogiulio4@gmail.com
Sender name:           La Libreria di Annabella
Host:                  smtp.gmail.com
Port number:           465
Minimum interval:      60
Username:              agnellogiulio4@gmail.com
Password:              app password Google di 16 caratteri, senza spazi
```

Il `Sender email` deve coincidere con lo `Username`: Gmail rifiuta di spedire per
conto di un mittente diverso da quello autenticato.

L'app password si genera su <https://myaccount.google.com/apppasswords> e richiede la
verifica in due passaggi attiva. **Non cancellare quella vecchia se il progetto
precedente è ancora in uso** — è la stessa che sta usando per spedire.

### 5b. Creare gli account a mano

`ModuloAccesso.tsx` chiama `signInWithOtp` con `shouldCreateUser: false`: l'app non
registra nessuno, di proposito. Su un progetto vuoto questo significa che il primo
accesso **non può funzionare**, e per giunta in silenzio — il componente intercetta
l'errore "signups not allowed for otp" e mostra comunque "Controlla la posta", per
non rivelare quali indirizzi hanno un account. Corretto come scelta, insidioso in
fase di trasloco.

Authentication → **Users** → **Add user** → *Create new user*, per ciascun account:
email, una password qualsiasi (non verrà mai usata), spunta **Auto Confirm User**.

Poi fai un accesso di prova. Serve anche a sapere l'identificativo dell'account, che
al passo 6 diventa il proprietario dei libri.

## 6. Trasferire i libri

1. Nel progetto **vecchio**: esegui `supabase/eu-1-esporta-dal-vecchio.sql`.
   Copia il JSON dalla cella del risultato e annota il numero di libri.
2. Nel progetto **nuovo**: apri `supabase/eu-2-importa-nel-nuovo.sql`, sostituisci
   `INCOLLA_QUI_IL_JSON` col JSON copiato ed esegui.
3. Controlla che il conteggio finale coincida con quello annotato.

Gli identificativi dei libri vengono conservati, quindi eventuali collegamenti
salvati nei preferiti continuano a funzionare.

Le tabelle `generi` e `canali` non vengono trasferite perché ancora non usate
dall'app (la pagina Impostazioni le dà come rifinitura futura). `profiles` si
ricrea da sola al primo accesso, grazie al trigger già presente in `schema.sql`.

## 7. Puntare l'app al progetto nuovo

Project Settings → API: copia URL e chiave pubblica del progetto nuovo.

- In locale, in `app/.env.local`.
- Su **Vercel → Settings → Environment Variables**: aggiorna
  `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` per gli ambienti
  Production, Preview e Development.

Sono variabili `NEXT_PUBLIC_`, quindi finiscono dentro il pacchetto compilato:
**cambiarle non basta, serve un nuovo deploy.**

## 8. Spostare anche la funzione in Europa

Vercel → Settings → **Functions** → **Function Region** → `Frankfurt (fra1)`.

Il file `vercel.json` la imposta già, ma se il progetto ha una regione scelta dal
pannello quella ha la precedenza. Controlla che dopo il deploy risulti `fra1` e non
`iad1`.

Poi rilancia il deploy, così le variabili nuove entrano nel pacchetto.

## 9. Chiudere

- Riapri l'app e verifica: i libri ci sono, il risparmio torna, la vetrina mostra
  le copie pubbliche, l'aggiunta con lo scanner funziona.
- Authentication → **Allow new users to sign up**: adesso spegnilo.
- Scarica un backup CSV da Impostazioni e mettilo da parte.
- Dopo qualche giorno di uso tranquillo, cancella il progetto coreano.

---

## Se qualcosa va storto

**L'app dice "Controlla la posta" ma non arriva niente**
Nell'ordine: l'account esiste in Authentication → Users (passo 5b)? L'SMTP è
configurato (passo 5a)? Il Site URL è impostato (passo 4)? Il primo è il più
probabile, ed è anche l'unico che non lascia traccia: l'app mostra il messaggio
rassicurante anche quando l'invio non è mai partito.

**Il link arriva ma rimanda a un indirizzo sbagliato**
Passo 4, URL Configuration. È quasi sempre il Site URL non impostato.

**L'app mostra zero libri anche se l'import diceva il numero giusto**
I libri sono intestati a un account diverso da quello con cui sei entrato. Nel
progetto nuovo: `select utente, count(*) from books group by utente;` e confronta
con `select id, email from auth.users;`.

**È ancora lenta dopo il trasloco**
Controlla nell'ordine: la regione della funzione su Vercel (deve essere `fra1`), che
`CURRENT KEY` sia `ECC (P-256)`, e che il deploy sia successivo al cambio delle
variabili d'ambiente.

**Serve una migrazione completa, con utenti e password**
Questa procedura fa ripartire gli account da zero — accettabile con uno o due utenti
e l'accesso via link email. Per una migrazione integrale c'è la via ufficiale con
Supabase CLI e Docker:
<https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore>
