import type { Metadata, Viewport } from "next";
import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const mincho = Shippori_Mincho({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-shippori",
  display: "swap",
});

const gothic = Zen_Kaku_Gothic_New({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen",
  display: "swap",
});

/**
 * Serve a trasformare i percorsi relativi delle immagini di anteprima in indirizzi
 * assoluti. Senza, Next ripiega su `http://localhost:3000` e chi riceve il link
 * condiviso vede un riquadro vuoto: l'anteprima punta a un indirizzo che esiste
 * solo sul computer di chi l'ha generata.
 */
const INDIRIZZO_SITO =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://libreria-annabella.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(INDIRIZZO_SITO),
  title: "La Libreria di Annabella",
  description: "Catalogo personale e compravendita di libri usati",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Libreria",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf9f3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${mincho.variable} ${gothic.variable}`}>
      {/* suppressHydrationWarning: alcune estensioni del browser (ColorZilla, Grammarly…)
          aggiungono attributi al body prima che React si avvii. Non è un problema nostro. */}
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
