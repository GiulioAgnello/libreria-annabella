import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Libreria di Annabella",
    short_name: "Libreria",
    description: "Catalogo personale e compravendita di libri usati",
    start_url: "/",
    display: "standalone",
    background_color: "#fcf9f3",
    theme_color: "#fcf9f3",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
