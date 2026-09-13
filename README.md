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

Estas seis cosas están señaladas en el código con un comentario
`PENDIENTE` -- `grep -rn PENDIENTE .` las encuentra todas:

1. **`contenido/sitio.ts` -> `whatsapp`.** Vacío. Mientras lo esté, los
   botones de WhatsApp del sitio no se muestran (mismo patrón que
   `TELEFONO_DEMO` en la landing de la app).
2. **`contenido/sitio.ts` -> `url`.** Está en `https://demo.aplicacionesrd.com`
   como valor provisional. No puede ser `condoapp.aplicacionesrd.com`: ese
   subdominio ya es el de la aplicación real.
3. **La base de Airtable todavía no existe.** Créala con este nombre de
   tabla y estas columnas EXACTAS -mayúsculas y todo-, porque
   `functions/api/solicitud-demo.ts` las manda con estos nombres tal cual:

   | Columna | Tipo en Airtable | Qué le llega |
   |---|---|---|
   | `Nombre` | Texto de una línea | El nombre tal como se escribió |
   | `WhatsApp` | Número de teléfono (o texto) | 10 dígitos, sin espacios ni el 809/829/849 alterado |
   | `Condominio` | Texto de una línea | Nombre del condominio o administradora |
   | `Apartamentos` | Número | Vacío (`null`) si no se escribió |
   | `Recibido en` | Fecha, con hora | ISO 8601, en UTC |

   Un nombre de columna que no coincida no rompe el sitio -Airtable
   simplemente rechaza la fila con un error que la Function convierte en
   "No se pudo guardar la solicitud"-, pero la persona interesada se pierde
   sin que nadie lo note hasta revisar la base. Después de crearla, copia el
   ID de la base (empieza con `app`) y el nombre exacto de la tabla a
   `.env` -ver `.env.example`-, y la clave a `AIRTABLE_API_KEY` (un
   [personal access token](https://airtable.com/create/tokens) con permiso
   `data.records:write` sobre esa base, no la contraseña de la cuenta).
4. **Turnstile (anti-bots).** Igual que el punto anterior pero para
   `TURNSTILE_SECRET_KEY` -se crea en el panel de Cloudflare, es gratis, y
   el formulario funciona sin él mientras no se agregue (no hay verificación
   anti-bots todavía, solo la validación de datos).
5. **`app/privacidad/page.tsx`.** Ya cita la Ley 172-13 con precisión -los
   cuatro derechos ARCO, verificados por búsqueda antes de escribirlos- y
   dice con qué proveedor externo se comparte el dato (Airtable, con sede
   fuera de RD). Sigue siendo un borrador: falta que alguien con criterio
   legal en RD lo revise, y en particular que identifique ante quién se
   ejercen esos derechos en la práctica -la ley no crea una autoridad de
   protección de datos de propósito general, y este borrador no inventa una.
6. **Sin sección de testimonios.** El único testimonio que se propuso para
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
