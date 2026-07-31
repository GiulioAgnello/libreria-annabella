# La Libreria di Annabella

Gestionale personale in due aree: **la collezione da leggere** e **la compravendita
di libri usati**. Un solo database, due mondi separati.

Next.js 16 · React 19 · Tailwind 4 · Supabase (PostgreSQL) · deploy su Vercel. Costo: 0 €.

---

## Avvio in locale

```bash
npm install
npm run dev
```

Poi apri <http://localhost:3000>. **Funziona anche senza database**: vedi tutta
l'interfaccia, semplicemente senza dati salvati.

---

## Collegare Supabase

1. Vai su <https://supabase.com>, accedi con GitHub, crea un progetto nuovo.
   Regione consigliata: *Frankfurt* o *Milan*. Scegli una password per il database
   e conservala.
2. Nel pannello apri **SQL Editor → New query**, incolla tutto il contenuto di
   `supabase/schema.sql` ed esegui. Crea le tabelle, gli indici, i campi calcolati
   e le regole di sicurezza.
3. Vai in **Project Settings → API** e copia i due valori.
4. Crea il file `.env.local` copiando `.env.example`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

5. Riavvia `npm run dev`. La pagina `/entra` ora manda il collegamento di accesso via email.

> Nota: nel piano gratuito Supabase sospende i progetti dopo 7 giorni senza
> attività. Si riattiva con un click e i dati restano.

---

## Pubblicare su Vercel

1. Crea un repository su GitHub e caricalo:

   ```bash
   git init
   git add .
   git commit -m "Prima versione"
   git branch -M main
   git remote add origin https://github.com/TUONOME/libreria-annabella.git
   git push -u origin main
   ```

2. Su <https://vercel.com> scegli **Add New → Project**, seleziona il repository.
3. In **Environment Variables** incolla le stesse due variabili del `.env.local`.
4. **Deploy**. Da qui in avanti ogni `git push` aggiorna il sito da solo.

---

## Com'è fatto

```
src/
  app/
    page.tsx              l'ingresso: due porte
    entra/                accesso via collegamento email
    libreria/             AREA PERSONALE (verde bosco)
      page.tsx              cruscotto: letture e risparmio
      catalogo/             tutti i libri tenuti
      da-leggere/           la coda, riordinabile
    vendita/              AREA COMPRAVENDITA (glicine)
      page.tsx              cruscotto: utile e magazzino
      magazzino/            copie invendute
      vendite/              storico con margini
      contabilita/          i totali, calcolati
      vetrina/              la pagina pubblica
    aggiungi/             scanner ISBN (fase 2)
    impostazioni/         elenchi, importazione, backup
  components/
    Sfondo.tsx            la scena sumi-e dietro ogni pagina (file statico, zero JS)
    GuscioArea.tsx        barra laterale e barra mobile, colore per area
    VoceNav.tsx           l'unico pezzo interattivo: la voce di menu corrente
    PaginaSemplice.tsx    guscio per le pagine fuori dalle due aree
    Intestazione.tsx      titolo e sottotitolo di pagina
    Vuoto.tsx             stato vuoto: dice che cosa arriverà e quando
    Icona.tsx             icone come dati, non come componenti
    Marchio.tsx           il sigillo: un sole a pennello
  lib/
    aree.ts               le due aree e la loro navigazione
    supabase/             client browser e server, con avvio anche senza credenziali
public/
  sfondo.svg            la scena sumi-e (68 KB, 13 KB compressi, in cache)
  marchio.svg           il sigillo
strumenti/ (fuori dal progetto)
  arte.py               rigenera le illustrazioni
supabase/
  schema.sql            da eseguire una volta sola nel pannello Supabase
```

## Scelte di leggerezza

- Le illustrazioni sono **file statici**, non JavaScript: il browser le mette in
  cache e non pesano sul caricamento dell'applicazione.
- Quasi tutto è **componente server**. Il browser riceve JavaScript solo per due
  cose: sapere quale voce di menu è quella corrente e il modulo di accesso.
- Nessuna libreria di componenti, nessun gestore di stato, nessuna animazione
  importata. Le uniche dipendenze sono Next, React, Tailwind e Supabase.
- Le trame giapponesi sono SVG dentro il CSS: nessuna immagine da scaricare.

## Design

| Colore | Uso |
|---|---|
| Avorio `#FCF9F3` | fondo |
| Inchiostro `#1C1917` | testo |
| Verde bosco `#3F5E4E` | area **La mia libreria** |
| Glicine `#C9A0DC` | area **Compravendita** (testi e pulsanti: `#8B5CA8`) |
| Vermiglio `#D2402F` | il sole, il sigillo |

Caratteri: **Shippori Mincho** per titoli e numeri, **Zen Kaku Gothic New**
per l'interfaccia. Lo sfondo è una scena sumi-e disegnata come percorsi SVG:
sole a pennello, glicini pendenti, carpe koi, colline. Al 16% dentro le pagine,
al 50% sull'ingresso.

## A che punto siamo

- [x] **Fase 0** — progetto, build, deploy
- [x] **Fase 1** — schema del database, accesso, ingresso a due porte, guscio delle aree
- [x] **Fase 2** — aggiungi libro: scanner ISBN, compilazione automatica, scheda
- [ ] **Fase 3** — importazione di `LIBRERIA.xlsx`
- [ ] **Fase 4** — area personale: catalogo, filtri, coda, risparmio
- [ ] **Fase 5** — area compravendita: magazzino, vendite, contabilità
- [ ] **Fase 6** — vetrina pubblica
- [ ] **Fase 7** — PWA, backup, rifiniture
