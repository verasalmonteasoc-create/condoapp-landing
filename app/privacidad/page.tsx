import type { Metadata } from "next";

import { Marca } from "@/components/marca/Marca";

export const metadata: Metadata = { title: "Privacidad — CondoApp" };

/**
 * PENDIENTE: sigue siendo un borrador, no el aviso legal definitivo -- ver
 * README.md. Se amplió citando la Ley 172-13 con precisión (verificado por
 * búsqueda, no de memoria: derechos ARCO, independientes entre sí, base
 * constitucional en honor e intimidad), pero falta que alguien con criterio
 * legal en República Dominicana lo revise y, sobre todo, identifique ante
 * quién se ejercen estos derechos en la práctica -- la ley no crea una
 * autoridad de protección de datos de propósito general como sí hacen otras
 * leyes de la región, y afirmar una sin estar seguro sería peor que dejarlo
 * pendiente.
 */
export default function Privacidad() {
  return (
    <main className="mx-auto w-[min(100%-32px,760px)] py-14">
      <Marca />
      <h1 className="mt-8 text-[28px] font-black tracking-[-0.02em] text-neutro-900 dark:text-noche-100">
        Política de privacidad
      </h1>
      <p className="mt-2 text-[13.5px] text-neutro-500 dark:text-noche-400">
        Borrador -- pendiente de revisión legal.
      </p>

      <div className="mt-8 flex flex-col gap-8 text-base leading-relaxed text-neutro-700 dark:text-noche-400">
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-marca-700 dark:text-marca-300">
            Qué guardamos
          </h2>
          <p className="mt-2">
            Cuando solicitas una demostración, guardamos tu nombre, tu número de WhatsApp, el
            nombre de tu condominio o administradora y, si lo escribes, la cantidad de
            apartamentos. Nada más: el formulario no pide ni guarda ningún otro dato.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-marca-700 dark:text-marca-300">
            Para qué lo usamos
          </h2>
          <p className="mt-2">
            Únicamente para contactarte y coordinar la demostración. No lo usamos para ninguna
            otra cosa, y no lo vendemos.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-marca-700 dark:text-marca-300">
            Quién más lo ve
          </h2>
          <p className="mt-2">
            La solicitud se guarda en Airtable, el proveedor que usamos para administrar los
            leads -no se comparte con nadie más-. Es un proveedor con sede fuera de República
            Dominicana: se lo mencionamos explícitamente porque la Ley 172-13 exige claridad
            sobre a dónde viaja un dato personal cuando cruza una frontera, no solo sobre quién
            lo pide.
          </p>
        </section>

        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-marca-700 dark:text-marca-300">
            Tus derechos
          </h2>
          <p className="mt-2">
            Bajo la Ley 172-13 de Protección Integral de los Datos Personales tienes cuatro
            derechos sobre tu información, y cada uno se ejerce por separado -pedir uno no te
            obliga a pedir los demás-:
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            <li>
              <strong className="text-neutro-900 dark:text-noche-100">Acceso:</strong> saber qué guardamos de ti.
            </li>
            <li>
              <strong className="text-neutro-900 dark:text-noche-100">Rectificación:</strong> corregir un dato que
              esté mal -tu WhatsApp, el nombre del condominio.
            </li>
            <li>
              <strong className="text-neutro-900 dark:text-noche-100">Cancelación:</strong> pedir que borremos tu
              solicitud.
            </li>
            <li>
              <strong className="text-neutro-900 dark:text-noche-100">Oposición:</strong> pedir que dejemos de
              contactarte, aunque no borres el registro.
            </li>
          </ul>
          <p className="mt-3">
            Para ejercer cualquiera de los cuatro, escríbenos por los mismos canales de contacto
            de este sitio.
          </p>
        </section>
      </div>
    </main>
  );
}
