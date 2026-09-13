/**
 * Cloudflare Pages Function -- la única pieza dinámica del sitio.
 *
 * Vive fuera de Next a propósito: el resto de la página es HTML estático
 * exportado (next.config.ts -> output: "export"). Cloudflare descubre esta
 * carpeta sola y la sirve en /api/solicitud-demo sin que el build de Next
 * sepa que existe.
 *
 * ORDEN DE LAS COMPROBACIONES, Y POR QUÉ ESE ORDEN
 * --------------------------------------------------
 * De lo gratis a lo que cuesta, para no gastar en una petición que se iba a
 * rechazar de todos modos:
 *   1. Origen -- gratis, en memoria.
 *   2. Señuelo (honeypot) -- gratis, en memoria.
 *   3. Formato de los campos -- gratis, en memoria.
 *   4. Límite de envíos -- una lectura local a Cloudflare (KV).
 *   5. Turnstile -- una llamada de red a Cloudflare.
 *   6. Airtable -- una llamada de red a un tercero.
 * Cada paso solo se alcanza si el anterior pasó. Una IP ya bloqueada por el
 * límite nunca llega a gastar una verificación de Turnstile ni una fila de
 * Airtable.
 *
 * Reglas que ya regían y se mantienen:
 *  - Vuelve a validar TODO lo que ya validó el navegador. Un formulario que
 *    confía en el cliente se salta con una llamada directa a esta URL.
 *  - Las credenciales viven en variables de entorno de Cloudflare (`env`, no
 *    `process.env`: las Functions no corren en Node), nunca en el bundle que
 *    llega al navegador.
 *  - Si Airtable falla, la persona interesada no debe perderse: se responde
 *    con un error claro para que el formulario ofrezca WhatsApp como salida.
 */
import { sinErrores, telefonoRD, validar, type Solicitud } from "../../lib/validacion";
import { SITIO } from "../../contenido/sitio";

/**
 * Forma mínima de un KVNamespace -- lo que este archivo usa, no todo lo que
 * ofrece la API real. Mismo motivo que ya explicaba este archivo para no
 * traer `@cloudflare/workers-types`: una dependencia de tipos entera por dos
 * métodos.
 */
type EspacioClaveValor = {
  get(clave: string): Promise<string | null>;
  put(clave: string, valor: string, opciones?: { expirationTtl?: number }): Promise<void>;
};

type Env = {
  AIRTABLE_BASE_ID: string;
  AIRTABLE_TABLE_NAME: string;
  AIRTABLE_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  LIMITADOR: EspacioClaveValor;
  /**
   * Solo existe en `.dev.vars` (ver .dev.vars.example), NUNCA en las
   * variables de entorno reales de Cloudflare Pages -no está documentado en
   * ningún lugar donde se configure producción-. Con esto puesto, el paso 6
   * no llama a Airtable de verdad: lo usa la prueba E2E de Playwright, que
   * corre contra la Function real (origen, señuelo, límite de envíos y
   * Turnstile se verifican de verdad) pero no puede -ni debe- escribirle a
   * una base de Airtable real en cada corrida de CI.
   */
  MODO_PRUEBA?: string;
};

/**
 * Firma real de una Cloudflare Pages Function. Se declara a mano en vez de
 * traer `@cloudflare/workers-types` -- una dependencia de tipos entera por
 * dos campos (`request`, `env`) que este archivo usa.
 */
type Contexto<E> = { request: Request; env: E };
type FuncionPagina<E> = (contexto: Contexto<E>) => Response | Promise<Response>;

const CABECERAS_JSON = { "Content-Type": "application/json" };

function json(cuerpo: unknown, estado: number): Response {
  return new Response(JSON.stringify(cuerpo), { status: estado, headers: CABECERAS_JSON });
}

/**
 * Recorta un parámetro UTM antes de guardarlo. Espejo a propósito de
 * `limpiar()` en `lib/utm.ts` -no se importa de ahí: ese archivo lleva
 * "use client" y toca `localStorage`, y traerlo aquí solo por dos líneas de
 * texto habría mezclado un módulo de navegador con una Function de
 * servidor sin necesidad real-. Un utm_campaign viene de la URL, que
 * cualquiera escribe a mano: sin este tope, una URL fabricada con miles de
 * caracteres en ese parámetro viajaría tal cual hasta Airtable.
 */
