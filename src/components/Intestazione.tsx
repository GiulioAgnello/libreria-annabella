export default function Intestazione({
  titolo,
  sottotitolo,
  azione,
}: {
  titolo: string;
  sottotitolo?: string;
  azione?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] md:text-[26px]">{titolo}</h1>
        {sottotitolo && <p className="mt-1.5 text-[14px] text-inchiostro-2">{sottotitolo}</p>}
      </div>
      {azione}
    </header>
  );
}
