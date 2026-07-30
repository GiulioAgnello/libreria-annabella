"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * L'unico pezzo di navigazione che ha bisogno del browser:
 * sapere quale voce è quella corrente. Tutto il resto è statico.
 */
export default function VoceNav({
  href,
  colore,
  className,
  classeAttiva,
  styleAttivo,
  children,
}: {
  href: string;
  colore: string;
  className: string;
  classeAttiva?: string;
  styleAttivo?: "sfondo" | "testo";
  children: React.ReactNode;
}) {
  const attiva = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={attiva ? "page" : undefined}
      className={`${className} ${attiva ? (classeAttiva ?? "") : ""}`}
      style={
        attiva
          ? styleAttivo === "testo"
            ? { color: colore }
            : { background: colore, color: "#fff" }
          : undefined
      }
    >
      {children}
    </Link>
  );
}
