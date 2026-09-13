import type { MetadataRoute } from "next";

import { SITIO } from "@/contenido/sitio";

// Ver la nota en app/sitemap.ts: obligatorio con output: "export".
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // "/gracias" fuera de los resultados de búsqueda a propósito: es una
    // página de agradecimiento, no contenido -que apareciera en Google
    // significaría que cualquiera puede llegar ahí sin haber enviado el
    // formulario, e infla las conversiones si algún día se mide también por
    // URL visitada en vez de solo por el evento de "lib/analitica.ts".
    rules: { userAgent: "*", allow: "/", disallow: "/gracias" },
    sitemap: `${SITIO.url}/sitemap.xml`,
  };
}