function limpiarUTM(valor: unknown): string | undefined {
  if (typeof valor !== "string") return undefined;
  const recortado = valor.replace(/\s+/g, " ").trim().slice(0, 100);
  return recortado || undefined;
}

/**
 * ¿El origen de la petición es este mismo sitio?
 *
 * Este formulario no usa cookies de sesión -no hay con qué autenticar a
 * nadie en una portada pública-, así que el CSRF clásico (un token que viaje
 * junto a una cookie) no aplica: no hay sesión que un tercero pueda montar a
 * caballo. La amenaza real y equivalente aquí es otra: cualquier página en
 * cualquier otro dominio puede tener un <form> oculto apuntando a esta URL y
 * dispararlo con el clic de un visitante desprevenido, o un script puede
 * llamarla directo sin que nadie visite jamás esta portada. Comprobar que la
 * petición vino de ESTE origen cierra las dos vías con lo único que ya viaja
 * en toda petición del navegador: la cabecera Origin.
 *
 * Se acepta también cualquier subdominio de "pages.dev": son las vistas
 * previas que Cloudflare crea solas por cada rama o solicitud de cambios: sin
 * esto, probar el formulario antes de fusionar a producción fallaría siempre.
 */
function origenValido(request: Request): boolean {
  const origen = request.headers.get("Origin");
  if (!origen) return false; // Un POST directo (curl, un bot) no manda Origin.
  if (origen === SITIO.url) return true;
  try {
    return new URL(origen).hostname.endsWith(".pages.dev");
  } catch {
    return false;
  }
}

/**
 * Verifica el token de Turnstile contra la API de Cloudflare.
 *
 * Se llama SIEMPRE desde el servidor, nunca desde el navegador: la clave
 * secreta no puede viajar al cliente, y un token no verificado no demuestra
 * nada -cualquiera puede mandar un texto cualquiera en ese campo-.
 */
async function turnstileValido(token: string, secreto: string, ip: string): Promise<boolean> {
  if (!token) return false;
  try {
    const respuesta = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secreto, response: token, remoteip: ip }),
    });
    const resultado = (await respuesta.json()) as { success?: boolean };
    return resultado.success === true;
  } catch {
    // Si Cloudflare mismo no responde, no hay manera de confirmar al
    // visitante -- se trata como token inválido, nunca como válido por
    // omisión. Fallar cerrado, no abierto.
    return false;
  }
}

/**
 * Límite de envíos por clave (una IP o un WhatsApp), con una sola lectura y,
 * como mucho, una sola escritura por intento -incluso si alguien insiste
 * después de ser bloqueado, no se vuelve a escribir-. Con el plan gratis de
 * Workers KV (1,000 escrituras al día) esto importa: un limitador que
 * escribe en cada intento de un flood se queda sin cuota antes que el propio
 * ataque, y deja de limitar nada.
 */
async function dentroDelLimite(
  kv: EspacioClaveValor,
  clave: string,
  limite: number,
  ventanaSegundos: number,
): Promise<boolean> {
  const actual = Number((await kv.get(clave)) ?? "0");
  if (actual >= limite) return false;
  await kv.put(clave, String(actual + 1), { expirationTtl: ventanaSegundos });
  return true;
}

// Cinco minutos es suficiente para frenar un script que reintenta en bucle
// sin castigar a alguien que de verdad se equivocó y corrige el formulario.
const VENTANA_SEGUNDOS = 300;
const LIMITE_POR_IP = 4;
// Por WhatsApp, no por correo: este formulario no pide correo -pedirlo solo
// para tener qué limitar habría sido inventar un campo que el diseño no usa
// en ningún otro lugar-. El número ya cumple el mismo papel: identifica a la
// persona, no a la conexión.
const LIMITE_POR_WHATSAPP = 2;

