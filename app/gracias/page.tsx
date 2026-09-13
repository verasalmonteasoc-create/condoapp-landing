"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Marca } from "@/components/marca/Marca";
import { IconoCheck, IconoWhatsapp } from "@/components/marca/Iconos";
import { rastrearLead } from "@/lib/analitica";
import { enlaceWhatsapp } from "@/contenido/sitio";
import { formatearTelefono, telefonoRD } from "@/lib/validacion";
import { leerUTM } from "@/lib/utm";

const CLAVE_ENTREGA = "condoapp_gracias";

type Entrega = { nombre: string; whatsapp: string; condominio: string };

/**
 * Por qué una página aparte, y no el panel "enviado" que mostraba
 * `SolicitarDemo.tsx` en el mismo lugar del formulario -así funcionaba
 * hasta ahora-:
 *
 *   1. Se pidió explícitamente una "página de gracias con evento de
 *      conversión" -algunas configuraciones de Google Ads / Meta Ads solo
 *      saben medir conversión por URL visitada, no por evento de
 *      JavaScript; tener una página de verdad cubre ese caso también.
 *   2. Es más CONFIABLE: disparar `gtag`/`fbq` y navegar a otra URL casi al
 *      mismo tiempo -como hacía el código anterior antes de este cambio- le
 *      da al navegador la oportunidad de cortar esa petición a mitad de
 *      camino. Aquí el evento se dispara DESPUÉS de que la navegación ya
 *      terminó, sin nada compitiendo con la petición.
 *
 * LOS DATOS NO VIAJAN EN LA URL
 * -------------------------------
 * `SolicitarDemo.tsx` guarda el nombre en `sessionStorage` antes de navegar
 * -no en "?nombre=...&whatsapp=..."-. Un query string es exactamente lo que
 * un píxel de analítica suele mandar de vuelta a su servidor como parte del
 * contexto de la página ("en qué URL ocurrió esto"): poner el nombre y el
 * teléfono de un lead ahí los habría mandado a Google y a Meta sin que la
 * política de privacidad lo dijera en ningún lado.
 */
export default function PaginaGracias() {
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [comprobado, setComprobado] = useState(false);

  useEffect(() => {
    const guardado = sessionStorage.getItem(CLAVE_ENTREGA);
    sessionStorage.removeItem(CLAVE_ENTREGA); // De un solo uso.
    // Igual que en ConsentimientoCookies.tsx: `sessionStorage` no existe en
    // el prerenderizado estático, así que no hay forma de saber esto antes
    // de montar en el navegador. Aquí es todavía más claro que es el caso
    // correcto de la regla de abajo: esta página no tiene NINGÚN HTML
    // "correcto" que exportar de antemano -su contenido depende de un
    // traspaso que solo existe si alguien acaba de enviar el formulario-,
    // así que no hay alternativa sin efecto que tenga sentido.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setComprobado(true);
    if (!guardado) return; // Alguien llegó aquí sin enviar el formulario.

    try {
      const datos: Entrega = JSON.parse(guardado);
      setEntrega(datos);
      // La conversión se registra SOLO si de verdad hubo una entrega que
      // leer -nunca por visitar esta URL a secas-, para no inflar el conteo
      // de leads con quien solo cayó aquí por curiosidad o por un enlace
      // guardado de una visita anterior.
      const utm = leerUTM();
      rastrearLead({ ...utm });
    } catch {
      // JSON corrupto -no debería pasar nunca-: se trata como si no
      // hubiera entrega, en vez de reventar la página.
    }
  }, []);

  const digitos = entrega ? telefonoRD(entrega.whatsapp) : null;
  const wa = entrega
    ? enlaceWhatsapp(
        `Hola, soy ${entrega.nombre.split(/\s+/)[0]} de ${entrega.condominio}. Acabo de solicitar una demo de CondoApp.`,
      )
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-[min(100%-32px,560px)] flex-col items-center justify-center py-14 text-center">
      <Marca className="mb-8" />
      <span className="grid h-14 w-14 place-items-center rounded-full bg-exito-100 text-exito-700">
        <IconoCheck className="h-7 w-7" />
      </span>

      {/* `comprobado` evita mostrar el mensaje genérico un instante antes de
          saber si sí hay una entrega que leer -la misma razón por la que
          ConsentimientoCookies espera antes de decidir qué mostrar-. */}
      {comprobado && (
        <>
          <h1 className="mt-6 text-[26px] font-black tracking-[-0.01em] text-neutro-900 dark:text-noche-100 sm:text-[30px]">
            {entrega ? `Recibimos tu solicitud, ${entrega.nombre.split(/\s+/)[0]}.` : "¡Gracias!"}
          </h1>
          <p className="mt-3 max-w-[46ch] text-base leading-relaxed text-neutro-700 dark:text-noche-400">
            {entrega
              ? `Te contactamos al ${digitos ? formatearTelefono(digitos) : entrega.whatsapp} en menos de 24 horas. Sin compromiso.`
              : "Si acabas de enviar el formulario, revisa tu WhatsApp en las próximas 24 horas."}
          </p>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secundario mt-7"
            >
              <IconoWhatsapp />
              Escribir por WhatsApp ahora
            </a>
          )}
          <Link href="/" className="mt-8 text-[14px] font-bold text-marca-700 dark:text-marca-300">
            Volver al inicio
          </Link>
        </>
      )}
    </main>
  );
}
