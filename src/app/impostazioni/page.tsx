import PaginaSemplice from "@/components/PaginaSemplice";
import Vuoto from "@/components/Vuoto";

export default function Impostazioni() {
  return (
    <PaginaSemplice titolo="Impostazioni" sottotitolo="Elenchi, importazione, copie di sicurezza.">
      <div className="tessera mb-4 px-6 py-6">
        <h3 className="text-[16px]">Copia di sicurezza</h3>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-inchiostro-2">
          Scarica tutti i tuoi libri — collezione personale e compravendita — in un file che puoi aprire con
          Excel o Fogli Google. Nessun dato resta solo dentro l&apos;app.
        </p>
        <a
          href="/api/export"
          className="mt-4 inline-block rounded-[9px] bg-bosco px-4 py-2.5 text-[14px] font-medium text-white transition hover:bg-bosco-scuro"
        >
          Scarica backup CSV
        </a>
      </div>

      <Vuoto
        titolo="Generi e canali personalizzati"
        testo="Qui potrai gestire l'elenco dei generi e dei canali di acquisto/vendita che usi più spesso."
        fase="Rifinitura futura"
      />
    </PaginaSemplice>
  );
}
