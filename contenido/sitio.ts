/**
 * Datos del sitio que no son copy de una sección: números, enlaces, claves
 * públicas. Un solo lugar para lo que cambia por entorno o por decisión de
 * negocio, en vez de números sueltos repetidos en cada componente.
 *
 * TODO ESTO SALE DE `NEXT_PUBLIC_*`, CON EL MISMO VALOR VACÍO POR DEFECTO
 * -------------------------------------------------------------------------
 * Antes estos cinco valores eran literales fijos en este archivo. Pasaron a
 * variables de entorno -sin perder ninguno de sus PENDIENTE ni su
 * comportamiento cuando faltan- por dos razones concretas, no por costumbre:
 *
 *   1. Un sitekey de Turnstile está atado al DOMINIO donde se registra
 *      -localhost, la vista previa de Cloudflare y el dominio real necesitan
 *      cada uno el suyo-. Con un literal en el código, probar en local
 *      habría exigido editar este archivo a mano y no commitear el cambio,
 *      un paso manual que alguien olvida tarde o temprano.
 *   2. Habilita la prueba E2E de Playwright: `wrangler pages dev` arranca
 *      con `TURNSTILE_SECRET_KEY` y `NEXT_PUBLIC_TURNSTILE_SITEKEY` puestos a
 *      las claves de prueba que Cloudflare publica para esto -1x00000000000
 *      00000000AA, que siempre pasa-, sin tocar ningún archivo fuente. Ver
 *      `.env.test` y `playwright.config.ts`.
 *
 * `NEXT_PUBLIC_` y no uno sin ese prefijo: son los únicos que Next incrusta
 * en el bundle que llega al navegador -por diseño, para que quede claro con
 * solo mirar el nombre que NINGUNO de estos cinco puede ser secreto-.
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
   * Variable: NEXT_PUBLIC_SITE_URL.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://demo.aplicacionesrd.com",
  urlApp: "https://condoapp.aplicacionesrd.com",

  /**
   * PENDIENTE: número de WhatsApp de la administración, en formato
   * internacional sin signos ("1829XXXXXXX"). Mientras esté vacío, los
   * botones de WhatsApp del sitio no se muestran -- igual que TELEFONO_DEMO
   * en la landing de la app (frontend/app/login/page.tsx).
   * Variable: NEXT_PUBLIC_WHATSAPP.
   */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "",

  /**
   * PENDIENTE: clave PÚBLICA (sitekey) de Cloudflare Turnstile para el
   * widget del formulario. No es secreta -- viaja al navegador. La secreta
   * vive en las variables de entorno de la Function, nunca aquí.
   * Variable: NEXT_PUBLIC_TURNSTILE_SITEKEY.
   */
  turnstileSitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY || "",

  /**
   * PENDIENTE: ID de medición de GA4 ("G-XXXXXXXXXX", en Google Analytics ->
   * Administrar -> Flujos de datos -> el flujo de este sitio). No es
   * secreto: viaja al navegador en cualquier integración de GA4, por diseño.
   * Mientras esté vacío, `lib/analitica.ts` no carga nada de Google -ni
   * siquiera con el consentimiento aceptado-. Variable: NEXT_PUBLIC_GA_ID.
   */
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",

  /**
   * PENDIENTE: ID del píxel de Meta (Events Manager -> el píxel de este
   * sitio -> Configuración). Tampoco es secreto -viaja al navegador-.
   * Mientras esté vacío, no se carga Meta Pixel.
   * Variable: NEXT_PUBLIC_META_PIXEL_ID.
   */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
} as const;

export function enlaceWhatsapp(mensaje: string): string | null {
  if (!SITIO.whatsapp) return null;
  return `https://wa.me/${SITIO.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
