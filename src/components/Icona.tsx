import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowDown,
  faArrowLeft,
  faArrowTrendUp,
  faArrowUp,
  faBagShopping,
  faBook,
  faBookBookmark,
  faBookOpenReader,
  faBoxesStacked,
  faBuildingColumns,
  faCamera,
  faChartColumn,
  faCircleCheck,
  faCoins,
  faGaugeHigh,
  faGear,
  faHeadphones,
  faHourglassHalf,
  faListOl,
  faPiggyBank,
  faPlus,
  faReceipt,
  faRightLeft,
  faScaleBalanced,
  faStore,
  faTrashCan,
  faWallet,
  faPercent,
  faLayerGroup,
  faBookmark,
} from "@fortawesome/free-solid-svg-icons";

/* Il CSS di Font Awesome lo importa `layout.tsx` una volta sola: così le icone
   hanno già la misura giusta al primo disegno, senza il lampo dell'iniezione. */
config.autoAddCss = false;

/**
 * Le icone dell'applicazione, da Font Awesome (set "solid", gratuito).
 *
 * Si chiamano per nome — `<Icona nome="libro" />` — così il resto del codice non
 * dipende da Font Awesome: per cambiare un disegno basta cambiare una riga qui.
 * Solo le icone elencate entrano nel pacchetto, non l'intera collezione.
 */
const ICONE: Record<string, IconDefinition> = {
  // navigazione
  cruscotto: faGaugeHigh,
  libro: faBook,
  lista: faListOl,
  borsa: faBagShopping,
  grafico: faArrowTrendUp,
  barre: faChartColumn,
  globo: faStore,
  piu: faPlus,
  su: faArrowUp,
  sinistra: faArrowLeft,
  giu: faArrowDown,
  ingranaggio: faGear,
  // libreria
  "in-lettura": faBookOpenReader,
  "da-leggere": faBookmark,
  coda: faBookBookmark,
  letto: faCircleCheck,
  biblioteca: faBuildingColumns,
  audiolibro: faHeadphones,
  salvadanaio: faPiggyBank,
  bilancia: faScaleBalanced,
  collezione: faLayerGroup,
  // compravendita
  monete: faCoins,
  portafoglio: faWallet,
  percentuale: faPercent,
  magazzino: faBoxesStacked,
  scontrino: faReceipt,
  clessidra: faHourglassHalf,
  // azioni
  sposta: faRightLeft,
  cestino: faTrashCan,
  fotocamera: faCamera,
};

export default function Icona({ nome, className = "size-[17px]" }: { nome: string; className?: string }) {
  const icona = ICONE[nome];
  if (!icona) return null;

  /* La misura la decide il contenitore (le classi `size-*` di sempre): il CSS di
     Font Awesome fissa l'altezza a 1em e, essendo fuori dai layer di Tailwind,
     vincerebbe sulle classi messe direttamente sull'svg. */
  return (
    <span aria-hidden className={`inline-flex shrink-0 items-center justify-center ${className}`}>
      <FontAwesomeIcon icon={icona} style={{ width: "100%", height: "100%" }} />
    </span>
  );
}
