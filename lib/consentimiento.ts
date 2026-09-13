"use client";

/**
 * El sí/no de la persona sobre analítica y píxeles publicitarios.
 *
 * Por qué existe este archivo -y por qué esto NO es opcional aquí, aunque el
 * pedido lo marcara como "recomendado"-: `app/privacidad/page.tsx` ya dice,
 * en la sección "Qué guardamos", *"Nada más: no pedimos ni guardamos ningún
 * otro dato"*. Cargar Google Analytics y Meta Pixel sin preguntar antes
 * convertiría esa frase en falsa el mismo día que se despliegue -los dos
 * ponen sus propias cookies y mandan datos de navegación a Google y a Meta,
 * sin que la persona lo haya sabido nunca-. La política ya se amplió para
 * mencionarlos (ver esa página), pero mencionarlos no basta: hay que
 * preguntar ANTES de que se carguen, no después.
 */

export type Consentimiento = "aceptado" | "rechazado";

const CLAVE = "condoapp_consentimiento_analitica";

export function leerConsentimiento(): Consentimiento | null {
  if (typeof window === "undefined") return null;
  const valor = localStorage.getItem(CLAVE);
  return valor === "aceptado" || valor === "rechazado" ? valor : null;
}

export function guardarConsentimiento(valor: Consentimiento): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLAVE, valor);
  } catch {
    // Sin almacenamiento no hay dónde recordar la elección; en la próxima
    // carga se preguntará de nuevo. Molesto, no roto.
  }
}
