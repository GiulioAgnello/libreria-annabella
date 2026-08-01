/** Conta i tag aperti e chiusi in un file JSX. Usa: node scripts/controlla-tag.mjs <file> */
import { readFileSync } from "node:fs";

const file = process.argv[2];
const src = readFileSync(file, "utf8");
let ko = 0;

for (const tag of ["div", "table", "thead", "tbody", "tr", "td", "th", "form", "main", "nav"]) {
  const aperti = (src.match(new RegExp(`<${tag}(?=[\\s>])`, "g")) || []).length;
  const chiusi = (src.match(new RegExp(`</${tag}>`, "g")) || []).length;
  const autoChiusi = (src.match(new RegExp(`<${tag}[^>]*/>`, "g")) || []).length;
  if (aperti === 0 && chiusi === 0) continue;
  const ok = aperti - autoChiusi === chiusi;
  if (!ok) ko++;
  console.log(`${ok ? "ok " : "KO "} ${tag.padEnd(6)} aperti=${aperti} autochiusi=${autoChiusi} chiusi=${chiusi}`);
}

console.log(ko ? `\n${ko} tag sbilanciati` : "\nTutti i tag sono bilanciati.");
process.exit(ko ? 1 : 0);
