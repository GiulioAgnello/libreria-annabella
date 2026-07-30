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
      { href: "/vendita/vetrina", etichetta: "Vetrina", icona: "globo" },
    ],
  },
};

export const ICONE: Record<string, string> = {
  cruscotto:
    '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  libro: '<path d="M4 19.5V5a2 2 0 0 1 2-2h12a1 1 0 0 1 1 1v15"/><path d="M6 17h13"/><path d="M6 21h13a1 1 0 0 0 1-1v-3"/>',
  lista: '<path d="M4 6h16M4 12h11M4 18h7"/>',
  borsa: '<path d="M3 6h18l-1.5 12H4.5z"/><path d="M9 6V4a3 3 0 0 1 6 0v2"/>',
  grafico: '<path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/>',
  barre: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
  piu: '<path d="M12 5v14M5 12h14"/>',
  ingranaggio: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
};
