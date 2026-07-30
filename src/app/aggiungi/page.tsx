import PaginaSemplice from "@/components/PaginaSemplice";
import Vuoto from "@/components/Vuoto";

export default function Aggiungi() {
  return (
    <PaginaSemplice titolo="Aggiungi un libro" sottotitolo="Inquadra il codice a barre. Il resto si scrive da sé.">
      <Vuoto
        titolo="Lo scanner arriva nella fase 2"
        testo="Fotocamera, lettura dell'ISBN, compilazione automatica da Google Books e scelta fra collezione e magazzino."
        fase="Fase 2"
      />
    </PaginaSemplice>
  );
}
