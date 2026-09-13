"use client";

import { MockupCelular } from "@/components/secciones/MockupCelular";
import { IconoAuriculares, IconoCelular, IconoEscudo } from "@/components/marca/Iconos";
import { rastrearClicDemo } from "@/lib/analitica";

const CONFIANZA = [
  { Icono: IconoEscudo, texto: "Probado en condominios dominicanos" },
  { Icono: IconoCelular, texto: "Funciona en Android y iPhone" },
  { Icono: IconoAuriculares, texto: "Soporte en español" },
];

/**
 * Hero + barra de confianza. Van juntos porque la barra de confianza es la
 * primera objeción que resuelve ("¿esto es de verdad, o es una promesa
 * bonita?") y tiene que leerse en el mismo primer vistazo que el título.
 *
 * El celular va segundo en el marcado a propósito, sin necesidad de
 * reordenarlo por CSS: en el teléfono -apilado, una columna- lo primero que
 * se lee es el texto, no una ilustración decorativa de un teléfono dentro de
 * un teléfono; y en escritorio ese mismo orden de columnas ya lo deja a la
 * derecha, que es donde este tipo de composición espera encontrarlo.
 */
export function Portada() {
  return (
    <section id="inicio" className="py-14 sm:py-20">
      <div className="mx-auto grid w-[min(100%-32px,1160px)] items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          <h1 className="max-w-[16ch] text-[38px] font-black leading-[1.04] tracking-[-0.03em] text-neutro-900 dark:text-noche-100 sm:text-[52px] lg:text-[60px]">
            ¿Todavía administras tu condominio por WhatsApp?
          </h1>

          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-neutro-700 dark:text-noche-400 sm:text-[19px]">
            CondoApp organiza residentes, cuotas, incidencias y reservas en una sola app.
            Sin mensajes perdidos, sin Excel.
          </p>

          <div className="mt-7 flex flex-col items-start gap-3">
            <a
              href="#demo"
              onClick={() => rastrearClicDemo("hero")}
              className="btn btn-accion btn-lg w-full sm:w-auto"
            >
              Solicita una demo gratis
            </a>
            {/* neutro-600, no neutro-500: este párrafo cae sobre el fondo
                neutro-50 de la sección (no sobre una tarjeta blanca), y ahí
                neutro-500 mide 4.22:1 -por debajo del 4.5:1 de WCAG AA-.
                neutro-600 llega a 6.5:1. */}
            <p className="text-[13.5px] text-neutro-600 dark:text-noche-400">
              Te contactamos en menos de 24 horas. Sin compromiso.
            </p>
          </div>

          <ul className="mt-10 flex flex-col gap-3 border-t border-neutro-200 pt-8 dark:border-noche-700 sm:flex-row sm:gap-8">
            {CONFIANZA.map(({ Icono, texto }) => (
              <li
                key={texto}
                className="flex items-center gap-2.5 text-base font-bold text-neutro-700 dark:text-noche-100"
              >
                <Icono className="h-5 w-5 shrink-0 text-marca-700 dark:text-marca-300" />
                {texto}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <MockupCelular />
        </div>
      </div>
    </section>
  );
}
