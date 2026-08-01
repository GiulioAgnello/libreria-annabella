/**
 * I generi arrivano dai cataloghi online — Google Books e OpenLibrary — e
 * arrivano in inglese, anche per i libri italiani. Su un libro di Ammaniti
 * comparivano voci come "Mothers and sons", "Italian literature", "Teenagers".
 *
 * Qui si traducono le più ricorrenti. Il valore salvato nel database resta
 * quello originale: si traduce solo per gli occhi, mentre il filtro continua a
 * cercare la stringa vera. Così non serve toccare i dati già inseriti, e se un
 * domani un catalogo cambiasse le sue etichette non si romperebbe niente.
 *
 * Quello che non è in elenco viene mostrato com'è, con l'iniziale maiuscola.
 * Meglio una voce in inglese che una voce sbagliata.
 */
const TRADUZIONI: Record<string, string> = {
  // forme narrative
  fiction: "Narrativa",
  "juvenile fiction": "Narrativa per ragazzi",
  "young adult fiction": "Narrativa per giovani adulti",
  "historical fiction": "Romanzo storico",
  "psychological fiction": "Romanzo psicologico",
  "detective and mystery stories": "Giallo",
  "mystery fiction": "Giallo",
  "science fiction": "Fantascienza",
  "fantasy fiction": "Fantasy",
  "horror tales": "Horror",
  horror: "Horror",
  thrillers: "Thriller",
  "love stories": "Storie d'amore",
  romance: "Rosa",
  "short stories": "Racconti",
  "graphic novels": "Graphic novel",
  comics: "Fumetti",
  poetry: "Poesia",
  drama: "Teatro",
  essays: "Saggi",

  // saggistica
  biography: "Biografia",
  "biography & autobiography": "Biografie e autobiografie",
  autobiography: "Autobiografia",
  history: "Storia",
  philosophy: "Filosofia",
  psychology: "Psicologia",
  religion: "Religione",
  science: "Scienza",
  "social science": "Scienze sociali",
  politics: "Politica",
  "political science": "Scienze politiche",
  travel: "Viaggi",
  cooking: "Cucina",
  art: "Arte",
  music: "Musica",
  "self-help": "Crescita personale",
  "true crime": "Cronaca nera",
  nature: "Natura",
  medicine: "Medicina",
  economics: "Economia",
  "business & economics": "Economia e impresa",

  // etichette per lingua e provenienza
  "italian literature": "Letteratura italiana",
  "english literature": "Letteratura inglese",
  "american literature": "Letteratura americana",
  "french literature": "Letteratura francese",
  "japanese literature": "Letteratura giapponese",
  "russian literature": "Letteratura russa",
  "german literature": "Letteratura tedesca",
  "spanish literature": "Letteratura spagnola",
  "translations into italian": "Tradotto in italiano",
  "italian fiction": "Narrativa italiana",

  // temi che i cataloghi usano spesso
  families: "Famiglia",
  "family life": "Vita familiare",
  "mothers and sons": "Madri e figli",
  "fathers and sons": "Padri e figli",
  "mothers and daughters": "Madri e figlie",
  friendship: "Amicizia",
  teenagers: "Adolescenti",
  children: "Bambini",
  women: "Donne",
  war: "Guerra",
  "world war, 1939-1945": "Seconda guerra mondiale",
  death: "Morte",
  love: "Amore",
  memory: "Memoria",
  identity: "Identità",
  grief: "Lutto",
  solitude: "Solitudine",
};

/** Il nome del genere come va mostrato. Il valore salvato non cambia mai. */
export function nomeGenere(originale: string): string {
  const chiave = originale.trim().toLowerCase();
  const tradotto = TRADUZIONI[chiave];
  if (tradotto) return tradotto;
  return originale.charAt(0).toUpperCase() + originale.slice(1);
}
