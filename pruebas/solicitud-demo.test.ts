/**
 * La Function completa, no solo `validar()` por separado.
 *
 * POR QUÉ SE PRUEBA ASÍ
 * -----------------------
 * `onRequestPost` es justo lo que Cloudflare invoca en producción: se le
 * construye una `Request` y un `env` de mentira -incluido un KV en memoria,
 * ver `crearKVFalso`- y se comprueba la respuesta real, en el mismo orden en
 * que la propia función decide: origen, señuelo, formato, límite de envíos,
 * Turnstile, Airtable. Cada prueba de rechazo comprueba TAMBIÉN que `fetch`
 * no se llamó -o se llamó una sola vez, nunca dos-: un origen no permitido
 * que igual gastara una verificación de Turnstile sería un límite decorativo,
 * no una defensa.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { onRequestPost } from "../functions/api/solicitud-demo";
import { SITIO } from "@/contenido/sitio";

const SOLICITUD_VALIDA = {
  nombre: "María Fernández",
  whatsapp: "809 555 0123",
  condominio: "Residencial Los Robles",
  apartamentos: "24",
  senuelo: "",
  turnstileToken: "token-de-prueba",
};

function crearKVFalso() {
  const almacen = new Map<string, string>();
  return {
    async get(clave: string) {
      return almacen.get(clave) ?? null;
    },
    async put(clave: string, valor: string) {
      almacen.set(clave, valor);
    },
  };
}

function crearEnv(kv = crearKVFalso()) {
  return {
    AIRTABLE_BASE_ID: "appDePrueba",
    AIRTABLE_TABLE_NAME: "Solicitudes",
    AIRTABLE_API_KEY: "clave-de-prueba",
    TURNSTILE_SECRET_KEY: "secreto-de-prueba",
    LIMITADOR: kv,
  };
}

function crearPeticion(cuerpo: unknown, opciones: { origen?: string | null; ip?: string } = {}) {
  const cabeceras: Record<string, string> = { "Content-Type": "application/json" };
  if (opciones.origen !== null) cabeceras.Origin = opciones.origen ?? SITIO.url;
  if (opciones.ip) cabeceras["CF-Connecting-IP"] = opciones.ip;
  return new Request("https://sitio-de-prueba.example/api/solicitud-demo", {
    method: "POST",
    headers: cabeceras,
    body: JSON.stringify(cuerpo),
  });
}

/** Distingue la llamada a Turnstile de la llamada a Airtable por la URL. */
function mockFetchExitoso() {
  return vi.fn(async (url: string | URL, _init?: RequestInit) => {
    const u = String(url);
    if (u.includes("challenges.cloudflare.com")) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: "recTest" }), { status: 200 });
  });
}

