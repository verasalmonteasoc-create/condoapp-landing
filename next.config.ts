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
};

export default config;