export const onRequestPost: FuncionPagina<Env> = async (contexto) => {
  const { request, env } = contexto;

  // 1. Origen.
  if (!origenValido(request)) {
    return json({ error: "Origen no permitido." }, 403);
  }

  let cuerpo: Partial<Solicitud> & {
    senuelo?: string;
    turnstileToken?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "Solicitud sin formato válido." }, 400);
  }

  // 2. Señuelo. Un campo que ningún humano ve ni llena -está fuera de
  // pantalla en el formulario, no con display:none, que algunos rastreadores
  // sí respetan- pero que un script que rellena "todos los campos de texto
  // que encuentre" completa igual. Se responde éxito, no error: un error le
  // enseña al script que su envío fue detectado; un éxito falso lo deja
  // creyendo que funcionó, sin gastar ni una verificación de Turnstile ni una
  // fila de Airtable en él.
  if (cuerpo.senuelo) {
    return json({ ok: true }, 201);
  }

  const datos: Solicitud = {
    nombre: String(cuerpo.nombre ?? ""),
    whatsapp: String(cuerpo.whatsapp ?? ""),
    condominio: String(cuerpo.condominio ?? ""),
    apartamentos: String(cuerpo.apartamentos ?? ""),
  };

  // 3. Formato.
  const errores = validar(datos);
  if (!sinErrores(errores)) {
    return json({ error: "Hay datos por corregir.", errores }, 422);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "0.0.0.0";
  const whatsapp = telefonoRD(datos.whatsapp); // ya no puede ser null: pasó `validar()`.

  // 4. Límite de envíos.
  const [ipDentroDelLimite, whatsappDentroDelLimite] = await Promise.all([
    dentroDelLimite(env.LIMITADOR, `ip:${ip}`, LIMITE_POR_IP, VENTANA_SEGUNDOS),
    dentroDelLimite(env.LIMITADOR, `wa:${whatsapp}`, LIMITE_POR_WHATSAPP, VENTANA_SEGUNDOS),
  ]);
  if (!ipDentroDelLimite || !whatsappDentroDelLimite) {
    return json(
      { error: "Ya recibimos una solicitud tuya hace un momento. Dános unos minutos." },
      429,
    );
  }

  // 5. Turnstile.
  if (!env.TURNSTILE_SECRET_KEY) {
    // Config incompleta en este entorno (por ejemplo, una vista previa sin
    // secretos). Falla claro en vez de fingir que se verificó algo.
    return json({ error: "El formulario no está configurado todavía." }, 503);
  }
  const humano = await turnstileValido(cuerpo.turnstileToken ?? "", env.TURNSTILE_SECRET_KEY, ip);
  if (!humano) {
    return json({ error: "No se pudo confirmar que eres una persona. Intenta de nuevo." }, 403);
  }

  // 6. Airtable.
  if (env.MODO_PRUEBA) return json({ ok: true }, 201);

  const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, AIRTABLE_API_KEY } = env;
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_API_KEY) {
    return json({ error: "El formulario no está configurado todavía." }, 503);
  }

  const respuesta = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Nombre: datos.nombre.trim(),
          WhatsApp: whatsapp,
          Condominio: datos.condominio.trim(),
          Apartamentos: datos.apartamentos.trim() ? Number(datos.apartamentos) : null,
          "Recibido en": new Date().toISOString(),
          // Registro de auditoría mínimo: quién (Nombre/WhatsApp, arriba),
          // cuándo (Recibido en) y desde qué IP.
          IP: ip,
          // De qué campaña vino -- null y no "" cuando no viene ninguno, que
          // es como Airtable espera una columna de texto vacía en su API.
          utm_source: limpiarUTM(cuerpo.utm_source) ?? null,
          utm_medium: limpiarUTM(cuerpo.utm_medium) ?? null,
          utm_campaign: limpiarUTM(cuerpo.utm_campaign) ?? null,
        },
      }),
    },
  );

  if (!respuesta.ok) {
    return json({ error: "No se pudo guardar la solicitud. Intenta de nuevo en un momento." }, 502);
  }

  return json({ ok: true }, 201);
};

// Cualquier otro método (GET, PUT...) no tiene sentido en este endpoint.
export const onRequest: FuncionPagina<Env> = async (contexto) => {
  if (contexto.request.method === "POST") return onRequestPost(contexto);
  return json({ error: "Método no permitido." }, 405);
};
