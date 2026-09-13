"use client";

import { useEffect } from "react";

import { rastrearScroll50 } from "@/lib/analitica";

/**
 * No renderiza nada visible: es un `useEffect` con forma de componente,
 * para poder montarlo solo en `app/page.tsx` -la única página con contenido
 * suficiente para que "la mitad del scroll" signifique algo real; en
 * "/privacidad" o "/gracias" no aporta nada, y no vale la pena montarlo ahí-.
 *
 * `requestAnimationFrame` como límite de frecuencia, no un `setTimeout` con
 * un número de milisegundos inventado: sea cual sea la velocidad real de
 * scroll del dispositivo, esto nunca calcula más de una vez por fotograma
 * pintado, que es exactamente el límite que importa para no gastar CPU de
 * más -la propia guía de "sin animaciones pesadas" del sitio-.
 */
export function RastreoScroll() {
  useEffect(() => {
    let disparado = false;
    let programado = false;

    function revisar() {
      programado = false;
      if (disparado) return;
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      if (alto <= 0) return; // La página no tiene ni para hacer scroll.
      const avance = window.scrollY / alto;
      if (avance >= 0.5) {
        disparado = true;
        rastrearScroll50();
        window.removeEventListener("scroll", alScrollear);
      }
    }

    function alScrollear() {
      if (programado) return;
      programado = true;
      requestAnimationFrame(revisar);
    }

    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  return null;
}
