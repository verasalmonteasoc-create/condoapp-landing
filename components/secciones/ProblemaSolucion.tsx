import { IconoAlerta, IconoCheck } from "@/components/marca/Iconos";

const ANTES = [
  "Mensajes perdidos en el grupo de WhatsApp del condominio",
  "Cuotas que se olvidan hasta que alguien reclama por qué debe tanto",
  "Incidencias que se reportan y nadie sabe si ya se resolvieron",
];

// "con foto" se quitó a propósito: el reporte de incidencias no admite
// adjuntar una imagen todavía. Prometerlo aquí sería la misma trampa que
// esta portada existe para evitar.
const DESPUES = [
  "Todo centralizado en un solo lugar, no repartido entre chats",
  "Recordatorios de cobro que salen solos, con la fecha que definas",
  "Anuncios de la administración que le llegan a todos, no a quien vio el mensaje a tiempo",
  "Incidencias con seguimiento: quedan abiertas o resueltas, con quién las atendió",
];

/**
 * Contraste antes/después. Dos columnas desde tablet; en el teléfono el
 * "antes" va primero para que el lector se reconozca en el problema antes
 * de que se le ofrezca la solución.
 */
export function ProblemaSolucion() {
  return (
    <section className="border-t border-neutro-200 bg-white py-14 dark:border-noche-700 dark:bg-noche-950 sm:py-20">
      <div className="mx-auto w-[min(100%-32px,1160px)]">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-marca-700 dark:text-marca-300">
          El problema, tal cual es hoy
        </p>
        <h2 className="mt-2 max-w-[24ch] text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-neutro-900 dark:text-noche-100 sm:text-[36px]">
          La administración no es el problema. Perder el hilo, sí.
        </h2>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-tarjeta border border-neutro-200 bg-neutro-50 p-6 dark:border-noche-700 dark:bg-noche-900 sm:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-neutro-500 dark:text-noche-400">
              Antes
            </p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {ANTES.map((linea) => (
                <li
                  key={linea}
                  className="flex items-start gap-3 text-base leading-relaxed text-neutro-700 dark:text-noche-100"
                >
                  <IconoAlerta className="mt-0.5 h-[18px] w-[18px] shrink-0 text-alerta-600 dark:text-alerta-500" />
                  {linea}
                </li>
              ))}
            </ul>
          </div>

          {/*
           * La tarjeta "Con CondoApp" es azul en claro (marca-50) para
           * distinguirse de la gris de "Antes" -- el color hace parte del
           * contraste, no solo decora. En oscuro no puede ser el mismo
           * marca-50: sería un rectángulo casi blanco flotando en una
           * página oscura. Se usa un azul oscuro PROPIO (no noche-900, que
           * ya es la tarjeta neutra de al lado) para conservar esa misma
           * distinción entre las dos columnas.
           */}
          <div className="rounded-tarjeta border border-marca-700/20 bg-marca-50 p-6 dark:border-marca-400/25 dark:bg-[#0d2438] sm:p-8">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-marca-700 dark:text-marca-300">
              Con CondoApp
            </p>
            <ul className="mt-4 flex flex-col gap-3.5">
              {DESPUES.map((linea) => (
                <li
                  key={linea}
                  className="flex items-start gap-3 text-base leading-relaxed text-neutro-700 dark:text-noche-100"
                >
                  <IconoCheck className="mt-1 h-[15px] w-[15px] shrink-0 text-exito-600 dark:text-exito-500" />
                  {linea}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
