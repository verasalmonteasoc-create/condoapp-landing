/**
 * Reglas del formulario de demo.
 *
 * Esta lógica corre DOS VECES -en el navegador y en la Cloudflare Pages
 * Function que recibe el envío (ver functions/api/solicitud-demo.ts)- desde
 * el mismo archivo. Si se rompe aquí, se rompe en los dos sitios a la vez,
 * que es justo el punto: no puede haber una regla en el cliente y otra,
 * ligeramente distinta, en el servidor.
 */
import { describe, expect, it } from "vitest";

import {
  type Solicitud,
  formatearTelefono,
  sinErrores,
  telefonoRD,
  validar,
} from "@/lib/validacion";

const SOLICITUD_VALIDA: Solicitud = {
  nombre: "María Fernández",
  whatsapp: "809 555 0123",
  condominio: "Residencial Los Robles",
  apartamentos: "",
};

describe("telefonoRD", () => {
  it("acepta un número dominicano con espacios y guiones", () => {
    expect(telefonoRD("809-555-0123")).toBe("8095550123");
    expect(telefonoRD("809 555 0123")).toBe("8095550123");
  });

  it("acepta los tres códigos de área vigentes", () => {
    expect(telefonoRD("8095550123")).not.toBeNull();
    expect(telefonoRD("8295550123")).not.toBeNull();
    expect(telefonoRD("8495550123")).not.toBeNull();
  });

  it("quita el 1 de país cuando viene con los 11 dígitos", () => {
    expect(telefonoRD("18095550123")).toBe("8095550123");
  });

  it("rechaza un código de área que no es de República Dominicana", () => {
    // 305 es Miami, no RD -- que un dominicano escriba diez dígitos no
    // significa que sea SU número.
    expect(telefonoRD("3055550123")).toBeNull();
  });

  it("rechaza un número con menos de 10 dígitos", () => {
    expect(telefonoRD("80955501")).toBeNull();
  });

  it("rechaza vacío", () => {
    expect(telefonoRD("")).toBeNull();
  });
});

describe("formatearTelefono", () => {
  it("agrupa como se escribe un número dominicano", () => {
    expect(formatearTelefono("8095550123")).toBe("809 555 0123");
  });
});

describe("validar", () => {
  it("no marca ningún error en una solicitud completa y válida", () => {
    expect(sinErrores(validar(SOLICITUD_VALIDA))).toBe(true);
  });

  it("el campo de apartamentos es opcional: vacío no es un error", () => {
    const errores = validar({ ...SOLICITUD_VALIDA, apartamentos: "" });
    expect(errores.apartamentos).toBeUndefined();
  });

  it("pero si se escribe algo, tiene que ser un número de unidades razonable", () => {
    expect(validar({ ...SOLICITUD_VALIDA, apartamentos: "veinte" }).apartamentos).toBeDefined();
    expect(validar({ ...SOLICITUD_VALIDA, apartamentos: "0" }).apartamentos).toBeDefined();
    expect(validar({ ...SOLICITUD_VALIDA, apartamentos: "-5" }).apartamentos).toBeDefined();
    expect(validar({ ...SOLICITUD_VALIDA, apartamentos: "24" }).apartamentos).toBeUndefined();
  });

  it("rechaza un nombre de una sola letra", () => {
    expect(validar({ ...SOLICITUD_VALIDA, nombre: "M" }).nombre).toBeDefined();
  });

  it("rechaza un WhatsApp que no es un número dominicano", () => {
    expect(validar({ ...SOLICITUD_VALIDA, whatsapp: "123" }).whatsapp).toBeDefined();
  });

  it("rechaza un condominio sin nombre", () => {
    expect(validar({ ...SOLICITUD_VALIDA, condominio: " " }).condominio).toBeDefined();
  });

  it("los mensajes están en español y son accionables", () => {
    // Quien los lee es la persona llenando el formulario, no quien programó
    // la validación: cada mensaje dice qué corregir, no solo que algo falló.
    const errores = validar({ ...SOLICITUD_VALIDA, nombre: "M", whatsapp: "1" });
    for (const mensaje of Object.values(errores)) {
      expect(mensaje).toBeTruthy();
      expect(mensaje!.charAt(0)).toBe(mensaje!.charAt(0).toUpperCase());
    }
  });
});
