/**
 * Datos del sitio que no son copy de una sección: números, enlaces, claves
 * públicas. Un solo lugar para lo que cambia por entorno o por decisión de
 * negocio, en vez de números sueltos repetidos en cada componente.
 */
export const SITIO = {
  nombre: "CondoApp",
  descriptor: "Administración de condominios",

  /**
   * PENDIENTE: subdominio real de esta portada. "demo" es un valor
   * provisional -- razonable porque el CTA entero es "solicitar demo", pero
   * es una elección, no un hecho. No puede ser "condoapp.aplicacionesrd.com":
   * ese ya es el de la aplicación real. Se usa en metadataBase, robots.ts y
   * sitemap.ts -- cambiarlo aquí basta, no hay que tocar esos tres archivos.
   */
  url: "https://demo.aplicacionesrd.com",
  urlApp: "https://condoapp.aplicacionesrd.com",

  /**
   * PENDIENTE: número de WhatsApp de la administración, en formato
   * internacional sin signos ("1829XXXXXXX"). Mientras esté vacío, los
   * botones de WhatsApp del sitio no se muestran -- igual que TELEFONO_DEMO
   * en la landing de la app (frontend/app/login/page.tsx).
   */
  whatsapp: "",

  /**
   * Clave PÚBLICA (sitekey) de Cloudflare Turnstile para el widget del
   * formulario. No es secreta -- viaja al navegador. La secreta vive en
   * las variables de entorno de la Function, nunca aquí.
   */
  turnstileSitekey: "",

  /**
   * PENDIENTE: ID de medición de GA4 ("G-XXXXXXXXXX", en Google Analytics ->
   * Administrar -> Flujos de datos -> el flujo de este sitio). No es
   * secreto: viaja al navegador en cualquier integración de GA4, por diseño.
   * Mientras esté vacío, `lib/analitica.ts` no carga nada de Google -ni
   * siquiera con el consentimiento aceptado-.
   */
  gaId: "",

  /**
   * PENDIENTE: ID del píxel de Meta (Events Manager -> el píxel de este
   * sitio -> Configuración). Tampoco es secreto -viaja al navegador-.
   * Mientras esté vacío, no se carga Meta Pixel.
   */
  metaPixelId: "",
} as const;

export function enlaceWhatsapp(mensaje: string): string | null {
  if (!SITIO.whatsapp) return null;
  return `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
