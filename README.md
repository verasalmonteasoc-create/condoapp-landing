# condoapp-landing

Landing page de captación para CondoApp. Sitio 100% estático (Next.js 16,
export estático) más una única pieza dinámica -una Cloudflare Pages
Function- que recibe el formulario de demo y lo guarda en Airtable.

No es parte de la aplicación (`condoapp/`): vive en su propio repositorio a
propósito, para que cambiar un texto de la portada no exija reconstruir el
sistema contable ni dar acceso a ese código a quien solo edita marketing.

## Comandos

```bash
npm install
npm run dev         # servidor de desarrollo de Next
npm run tipos        # tsc --noEmit
npm run pruebas       # vitest run
npm run build         # export estático -> out/
npm run lint
```

## Antes de publicar

Estas cinco cosas están señaladas en el código con un comentario `PENDIENTE`
-- `grep -rn PENDIENTE .` las encuentra todas:

1. **`contenido/sitio.ts` -> `whatsapp`.** Vacío. Mientras lo esté, los
   botones de WhatsApp del sitio no se muestran (mismo patrón que
   `TELEFONO_DEMO` en la landing de la app).
2. **`contenido/sitio.ts` -> `url`.** Está en `https://demo.aplicacionesrd.com`
   como valor provisional. No puede ser `condoapp.aplicacionesrd.com`: ese
   subdominio ya es el de la aplicación real.
3. **Variables de entorno de Airtable y Turnstile.** Ver `.env.example`.
   Se configuran en Cloudflare Pages (Settings -> Environment variables),
   nunca en un archivo que llegue a git.
4. **`app/privacidad/page.tsx`.** Es un borrador. Falta que alguien con
   criterio legal en RD lo revise contra la Ley 172-13.
5. **Sin sección de testimonios.** El único testimonio que se propuso para
   esta portada no era de un cliente real, así que no se publicó ninguno.
   Cuando exista uno de verdad, se agrega un componente `PruebaSocial.tsx`
   entre `ComoFunciona` y `Preguntas`.

## Cómo se despliega (Cloudflare Pages)

1. Sube este repositorio a GitHub.
2. En Cloudflare Pages, conecta el repositorio. Framework preset: **Next.js
   (Static HTML Export)**. Build command: `npm run build`. Output
   directory: `out`.
3. Agrega las variables de entorno de `.env.example` en
   Settings -> Environment variables (production y preview).
4. En tu proveedor de DNS (Squarespace, hoy), crea el CNAME que Cloudflare
   Pages te da para el subdominio elegido en `contenido/sitio.ts`.

Cloudflare descubre `functions/` sola y la despliega junto al sitio
estático: no hace falta declararla en `wrangler.toml`.

## Por qué este stack y no el que se sugirió al pedir el plan

- **Next.js 16, no 14.** Es la versión vigente; la 14 va dos versiones
  atrás.
- **Cloudflare Pages, no Vercel.** El plan gratis de Vercel prohíbe uso
  comercial (cualquier despliegue del que alguien se beneficie
  económicamente); el plan Pro cuesta US$20/mes por persona. Cloudflare
  Pages es gratis, permite uso comercial y solo pide un CNAME.
- **Airtable, no Supabase.** Un proyecto de Supabase gratis se pausa tras
  una semana sin actividad -en una landing con pocas solicitudes, se
  perdería justo la que llegara después de una semana quieta. Airtable
  gratis (1,000 registros, 1,000 llamadas/mes) se administra como una hoja
  de cálculo, que es exactamente lo que alguien sin acceso al código
  necesita para revisar los leads.

## Decisiones de diseño que no pidió el brief

- **`next/font/google` en vez del enlace en vivo que usa la app.** La app
  evita `next/font` a propósito, porque en un sitio con servidor eso
  fuerza a depender de esa API en cada request; aquí, al exportarse como
  sitio estático, la fuente se descarga UNA vez en el build y se sirve
  desde el propio dominio -- estrictamente mejor, sin la petición externa a
  `fonts.googleapis.com` que la app sí necesita tolerar.
- **`.btn-accion` con texto oscuro, no blanco.** El botón naranja
  (`accion-600`) de la app lleva texto blanco, que da un contraste de
  2.5:1 -por debajo del mínimo de 4.5:1 para texto normal-. Aquí lleva
  texto oscuro sobre el mismo naranja (6.7:1) sin tocar el color de marca.
