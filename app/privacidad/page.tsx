import type { Metadata } from "next";

import { Marca } from "@/components/marca/Marca";

export const metadata: Metadata = { title: "Privacidad — CondoApp" };

/**
 * PENDIENTE: este texto es un borrador, no el aviso legal definitivo.
 * Antes de publicar el sitio, alguien con criterio legal en República
 * Dominicana debe revisarlo contra la Ley 172-13 de Protección de Datos.
 */
export default function Privacidad() {
  return (
    <main className="mx-auto w-[min(100%-32px,760px)] py-14">
      <Marca />
      <h1 className="mt-8 text-[28px] font-black tracking-[-0.02em] text-neutro-900">
        Política de privacidad
      </h1>
      <p className="mt-2 text-[13.5px] text-neutro-500">Borrador -- pendiente de revisión legal.</p>

      <div className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-neutro-700">
        <p>
          Cuando solicitas una demostración de CondoApp, guardamos tu nombre, tu número de
          WhatsApp, el nombre de tu condominio o administradora y, si lo escribes, la cantidad
          de apartamentos.
        </p>
        <p>
          Usamos estos datos únicamente para contactarte y coordinar la demostración. No los
          vendemos ni los compartimos con terceros ajenos a CondoApp.
        </p>
        <p>
          Puedes pedir que eliminemos tu información escribiéndonos por los mismos canales de
          contacto de este sitio.
        </p>
      </div>
    </main>
  );
}
