"use client";

import { useEffect, useState } from "react";

import { activarAnalitica } from "@/lib/analitica";
import { guardarConsentimiento, leerConsentimiento, type Consentimiento } from "@/lib/consentimiento";
import { capturarUTM } from "@/lib/utm";

/**
 * Se monta una vez en `app/layout.tsx`, así que corre en TODAS las páginas.
 * Hace tres cosas relacionadas, no una:
 *
 *   1. Captura los UTM de la URL actual (`lib/utm.ts`) -esto no espera
 *      consentimiento: es un dato que la propia persona entrega al llenar y
 *      enviar el formulario más adelante, no un rastreo pasivo de terceros.
 *   2. Si ya hay una elección guardada de una visita anterior, la respeta
 *      sin volver a preguntar -y si fue "aceptado", activa la analítica de
 *      una vez, sin esperar un clic que no va a llegar-.
 *   3. Si no hay elección todavía, muestra el banner.
 */
export function ConsentimientoCookies() {
  const [consentimiento, setConsentimiento] = useState<Consentimiento | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    capturarUTM();
    const guardado = leerConsentimiento();
    // Esto SÍ es el caso legítimo del patrón que la regla de abajo intenta
    // evitar, no uno que se le escapó: `localStorage` no existe durante el
    // prerenderizado estático (que corre en Node, sin `window`), así que no
    // hay ninguna forma de conocer este valor antes de montar en el
    // navegador. La alternativa que sugiere la regla, `useSyncExternalStore`,
    // evita UNA renderización extra pero reintroduce el problema que este
    // efecto existe para resolver: sin él, el HTML exportado (siempre "sin
    // elegir todavía") y el primer render del cliente de quien YA había
    // aceptado hace semanas no coincidirían, y React lo reporta como un
    // error de hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsentimiento(guardado);
    setListo(true);
    if (guardado === "aceptado") activarAnalitica();
  }, []);

  function elegir(valor: Consentimiento) {
    guardarConsentimiento(valor);
    setConsentimiento(valor);
    if (valor === "aceptado") activarAnalitica();
  }

  // `listo` evita un parpadeo: sin él, el banner se alcanzaría a pintar un
  // instante incluso para quien ya había elegido "rechazado" hace semanas,
  // porque el estado inicial no puede leer `localStorage` antes del primer
  // render (el HTML exportado es el mismo para todos, sin saber quién es).
  if (!listo || consentimiento !== null) return null;

  return (
    <div
      role="region"
      aria-label="Consentimiento de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutro-200 bg-white p-4 shadow-elevada dark:border-noche-700 dark:bg-noche-900 sm:p-5"
    >
      <div className="mx-auto flex w-[min(100%-32px,1160px)] flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] leading-relaxed text-neutro-700 dark:text-noche-400">
          Usamos cookies de análisis (Google Analytics, Meta) para saber qué anuncios funcionan. No
          se activan hasta que aceptes.{" "}
          <a href="/privacidad" className="font-bold text-marca-700 underline dark:text-marca-300">
            Leer la política de privacidad
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => elegir("rechazado")}
            className="btn btn-secundario btn-sm"
          >
            Rechazar
          </button>
          <button type="button" onClick={() => elegir("aceptado")} className="btn btn-accion btn-sm">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
