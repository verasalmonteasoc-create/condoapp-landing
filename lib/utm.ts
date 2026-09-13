"use client";

/**
 * Captura de parámetros UTM, para saber de qué campaña viene cada lead.
 *
 * CUÁNDO SE GUARDA, Y CUÁNDO NO
 * -------------------------------
 * Se lee la URL en cada carga de página (se llama desde
 * `ConsentimientoCookies.tsx`, montado en `layout.tsx`), pero solo se
 * SOBRESCRIBE lo guardado si la URL de verdad trae al menos un `utm_*`. Sin
 * esa condición, alguien que hace clic en un anuncio y después navega a
 * "/privacidad" -una URL sin UTMs- borraría el origen real de su propia
 * visita antes de llegar a llenar el formulario.
 *
 * "Último toque con UTM", no "primer toque": si la misma persona vuelve
 * despues por un anuncio distinto, se le atribuye ESE anuncio -es el
 * comportamiento por defecto de Google Ads y Meta Ads en sus propias
 * plataformas, y es lo que un anunciante espera ver al revisar un lead-.
 *
 * SIN VALIDACIÓN, ESTO SERÍA UN HUECO DE SEGURIDAD, NO SOLO DE MARKETING
 * ------------------------------------------------------------------------
 * `utm_source` etc. vienen de la URL, que cualquiera puede escribir a mano
 * -no de un anuncio real-. Igual que se le puso techo a "nombre" y
 * "condominio" en `validacion.ts`, aquí se recorta el largo antes de
 * guardar nada: sin eso, una URL fabricada con un `utm_campaign` de varios
 * miles de caracteres viajaría tal cual hasta Airtable.
 */

export type ParametrosUTM = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const CLAVE = "condoapp_utm";
const LARGO_MAXIMO = 100;

function limpiar(valor: string | null): string | undefined {
  if (!valor) return undefined;
  // \s incluye saltos de línea: un campo de una URL no debería llevar
  // ninguno, y Airtable los guardaría tal cual si no se quitan aquí.
  const recortado = valor.replace(/\s+/g, " ").trim().slice(0, LARGO_MAXIMO);
  return recortado || undefined;
}

/** Lee `?utm_*` de la URL actual y los guarda si trae alguno. */
export function capturarUTM(): void {
  if (typeof window === "undefined") return;
  const parametros = new URLSearchParams(window.location.search);
  const utm: ParametrosUTM = {
    utm_source: limpiar(parametros.get("utm_source")),
    utm_medium: limpiar(parametros.get("utm_medium")),
    utm_campaign: limpiar(parametros.get("utm_campaign")),
  };
  if (utm.utm_source || utm.utm_medium || utm.utm_campaign) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(utm));
    } catch {
      // Modo privado, cuota llena -- perder el UTM no debe romper la visita.
    }
  }
}

/** Lo último guardado, para adjuntarlo al enviar el formulario. */
export function leerUTM(): ParametrosUTM {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? "{}");
  } catch {
    return {};
  }
}
