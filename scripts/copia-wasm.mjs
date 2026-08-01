/**
 * Copia il motore di lettura dei codici a barre dentro `public/`.
 *
 * Perché serve: `barcode-detector` usa ZXing compilato in WebAssembly, e quel file
 * non finisce nel pacchetto dell'applicazione. Di sua iniziativa lo scarica a
 * runtime dal CDN jsDelivr — 1,1 MB presi da un dominio esterno ogni volta che si
 * apre lo scanner. Su rete mobile è lento; con un DNS che filtra pubblicità, o
 * dietro una rete che blocca i CDN, non arriva affatto e il lettore non parte.
 *
 * Servendolo da `public/` viaggia sullo stesso dominio dell'app, entra nella cache
 * del browser e non dipende da nessuno.
 *
 * Gira in automatico prima di `npm run dev` e `npm run build`, così la copia resta
 * allineata alla versione installata: se un aggiornamento porta un ZXing diverso,
 * il file viene rimpiazzato senza che nessuno debba ricordarsene. Una copia fatta
 * a mano una volta sola sarebbe una bomba a orologeria — un `npm update` e il
 * lettore smetterebbe di funzionare per disallineamento di versione.
 */

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const radice = join(dirname(fileURLToPath(import.meta.url)), "..");
const sorgente = join(radice, "node_modules", "zxing-wasm", "dist", "reader", "zxing_reader.wasm");
const destinazione = join(radice, "public", "zxing_reader.wasm");

if (!existsSync(sorgente)) {
  console.error(
    "\n[copia-wasm] Non trovo il motore di lettura in node_modules.\n" +
      "             Percorso atteso: " + sorgente + "\n" +
      "             Prova con `npm install`. Senza questo file lo scanner ISBN non parte.\n",
  );
  process.exit(1);
}

const gia = existsSync(destinazione) && statSync(destinazione).size === statSync(sorgente).size;
if (gia) process.exit(0);

mkdirSync(join(radice, "public"), { recursive: true });
copyFileSync(sorgente, destinazione);

const kb = Math.round(statSync(destinazione).size / 1024);
console.log(`[copia-wasm] zxing_reader.wasm aggiornato in public/ (${kb} KB)`);
