"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Integra el widget de Cloudflare Turnstile con un formulario de React.
 *
 * Por qué un hook y no leer `window.turnstile` a mano en el componente: el
 * script se carga una vez (`next/script`, en `SolicitarDemo.tsx`) pero el
 * WIDGET se renderiza aparte, y hay que hacerlo con la API explícita
 * (`turnstile.render`), no con el atributo `data-sitekey` implícito -la
 * explícita es la única forma de reiniciarlo después de cada intento: un
 * token de Turnstile es de un solo uso, así que sin reiniciarlo un segundo
 * envío (tras un error de Airtable, por ejemplo) fallaría siempre con un
 * token ya gastado sin que la persona entienda por qué.
 */

type Turnstile = {
  render(
    contenedor: HTMLElement,
    opciones: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ): string;
  reset(idWidget: string): void;
  remove(idWidget: string): void;
};

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

export function useTurnstile(sitekey: string) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const idWidget = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scriptListo, setScriptListo] = useState(false);

  useEffect(() => {
    // Sin sitekey (todavía no configurada -ver contenido/sitio.ts-) no hay
    // nada que renderizar. El formulario sigue funcionando en desarrollo; el
    // servidor es quien de verdad exige el token cuando ya existe la clave.
    if (!sitekey || !scriptListo || !contenedorRef.current || idWidget.current) return;
    idWidget.current = window.turnstile!.render(contenedorRef.current, {
      sitekey,
      callback: setToken,
      "expired-callback": () => setToken(null),
      "error-callback": () => setToken(null),
    });
  }, [sitekey, scriptListo]);

  function reiniciar() {
    setToken(null);
    if (idWidget.current) window.turnstile?.reset(idWidget.current);
  }

  return { contenedorRef, token, reiniciar, marcarScriptListo: () => setScriptListo(true) };
}
