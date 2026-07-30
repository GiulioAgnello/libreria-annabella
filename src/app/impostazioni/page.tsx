import PaginaSemplice from "@/components/PaginaSemplice";
import Vuoto from "@/components/Vuoto";

export default function Impostazioni() {
  return (
    <PaginaSemplice titolo="Impostazioni" sottotitolo="Elenchi, importazione, copie di sicurezza.">
      <Vuoto
        titolo="Ancora niente da regolare"
        testo="Generi, canali di acquisto e vendita, importazione di LIBRERIA.xlsx ed esportazione dei dati."
        fase="Fase 3 e 7"
      />
    </PaginaSemplice>
  );
}
