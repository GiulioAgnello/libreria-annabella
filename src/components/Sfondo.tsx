/**
 * La scena sumi-e dietro ogni schermata.
 * È un file statico in public/: la cache del browser se ne occupa
 * e non pesa un byte sul JavaScript.
 *
 * Il disegno è 1200×700, cioè molto panoramico. Su uno schermo di telefono,
 * alto e stretto, `cover` lo ingrandiva finché non copriva tutta l'altezza:
 * il risultato era un dettaglio sgranato al centro, con i tre quarti della
 * scena tagliati fuori. Da telefono la si vede quindi per intero (`contain`),
 * appoggiata in alto; da tablet in su torna `cover`, dove le proporzioni
 * dello schermo sono abbastanza vicine a quelle del disegno perché riempire
 * lo spazio non comporti perdite.
 */
export default function Sfondo({ forte = false }: { forte?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 bg-contain bg-top bg-no-repeat md:bg-cover"
      style={{ backgroundImage: "url(/sfondo.svg)", opacity: forte ? 0.32 : 0.14 }}
    />
  );
}
