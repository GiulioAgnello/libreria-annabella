import Image from "next/image";

/**
 * La copertina in miniatura all'inizio di una riga di elenco.
 *
 * Quando manca lascia comunque il suo spazio, con un rettangolo vuoto: se
 * sparisse, le righe senza copertina avrebbero il titolo spostato a sinistra
 * rispetto alle altre e la colonna sembrerebbe storta.
 *
 * Le dimensioni sono fisse e piccole di proposito — le immagini che arrivano dai
 * cataloghi sono già miniature da ~128px, quindi qui non si scarica niente di
 * più di quello che serve.
 */
export default function Copertina({ url, alt = "" }: { url: string | null; alt?: string }) {
  const cornice = "h-[45px] w-[30px] shrink-0 overflow-hidden rounded-[3px] border border-tratto";

  if (!url) return <span className={`${cornice} block bg-glicine-tenue`} aria-hidden />;

  return (
    <Image
      src={url}
      alt={alt}
      width={30}
      height={45}
      className={`${cornice} object-cover`}
    />
  );
}
