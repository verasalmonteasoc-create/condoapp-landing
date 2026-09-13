"use client";

import { SITIO } from "@/contenido/sitio";

/**
 * Carga de Google Analytics 4 y Meta Pixel, y los eventos que se les manda.
 *
 * SOLO SE LLAMA DESPUÉS DE QUE LA PERSONA ACEPTÓ -- ver
 * `ConsentimientoCookies.tsx`, el único sitio que invoca `activarAnalitica`.
 * Este archivo no decide si cargar; solo sabe cómo hacerlo una vez que ya se
 * decidió que sí.
 *
 * Los scripts se inyectan a mano con el DOM, no con <Script> de Next: la
 * decisión de cargarlos ocurre en respuesta a un clic (o a que ya había
 * consentimiento guardado), no en un momento fijo del ciclo de vida de la
 * página, que es para lo que sirve `<Script strategy="...">`.
 */

type FuncionFbq = ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean };

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FuncionFbq;
  }
}

let activada = false;

function cargarGA4(id: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  // `send_page_view: false` en el config inicial, no porque no se quiera la
  // vista de página -sí se quiere-, sino porque en un sitio de una sola
  // página real (todo vive en "/", con anclas) mandarla en cuanto carga el
  // script es exactamente correcto una vez, y automático de ahí en más no
  // hace falta: no hay un router de cliente cambiando de URL sin recargar.
  window.gtag("config", id);
}

/**
 * El fragmento oficial de Meta, adaptado: la función `fbq` se define a mano
 * -es la forma en que Meta la documenta, no una simplificación propia- y
 * SIN el <noscript><img>... de respaldo. Ese respaldo existe para cuando el
 * navegador tiene JavaScript desactivado, pero aquí todo el mecanismo de
 * consentimiento YA depende de JavaScript: si está desactivado, esta función
 * ni se llega a invocar, así que el respaldo no protegería nada.
 */
function cargarMetaPixel(id: string) {
  const f = window;
  if (f.fbq) return;
  const n: FuncionFbq = Object.assign(
    function (...args: unknown[]) {
      (n.queue = n.queue || []).push(args);
    },
    { queue: [] as unknown[], loaded: true },
  );
  f.fbq = n;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  f.fbq("init", id);
  f.fbq("track", "PageView");
}

/** Inyecta lo que haya configurado -- ninguno, uno o los dos. */
export function activarAnalitica(): void {
  if (activada || typeof window === "undefined") return;
  activada = true;
  if (SITIO.gaId) cargarGA4(SITIO.gaId);
  if (SITIO.metaPixelId) cargarMetaPixel(SITIO.metaPixelId);
}

/**
 * Clic en cualquiera de los botones "Solicita una demo" -el de la barra fija
 * y el del hero llaman a esto con un `origen` distinto, para saber cuál
 * convierte más-.
 */
export function rastrearClicDemo(origen: "barra" | "hero"): void {
  window.gtag?.("event", "click_solicitar_demo", { origen });
  window.fbq?.("trackCustom", "ClicSolicitarDemo", { origen });
}

/** Se llega a la mitad de la portada. Se dispara una sola vez por visita. */
export function rastrearScroll50(): void {
  window.gtag?.("event", "scroll_50");
  window.fbq?.("trackCustom", "Scroll50");
}

/**
 * El formulario se envió con éxito -la conversión de verdad-.
 *
 * `generate_lead` y `Lead` son los nombres de evento ESTÁNDAR de GA4 y Meta
 * respectivamente, no inventados: usarlos es lo que permite que Google Ads o
 * Meta Ads reconozcan esto como una conversión de las suyas sin
 * configuración extra, en vez de un evento personalizado que hay que
 * enlazar a mano en cada plataforma.
 *
 * Sin datos personales en los parámetros -nombre, WhatsApp-: lo único que se
 * manda es de dónde vino el lead (los UTM) y cuántos apartamentos tiene el
 * condominio. Mandarle el nombre o el teléfono de alguien a Meta sería
 * activar su "Advanced Matching" sin que la política de privacidad lo
 * mencione, y sin que la persona lo haya sabido nunca.
 */
export function rastrearLead(datos: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  apartamentos?: string;
}): void {
  const valor = datos.apartamentos ? Number(datos.apartamentos) || undefined : undefined;
  window.gtag?.("event", "generate_lead", {
    source: datos.utm_source,
    medium: datos.utm_medium,
    campaign: datos.utm_campaign,
    value: valor,
  });
  window.fbq?.("track", "Lead", {
    utm_source: datos.utm_source,
    utm_medium: datos.utm_medium,
    utm_campaign: datos.utm_campaign,
  });
}
