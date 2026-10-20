/** Le due aree dell'applicazione e la loro navigazione. */

export type Area = "libreria" | "vendita";

export type Voce = { href: string; etichetta: string; icona: string };

export const AREE: Record<
  Area,
  { nome: string; sottotitolo: string; frase: string; colore: string; filo: string; voci: Voce[] }
> = {
  libreria: {
    nome: "La mia libreria",
    sottotitolo: "collezione e letture",
    frase: "Immergiti nelle tue letture",
    colore: "#3f5e4e",
    filo: "#3f5e4e",
    voci: [
      { href: "/libreria", etichetta: "Cruscotto", icona: "cruscotto" },
      { href: "/libreria/catalogo", etichetta: "Catalogo", icona: "libro" },
      { href: "/libreria/da-leggere", etichetta: "Da leggere", icona: "lista" },
    ],
  },
  vendita: {
    nome: "Compravendita",
    sottotitolo: "acquisti, vendite, conti",
    frase: "Facciamo business",
    colore: "#8b5ca8",
    filo: "#c9a0dc",
    voci: [
      { href: "/vendita", etichetta: "Cruscotto", icona: "cruscotto" },
      { href: "/vendita/magazzino", etichetta: "Magazzino", icona: "borsa" },
      { href: "/vendita/vendite", etichetta: "Vendite", icona: "grafico" },
      { href: "/vendita/contabilita", etichetta: "Contabilità", icona: "barre" },
      { href: "/vetrina", etichetta: "Vetrina", icona: "globo" },
    ],
  },
};


/** Legge l'area da un parametro dell'indirizzo; null se manca o non è valida. */
export function areaDaParametro(valore: string | undefined | null): Area | null {
  return valore === "libreria" || valore === "vendita" ? valore : null;
}
