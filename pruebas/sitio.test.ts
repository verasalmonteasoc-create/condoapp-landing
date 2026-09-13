/**
 * El botón de WhatsApp no puede enlazar a un número vacío.
 *
 * `SITIO.whatsapp` empieza en "" a propósito (ver contenido/sitio.ts):
 * mientras nadie ponga el número real, cualquier componente que dependa de
 * `enlaceWhatsapp` debe recibir null y ocultar el botón, no un enlace
 * `https://wa.me/` roto que no lleva a ningún lado.
 */
import { describe, expect, it } from "vitest";

import { enlaceWhatsapp } from "@/contenido/sitio";

describe("enlaceWhatsapp", () => {
  it("no genera un enlace mientras el número esté vacío", () => {
    expect(enlaceWhatsapp("hola")).toBeNull();
  });
});
