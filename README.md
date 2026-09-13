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

Estas siete cosas están señaladas en el código con un comentario
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
   | `IP` | Texto de una línea | La IP del remitente -registro de auditoría, ver "Seguridad" abajo- |

   Un nombre de columna que no coincida no rompe el sitio -Airtable
   simplemente rechaza la fila con un error que la Function convierte en
   "No se pudo guardar la solicitud"-, pero la persona interesada se pierde
   sin que nadie lo note hasta revisar la base. Después de crearla, copia el
   ID de la base (empieza con `app`) y el nombre exacto de la tabla a
   `.env` -ver `.env.example`-, y la clave a `AIRTABLE_API_KEY` (un
   [personal access token](https://airtable.com/create/tokens) con permiso
   `data.records:write` sobre esa base, no la contraseña de la cuenta).
4. **Turnstile (anti-bots) ya está integrado -honeypot, verificación en el
   servidor, todo-, pero falta que la clave exista.** Dos partes, en dos
   sitios, porque una es secreta y la otra no:
   - **Clave pública (sitekey):** en el panel de Cloudflare, Turnstile ->
     Add site. Se pega en `contenido/sitio.ts` -> `turnstileSitekey`. No es
     secreta -viaja al navegador a propósito, es la que identifica el
     widget-.
   - **Clave secreta:** el mismo alta te la da junto a la pública. Va en
     `TURNSTILE_SECRET_KEY`, solo en las variables de entorno de Cloudflare
     Pages -nunca en `contenido/sitio.ts` ni en ningún archivo del
     repositorio-.
   Mientras `turnstileSitekey` esté vacío, el formulario muestra un aviso en
   vez de un widget roto y sigue validando datos igual, pero el servidor
   responde 503 a cualquier envío real -no hay manera de confirmar que quien
   escribe es una persona sin la clave-.
5. **El namespace de Workers KV para el límite de envíos tampoco existe
   todavía.** Ver el comentario en `wrangler.toml`: se crea con
   `wrangler kv namespace create LIMITADOR` (o desde el panel, Storage &
   Databases -> KV), y el "id" que devuelva reemplaza el valor de ese
   archivo. No es secreto, así que va commiteado, igual que
   `AIRTABLE_TABLE_NAME`.
6. **`app/privacidad/page.tsx`.** Ya cita la Ley 172-13 con precisión -los
   cuatro derechos ARCO, verificados por búsqueda antes de escribirlos-,
   dice con qué proveedor externo se comparte el dato (Airtable, con sede
   fuera de RD) y ya menciona la IP que se guarda como auditoría. Sigue
   siendo un borrador: falta que alguien con criterio legal en RD lo revise,
   y en particular que identifique ante quién se ejercen esos derechos en
   la práctica -la ley no crea una autoridad de protección de datos de
   propósito general, y este borrador no inventa una.
7. **Sin sección de testimonios.** El único testimonio que se propuso para
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
4. Conecta el namespace de KV: Settings -> Functions -> KV namespace
   bindings -> Add binding. Nombre de la variable: `LIMITADOR` -tiene que
   ser ese texto exacto, es el nombre que usa `functions/api/solicitud-demo.ts`
   para leerlo de `env`-. Esto es aparte de declararlo en `wrangler.toml`:
   ese archivo describe el proyecto, pero Cloudflare Pages solo conecta el
   binding de verdad cuando también se agrega desde el panel (o con
   `wrangler pages deployment` si se despliega por línea de comandos).
5. En tu proveedor de DNS (Squarespace, hoy), crea el CNAME que Cloudflare
   Pages te da para el subdominio elegido en `contenido/sitio.ts`.
6. Dominio -> SSL/TLS -> Edge Certificates -> activa "Always Use HTTPS".
   Cloudflare emite el certificado gratis; este interruptor es lo que hace
   que entrar por `http://` redirija solo a `https://` en vez de servir la
   página igual por el puerto inseguro.

Cloudflare descubre `functions/` sola y la despliega junto al sitio
estático: no hace falta declararla en `wrangler.toml`.

## Seguridad

Repaso hecho contra la lista real de OWASP para formularios públicos, no
contra una plantilla genérica. Estado de cada punto:

| Punto | Estado |
|---|---|
| HTTPS obligatorio | Gratis en Cloudflare Pages; se activa en el panel, ver paso 6 arriba -no es una cabecera, no hay código que lo aplique- |
| Cabeceras de seguridad | `public/_headers` -ver esa sección abajo, el porqué de cada una- |
| Validación y sanitización en el servidor | Ya existía (`lib/validacion.ts`, compartida con el navegador); se le agregó tope de largo, que antes no tenía |
| Rate limiting por IP y por identidad | `functions/api/solicitud-demo.ts`, con Workers KV -ver esa sección- |
| Honeypot / captcha | Los dos: señuelo fuera de pantalla + Turnstile verificado en el servidor |
| CSRF | No aplica en el sentido clásico -no hay cookie de sesión que un tercero pueda montar-; el equivalente real (que nadie más pueda disparar este formulario) se cierra comprobando `Origin` |
| Sin secretos en texto plano | Ya regía (`env`, no hardcodeado); verificado que sigue así |
| Ley 172-13 / consentimiento | `app/privacidad/page.tsx`, ampliada con la IP que ahora se guarda |
| Secretos en variables de entorno | Ya regía; sin cambios |
| Auditoría básica | Ya guardaba quién y cuándo; se agregó la IP |
| Dependencias sin vulnerabilidades conocidas | `npm audit`: 0 en las cuatro severidades, verificado al escribir esto |

### `public/_headers`, no `next.config.ts`

Se probó en este mismo repositorio: con `output: "export"`, la función
`headers()` de Next compila sin error pero Next avisa tres veces que
"headers are not applied when exporting your application" -son cero bytes
en producción, no un aviso decorativo-. `_headers` es la sintaxis nativa de
Cloudflare Pages; vive en `public/`, que Next copia tal cual a `out/`.

La única cabecera que pide una excepción real es
`script-src 'unsafe-inline'`. Se compiló el sitio y se inspeccionó el HTML:
Next deja 3 `<script>` sin `src` en cada página -el arranque de hidratación
de React, no algo opcional-, y un sitio estático no tiene servidor que
genere un nonce distinto por visita para permitir solo esos tres sin
`unsafe-inline`. La alternativa correcta -calcular el hash SHA-256 de cada
uno en el build, que cambian de contenido en cada build- se evaluó y no se
hizo: este sitio no tiene un solo `dangerouslySetInnerHTML` ni contenido de
un visitante que se le vuelva a mostrar a otro, que es la superficie que un
XSS reflejado necesita. El resto de la política -orígenes de script
restringidos a este dominio y a `challenges.cloudflare.com`, nada más- sigue
siendo la defensa real. El detalle completo, con qué cambiar el día que esto
deje de ser cierto, está en los comentarios del propio archivo.

### Límite de envíos (`functions/api/solicitud-demo.ts`)

Por IP (4 cada 5 minutos) y por WhatsApp (2 cada 5 minutos) -no por correo:
este formulario no pide correo, y agregar un campo solo para tener qué
limitar habría sido inventar algo que el diseño no usa en ningún otro
lado-. Se implementó a mano sobre Workers KV, no con el binding
`ratelimit` nuevo de Cloudflare (ya "GA" al escribir esto): su propia
documentación no confirma que funcione desde Pages Functions ni que esté en
el plan gratis, y de fábrica limita por ubicación de Cloudflare que atiende
la petición, no de forma global. KV sí tiene su plan gratis documentado y
funciona igual en Functions que en Workers. El límite lee una vez y escribe
como mucho una vez por intento -incluso ante un flood sostenido-, a
propósito: con la cuota gratis (1,000 escrituras al día), un limitador que
escribe en cada intento se queda sin cuota antes que el propio ataque.

Probado con 29 pruebas en `pruebas/solicitud-demo.test.ts`, incluida la
comprobación de que un origen ajeno, un señuelo relleno o un límite ya
alcanzado NUNCA llegan a gastar una verificación de Turnstile ni una fila
de Airtable -se verificó desactivando cada comprobación a mano y
confirmando que la prueba correspondiente sí falla-.

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
