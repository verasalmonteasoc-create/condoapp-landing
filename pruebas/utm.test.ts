/**
 * Captura de UTM (lib/utm.ts).
 *
 * Lo que importa probar no es "puede leer un query string" -eso es
 * `URLSearchParams`, no código propio-, sino las dos reglas que si se
 * rompen nadie lo nota hasta revisar Airtable semanas después: que una
 * visita SIN utm no borra el que ya había, y que un utm demasiado largo -que
 * viene de una URL, no de un formulario con límites- se recorta antes de
 * guardarse.
 */
import { beforeEach, describe, expect, it } from "vitest";

import { capturarUTM, leerUTM } from "@/lib/utm";

function irA(url: string) {
  window.history.pushState({}, "", url);
}

describe("capturarUTM / leerUTM", () => {
  beforeEach(() => {
    localStorage.clear();
    irA("/");
  });

  it("guarda los utm que trae la URL", () => {
    irA("/?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento");
    capturarUTM();
    expect(leerUTM()).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "lanzamiento",
    });
  });

  it("una visita sin utm no borra el que ya estaba guardado", () => {
    irA("/?utm_source=google&utm_medium=cpc&utm_campaign=lanzamiento");
    capturarUTM();

    irA("/privacidad"); // sin ningún utm_*
    capturarUTM();

    expect(leerUTM().utm_source).toBe("google");
  });

  it("un utm nuevo SÍ reemplaza al anterior -último toque, no primero-", () => {
    irA("/?utm_source=google&utm_campaign=lanzamiento");
    capturarUTM();

    irA("/?utm_source=meta&utm_campaign=remarketing");
    capturarUTM();

    expect(leerUTM()).toEqual({ utm_source: "meta", utm_medium: undefined, utm_campaign: "remarketing" });
  });

  it("recorta un utm_campaign fabricado a mano, no uno de un anuncio real", () => {
    const largo = "a".repeat(500);
    irA(`/?utm_campaign=${largo}`);
    capturarUTM();
    expect(leerUTM().utm_campaign).toHaveLength(100);
  });

  it("sin ningún utm en la URL, no guarda nada", () => {
    irA("/?otracosa=1");
    capturarUTM();
    expect(leerUTM()).toEqual({});
  });
});
