import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Le copertine arrivano già come miniature: Google Books ne restituisce una da
     * ~128px di lato, OpenLibrary poco di più. Farle passare per l'ottimizzatore di
     * Vercel non le rimpicciolisce — le fa solo aspettare: alla prima visita di una
     * pagina di catalogo sono decine di trasformazioni su richiesta, tutte insieme,
     * ognuna una latenza in più prima che l'immagine compaia (e tutte a carico della
     * quota gratuita). Servirle così come sono è più veloce e non perde qualità.
     */
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.googleusercontent.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
};

export default nextConfig;
