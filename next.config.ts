import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Le copertine arrivano da Google Books o OpenLibrary: le lasciamo ottimizzare
    // e mettere in cache da Next/Vercel invece di scaricarle a piena grandezza ogni volta.
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.googleusercontent.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
    ],
  },
};

export default nextConfig;
