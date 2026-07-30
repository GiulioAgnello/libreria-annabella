import { ICONE } from "@/lib/aree";

export default function Icona({ nome, className = "size-[17px]" }: { nome: string; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICONE[nome] ?? "" }}
    />
  );
}