describe("onRequestPost /api/solicitud-demo", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetchExitoso());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("acepta una solicitud válida de principio a fin", async () => {
    const res = await onRequestPost({
      request: crearPeticion(SOLICITUD_VALIDA, { ip: "190.0.0.1" }),
      env: crearEnv(),
    });
    expect(res.status).toBe(201);
    expect(fetch).toHaveBeenCalledTimes(2); // Turnstile, luego Airtable.
  });

  it("manda la IP del remitente a Airtable, para el registro de auditoría", async () => {
    const espia = mockFetchExitoso();
    vi.stubGlobal("fetch", espia);
    await onRequestPost({
      request: crearPeticion(SOLICITUD_VALIDA, { ip: "190.0.0.42" }),
      env: crearEnv(),
    });
    expect(espia.mock.calls).toHaveLength(2);
    const [, llamadaAirtable] = espia.mock.calls;
    const cuerpoEnviado = JSON.parse(String(llamadaAirtable![1]?.body));
    expect(cuerpoEnviado.fields.IP).toBe("190.0.0.42");
  });

  describe("origen", () => {
    it("rechaza una petición sin cabecera Origin, sin llamar a nada más", async () => {
      const res = await onRequestPost({
        request: crearPeticion(SOLICITUD_VALIDA, { origen: null }),
        env: crearEnv(),
      });
      expect(res.status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("rechaza un origen de otro dominio", async () => {
      const res = await onRequestPost({
        request: crearPeticion(SOLICITUD_VALIDA, { origen: "https://sitio-ajeno.com" }),
        env: crearEnv(),
      });
      expect(res.status).toBe(403);
      expect(fetch).not.toHaveBeenCalled();
    });

    it("acepta una vista previa de Cloudflare (*.pages.dev)", async () => {
      const res = await onRequestPost({
        request: crearPeticion(SOLICITUD_VALIDA, {
          origen: "https://rama-de-prueba.condoapp-landing.pages.dev",
        }),
        env: crearEnv(),
      });
      expect(res.status).toBe(201);
    });
  });

  it("un señuelo relleno responde éxito sin escribir nada de verdad", async () => {
    const res = await onRequestPost({
      request: crearPeticion({ ...SOLICITUD_VALIDA, senuelo: "http://spam.example" }),
      env: crearEnv(),
    });
    expect(res.status).toBe(201);
    // La respuesta finge éxito -no le enseña al script que lo detectamos-,
    // pero no debe haber tocado ni Turnstile ni Airtable.
    expect(fetch).not.toHaveBeenCalled();
  });

  it("datos con formato inválido no llegan ni a mirar el límite de envíos", async () => {
    const res = await onRequestPost({
      request: crearPeticion({ ...SOLICITUD_VALIDA, whatsapp: "123" }),
      env: crearEnv(),
    });
    expect(res.status).toBe(422);
    expect(fetch).not.toHaveBeenCalled();
  });

  describe("límite de envíos", () => {
    it("bloquea a la misma IP después de repetirse demasiadas veces", async () => {
      const kv = crearKVFalso();
      let ultima: Response;
      // El límite por IP es 4; el quinto envío -con un WhatsApp distinto
      // cada vez, para aislar que lo que bloquea es la IP y no el teléfono-
      // tiene que caer.
      for (let i = 0; i < 5; i++) {
        ultima = await onRequestPost({
          request: crearPeticion(
            { ...SOLICITUD_VALIDA, whatsapp: `809555${1000 + i}` },
            { ip: "190.0.0.99" },
          ),
          env: crearEnv(kv),
        });
      }
      expect(ultima!.status).toBe(429);
    });

    it("bloquea el mismo WhatsApp aunque cambie de IP", async () => {
      const kv = crearKVFalso();
      let ultima: Response;
      // El límite por WhatsApp es 2 -más bajo que el de IP a propósito-.
      for (let i = 0; i < 3; i++) {
        ultima = await onRequestPost({
          request: crearPeticion(SOLICITUD_VALIDA, { ip: `190.0.0.${i}` }),
          env: crearEnv(kv),
        });
      }
      expect(ultima!.status).toBe(429);
    });

    it("una vez bloqueado, no se gasta ni Turnstile ni Airtable en el intento extra", async () => {
      const kv = crearKVFalso();
      for (let i = 0; i < 4; i++) {
        await onRequestPost({
          request: crearPeticion(
            { ...SOLICITUD_VALIDA, whatsapp: `809555${2000 + i}` },
            { ip: "190.0.0.55" },
          ),
          env: crearEnv(kv),
        });
      }
      vi.clearAllMocks();
      const res = await onRequestPost({
        request: crearPeticion(
          { ...SOLICITUD_VALIDA, whatsapp: "8095559999" },
          { ip: "190.0.0.55" },
        ),
        env: crearEnv(kv),
      });
      expect(res.status).toBe(429);
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it("un token de Turnstile inválido no llega a escribir en Airtable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200 })),
    );
    const res = await onRequestPost({
      request: crearPeticion(SOLICITUD_VALIDA, { ip: "190.0.0.2" }),
      env: crearEnv(),
    });
    expect(res.status).toBe(403);
    expect(fetch).toHaveBeenCalledTimes(1); // Solo Turnstile; Airtable nunca.
  });

  it("sin la clave secreta de Turnstile configurada, falla claro y no intenta nada", async () => {
    const res = await onRequestPost({
      request: crearPeticion(SOLICITUD_VALIDA, { ip: "190.0.0.4" }),
      env: { ...crearEnv(), TURNSTILE_SECRET_KEY: "" },
    });
    expect(res.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
});
