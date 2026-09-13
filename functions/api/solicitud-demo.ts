/**
 * Cloudflare Pages Function -- la única pieza dinámica del sitio.
 *
 * Vive fuera de Next a propósito: el resto de la página es HTML estático
 * exportado (next.config.ts -> output: "export"). Cloudflare descubre esta
 * carpeta sola y la sirve en /api/solicitud-demo sin que el build de Next
 * sepa que existe.
 *
 * Reglas:
 *  - Vuelve a validar TODO lo que ya validó el navegador. Un formulario que
 *    confía en el cliente se salta con una llamada directa a esta URL.
 *  - Las credenciales de Airtable viven en variables de entorno de
 *    Cloudflare (`env`, no `process.env`: las Functions no corren en Node),
 *    nunca en el bundle que llega al navegador.
 *  - Si Airtable falla, la persona interesada no debe perderse: se responde
 *    con un error claro para que el formulario ofrezca WhatsApp como salida.
 */
import { sinErrores, telefonoRD, validar, type Solicitud } from "../../lib/validacion";

type Env = {
  AIRTABLE_BASE_ID: string;
  AIRTABLE_TABLE_NAME: string;
  AIRTABLE_API_KEY: string;
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

export const onRequestPost: FuncionPagina<Env> = async (contexto) => {
  let cuerpo: Partial<Solicitud>;
  try {
    cuerpo = await contexto.request.json();
  } catch {
    return json({ error: "Solicitud sin formato válido." }, 400);
  }

  const datos: Solicitud = {
    nombre: String(cuerpo.nombre ?? ""),
    whatsapp: String(cuerpo.whatsapp ?? ""),
    condominio: String(cuerpo.condominio ?? ""),
    apartamentos: String(cuerpo.apartamentos ?? ""),
  };

  const errores = validar(datos);
  if (!sinErrores(errores)) {
    return json({ error: "Hay datos por corregir.", errores }, 422);
  }

  const { AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME, AIRTABLE_API_KEY } = contexto.env;
  if (!AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME || !AIRTABLE_API_KEY) {
    // Config incompleta en este entorno (por ejemplo, una vista previa sin
    // secretos). Falla claro en vez de fingir que se guardó la solicitud.
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
          WhatsApp: telefonoRD(datos.whatsapp),
          Condominio: datos.condominio.trim(),
          Apartamentos: datos.apartamentos.trim() ? Number(datos.apartamentos) : null,
          "Recibido en": new Date().toISOString(),
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
