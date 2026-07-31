/**
 * La scena sumi-e dietro ogni schermata.
 * È un file statico in public/: la cache del browser se ne occupa
 * e non pesa un byte sul JavaScript.
 */
export default function Sfondo({ forte = false }: { forte?: boolean }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url(/sfondo.svg)", opacity: forte ? 0.32 : 0.14 }}
    />
  );
}
