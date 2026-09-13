import type { MetadataRoute } from "next";

import { SITIO } from "@/contenido/sitio";

// Sin esto, "next build" con output: "export" rechaza la ruta: una
// metadata route se trata como dinámica por defecto, y una exportación
// estática no puede tener nada dinámico.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITIO.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITIO.url}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
