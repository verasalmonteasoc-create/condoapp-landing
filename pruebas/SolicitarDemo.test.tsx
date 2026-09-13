/**
 * El FORMULARIO como componente, no solo `validar()` por separado -esa
 * lógica ya tiene su propia prueba en validacion.test.ts; esta cubre lo que
 * solo existe al renderizarlo: que un dato inválido muestre su error en
 * pantalla, que un envío válido guarde el traspaso para "/gracias" y
 * navegue, y que nada de esto llegue a tocar la red cuando no debe.
 *
 * Sin mockear Turnstile a propósito: `SITIO.turnstileSitekey` está vacío en
 * este entorno de pruebas (no hay NEXT_PUBLIC_TURNSTILE_SITEKEY puesto), así
 * que el propio componente lo trata como "no configurado todavía" -el mismo
 * camino que ya usa en desarrollo local sin la clave real- y el botón no
 * queda condicionado a ningún token. Es exactamente el comportamiento real
 * que hay que probar, no un atajo de la prueba.
 */
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SolicitarDemo } from "@/components/secciones/SolicitarDemo";

/**
 * Uno tras otro, NUNCA con Promise.all: `userEvent.type()` simula
 * pulsaciones de teclado reales con su propio orden, y lanzar tres a la vez
 * sobre tres campos distintos las entrelaza -se vio de verdad al escribir
 * esta prueba: el campo del condominio terminaba con letras de los otros
 * dos campos mezcladas-. Cada `await` aquí importa.
 */
async function llenarCamposValidos(usuario: ReturnType<typeof userEvent.setup>) {
  await usuario.type(screen.getByLabelText("Nombre"), "María Fernández");
  await usuario.type(screen.getByLabelText("WhatsApp"), "8095550123");
  await usuario.type(screen.getByLabelText("Nombre del condominio"), "Residencial Los Robles");
}

describe("SolicitarDemo", () => {
  const ubicacionReal = window.location;

  beforeEach(() => {
    sessionStorage.clear();
    // jsdom no implementa una navegación real -asignar `location.href`
    // escribiría "Not implemented: navigation" en cada prueba que envía con
    // éxito, ruido que además podría tapar un error de verdad-. Se
    // reemplaza por un objeto simple que solo guarda el valor, y de paso
    // sirve para comprobar a DÓNDE intentó navegar el formulario.
    // `Object.defineProperty`, no una asignación directa: `window.location`
    // tiene un tipo de "solo lectura salvo por su propio setter interno" en
    // las definiciones de TypeScript, y reemplazarlo así evita pelear con
    // ese tipo en vez de dejarlo simplemente sin comprobar.
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "" },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", { writable: true, value: ubicacionReal });
  });

  it("marca el WhatsApp inválido en pantalla y no llega a llamar a la red", async () => {
    const usuario = userEvent.setup();
    const fetchEspiado = vi.fn();
    vi.stubGlobal("fetch", fetchEspiado);
    render(<SolicitarDemo />);

    await usuario.type(screen.getByLabelText("Nombre"), "María Fernández");
    await usuario.type(screen.getByLabelText("WhatsApp"), "123");
    await usuario.type(screen.getByLabelText("Nombre del condominio"), "Residencial Los Robles");
    await usuario.click(screen.getByRole("button", { name: /Enviar solicitud/ }));

    expect(
      await screen.findByText(/número de 10 dígitos que empiece por 809, 829 u 849/),
    ).toBeInTheDocument();
    expect(fetchEspiado).not.toHaveBeenCalled();
  });

  it("con datos válidos, envía a la Function con los campos correctos", async () => {
    const usuario = userEvent.setup();
    const fetchEspiado = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
    vi.stubGlobal("fetch", fetchEspiado);
    render(<SolicitarDemo />);

    await llenarCamposValidos(usuario);
    await usuario.click(screen.getByRole("button", { name: /Enviar solicitud/ }));

    await waitFor(() => expect(fetchEspiado).toHaveBeenCalledTimes(1));
    const [ruta, opciones] = fetchEspiado.mock.calls[0]!;
    expect(ruta).toBe("/api/solicitud-demo");
    const cuerpo = JSON.parse(String(opciones.body));
    expect(cuerpo.nombre).toBe("María Fernández");
    expect(cuerpo.whatsapp).toBe("8095550123");
    // El señuelo viaja vacío: nadie lo tocó -es la prueba de que sigue
    // invisible-, y su presencia es justo lo que la Function usa para
    // distinguir un envío real de un script que rellena todo.
    expect(cuerpo.senuelo).toBe("");
  });

  it("al enviarse con éxito, guarda el traspaso para /gracias y navega ahí", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 })),
    );
    render(<SolicitarDemo />);

    await llenarCamposValidos(usuario);
    await usuario.click(screen.getByRole("button", { name: /Enviar solicitud/ }));

    await waitFor(() => {
      const guardado = sessionStorage.getItem("condoapp_gracias");
      expect(guardado).not.toBeNull();
      expect(JSON.parse(guardado!)).toMatchObject({
        nombre: "María Fernández",
        whatsapp: "8095550123",
        condominio: "Residencial Los Robles",
      });
    });
    expect(window.location.href).toBe("/gracias");
  });

  it("si la Function rechaza el envío, muestra su mensaje y deja el formulario para reintentar", async () => {
    const usuario = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Ya recibimos una solicitud tuya hace un momento." }), {
          status: 429,
        }),
      ),
    );
    render(<SolicitarDemo />);

    await llenarCamposValidos(usuario);
    await usuario.click(screen.getByRole("button", { name: /Enviar solicitud/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ya recibimos una solicitud tuya hace un momento.",
    );
    // Sigue siendo el formulario, no la confirmación: nada que guardar ni
    // adónde navegar tras un rechazo.
    expect(sessionStorage.getItem("condoapp_gracias")).toBeNull();
    expect(screen.getByLabelText("Nombre")).toHaveValue("María Fernández");
  });
});
