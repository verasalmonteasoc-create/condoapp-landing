import type { Metadata } from "next";

/**
 * `app/gracias/page.tsx` es "use client" -lee sessionStorage y dispara
 * eventos, no puede evitarlo-, y un componente de cliente no puede exportar
 * `metadata` (es una regla de Next, no una limitación de este archivo). Sin
 * este layout, la página heredaba tal cual el <title> de la raíz
 * ("...Deja el WhatsApp del condominio atrás"), que no describe esta
 * página y confundiría a alguien que la vea en el historial del navegador.
 */
export const metadata: Metadata = {
  title: "Gracias — CondoApp",
  // No hace falta "noindex" aquí además del "disallow" de app/robots.ts:
  // combinar los dos es contraproducente -un rastreador al que ya se le
  // dijo que no entre nunca llega a leer la etiqueta que dice que no
  // indexe-, así que basta con uno de los dos mecanismos.
};

export default function LayoutGracias({ children }: { children: React.ReactNode }) {
  return children;
}
