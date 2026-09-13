import type { NextConfig } from "next";

/**
 * Sitio 100% estático: sin servidor propio, sin funciones de Next.
 *
 * La única pieza dinámica -recibir el formulario de demo- vive en
 * `functions/api/solicitud-demo.ts`, una Cloudflare Pages Function
 * independiente de este build. Separarla así permite desplegar en
 * cualquier hosting estático el día que haga falta, cambiando solo esa
 * función y no el resto del sitio.
 */
const config: NextConfig = {
  output: "export",
  images: {
    // La exportación estática no tiene el optimizador de imágenes de Next
    // (necesita un servidor). El sitio no lleva fotografías, solo SVG en
    // línea, así que no hay nada que optimizar.
    unoptimized: true,
  },
  // NO agregar `headers()` aquí. Se probó: con `output: "export"`, Next
  // compila igual pero avisa tres veces que "headers are not applied when
  // exporting your application" -- son cero bytes en producción, no un aviso
  // decorativo. Las cabeceras de seguridad (CSP, HSTS, X-Frame-Options...)
  // van en `public/_headers`, la sintaxis nativa de Cloudflare Pages, que sí
  // se sirve porque todo lo que hay en `public/` se copia tal cual a `out/`.
};

export default config;
