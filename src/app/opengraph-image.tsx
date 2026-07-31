import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const percorsoIcona = join(process.cwd(), "public", "icon-512.png");
  const iconaBase64 = readFileSync(percorsoIcona).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fcf9f3",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${iconaBase64}`}
          width={160}
          height={160}
          style={{ borderRadius: 32 }}
        />
        <div style={{ marginTop: 40, fontSize: 60, color: "#1c1917" }}>La Libreria di Annabella</div>
        <div style={{ marginTop: 14, fontSize: 28, color: "#57534e" }}>
          Catalogo personale e compravendita di libri usati
        </div>
      </div>
    ),
    { ...size },
  );
}
