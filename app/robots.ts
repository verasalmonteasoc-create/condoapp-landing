import type { MetadataRoute } from "next";

import { SITIO } from "@/contenido/sitio";

// Ver la nota en app/sitemap.ts: obligatorio con output: "export".
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITIO.url}/sitemap.xml`,
  };
}
