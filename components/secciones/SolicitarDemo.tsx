"use client";

import Script from "next/script";
import { useId, useState } from "react";

import { IconoAlerta } from "@/components/marca/Iconos";
import { SITIO } from "@/contenido/sitio";
import { useTurnstile } from "@/lib/useTurnstile";
import { type ErroresSolicitud, type Solicitud, sinErrores, validar } from "@/lib/validacion";
import { leerUTM } from "@/lib/utm";

const VACIO: Solicitud = { nombre: "", whatsapp: "", condominio: "", apartamentos: "" };

type Estado = "editando" | "enviando" | "fallido";

// Lo que lee app/gracias/page.tsx al llegar -de un solo uso, se borra ahí
// mismo en cuanto se lee-. Nunca en la URL: ver el porqué en ese archivo.
const CLAVE_ENTREGA = "condoapp_gracias";

/**
 * El formulario. Ya NO muestra la confirmación en el mismo lugar -antes lo
 * hacía-: al enviarse con éxito navega a "/gracias", ver ese archivo para
 * las dos razones (una pedida, una técnica) de por qué.
 */
export function SolicitarDemo() {
  const [datos, setDatos] = useState<Solicitud>(VACIO);
  const [errores, setErrores] = useState<ErroresSolicitud>({});
  const [estado, setEstado] = useState<Estado>("editando");
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const idResumen = useId();
  // `token` se saca del hook de una vez, en vez de leer `turnstile.token`
  // donde se use: el linter de reglas de hooks no puede ver que ese campo es
  // estado (viene de un `useState` dentro del hook) y no una ref -el mismo
  // objeto también trae `contenedorRef`, que sí lo es-, y marca CUALQUIER
  // acceso encadenado como si fuera leer `.current` en el render.
  // Desestructurar aquí, una sola vez, es lo que el linter reconoce sin dudar
  // como una variable de estado normal.
  const { contenedorRef, token, reiniciar, marcarScriptListo } = useTurnstile(
    SITIO.turnstileSitekey,
  );
  // Señuelo: un campo que ningún humano ve ni llena -está fuera de pantalla,
  // ver el JSX más abajo-, pero que un script que rellena "todo lo que
  // parezca un campo de texto" completa igual. El servidor rechaza en
  // silencio cualquier envío que llegue con esto no vacío.
  const [senuelo, setSenuelo] = useState("");

  function cambiar<K extends keyof Solicitud>(campo: K, valor: string) {
    const siguiente = { ...datos, [campo]: valor };
    setDatos(siguiente);
    // Solo se revalida el campo que ya mostraba un error: mientras la
    // persona sigue escribiendo un campo sano, no tiene sentido interrumpirla
    // con un error que todavía no cometió.
    if (errores[campo]) {
      setErrores((e) => ({ ...e, [campo]: validar(siguiente)[campo] }));
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const erroresAhora = validar(datos);
    setErrores(erroresAhora);
    if (!sinErrores(erroresAhora)) {
      const primero = Object.keys(erroresAhora)[0];
      document.getElementById(`campo-${primero}`)?.focus();
      return;
    }

    if (SITIO.turnstileSitekey && !token) {
      setErrorEnvio("Completa la verificación antes de enviar.");
      return;
    }

    setEstado("enviando");
    setErrorEnvio(null);
    try {
      const utm = leerUTM();
      const res = await fetch("/api/solicitud-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, senuelo, turnstileToken: token, ...utm }),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.error || "No se pudo enviar la solicitud.");
      }
      // La confirmación y el evento de conversión viven en "/gracias", no
      // aquí: se guarda lo mínimo para que esa página pueda saludar por
      // nombre y ofrecer el enlace de WhatsApp, y se navega -reiniciar()
      // corre igual en el `finally` de abajo, pero para entonces la página
      // ya está cambiando, así que no hay ningún parpadeo del formulario
      // "reseteado" antes de irse.
      sessionStorage.setItem(
        CLAVE_ENTREGA,
        JSON.stringify({ nombre: datos.nombre, whatsapp: datos.whatsapp, condominio: datos.condominio }),
      );
      // Navegación completa a propósito, no `router.push()`: `gtag`/`fbq` se
      // inicializan una sola vez, en el layout, y solo mandan una "vista de
      // página" automática en ESE momento -no reaccionan solos a un cambio
      // de ruta del cliente sin cablear el listener de historial de GA4/Meta,
      // que este sitio no trae-. Con `router.push()`, "/gracias" cargaría
      // pero nunca se contaría como una página vista aparte en ninguno de
      // los dos paneles. Con una navegación de verdad, sí.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/gracias";
    } catch (err) {
      setEstado("fallido");
      setErrorEnvio(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la solicitud. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      // Un token de Turnstile es de un solo uso -sirvió o no, hay que pedir
      // uno nuevo para el próximo intento. Sin esto, un reintento tras un
      // error de Airtable fallaría siempre con "verificación inválida" y sin
      // que la persona entienda qué campo tiene que volver a tocar.
      reiniciar();
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-tarjeta border border-neutro-200 bg-white p-6 shadow-elevada dark:border-noche-700 dark:bg-noche-900 dark:shadow-none sm:p-8"
      noValidate
      // Antes `idResumen` se generaba y se le ponía a la propia alerta, pero
      // nada la referenciaba: quedaba huérfano, un id que nadie lee. Ahora
      // el formulario mismo la anuncia -complementa, no reemplaza, el
      // aria-describedby de cada campo, que sigue señalando su propio error-.
      aria-describedby={errorEnvio ? idResumen : undefined}
    >
      {/*
        `lazyOnload`, no `afterInteractive`: el widget no tiene que estar
        listo en el primer segundo de vida de la página -nadie llena un
        formulario de cuatro campos tan rápido-, y cargarlo tarde deja el
        primer renderizado de la portada libre de una petición de red a un
        tercero. El script solo puede venir de challenges.cloudflare.com: es
        justo el origen que permite `script-src` en public/_headers.
      */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={marcarScriptListo}
      />

      <h3 className="text-[20px] font-black tracking-[-0.01em] text-neutro-900 dark:text-noche-100">
        Solicita tu demo gratis
      </h3>

      {/* Señuelo: fuera de la pantalla, no con display:none -algunos
          rastreadores automatizados sí respetan esa propiedad y se lo
          saltan-. `aria-hidden` y `tabIndex={-1}` para que a un lector de
          pantalla o a alguien navegando con teclado ni siquiera les conste
          que existe: nunca debe rellenarlo una persona real. */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="campo-sitio-web">Sitio web</label>
        <input
          id="campo-sitio-web"
          name="sitio-web"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={senuelo}
          onChange={(e) => setSenuelo(e.target.value)}
        />
      </div>

      {errorEnvio && (
        <div className="aviso-error mt-4" role="alert">
          <IconoAlerta className="mt-0.5 h-4 w-4 shrink-0" />
          <span id={idResumen}>{errorEnvio}</span>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label className="etiqueta" htmlFor="campo-nombre">
            Nombre
          </label>
          <input
            id="campo-nombre"
            className="campo"
            type="text"
            autoComplete="name"
            placeholder="María Fernández"
            value={datos.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
            aria-invalid={errores.nombre ? true : undefined}
            aria-describedby={errores.nombre ? "error-nombre" : undefined}
          />
          {errores.nombre && (
            <p id="error-nombre" className="mt-1.5 text-[13px] text-alerta-700 dark:text-alerta-500">
              {errores.nombre}
            </p>
          )}
        </div>

        <div>
          <label className="etiqueta" htmlFor="campo-whatsapp">
            WhatsApp
          </label>
          <input
            id="campo-whatsapp"
            className="campo"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="809 555 0123"
            value={datos.whatsapp}
            onChange={(e) => cambiar("whatsapp", e.target.value)}
            aria-invalid={errores.whatsapp ? true : undefined}
            aria-describedby={errores.whatsapp ? "error-whatsapp" : undefined}
          />
          {errores.whatsapp && (
            <p id="error-whatsapp" className="mt-1.5 text-[13px] text-alerta-700 dark:text-alerta-500">
              {errores.whatsapp}
            </p>
          )}
        </div>

        <div>
          <label className="etiqueta" htmlFor="campo-condominio">
            Nombre del condominio
          </label>
          <input
            id="campo-condominio"
            className="campo"
            type="text"
            autoComplete="organization"
            placeholder="Residencial Los Robles"
            value={datos.condominio}
            onChange={(e) => cambiar("condominio", e.target.value)}
            aria-invalid={errores.condominio ? true : undefined}
            aria-describedby={errores.condominio ? "error-condominio" : undefined}
          />
          {errores.condominio && (
            <p id="error-condominio" className="mt-1.5 text-[13px] text-alerta-700 dark:text-alerta-500">
              {errores.condominio}
            </p>
          )}
        </div>

        <div>
          <label className="etiqueta" htmlFor="campo-apartamentos">
            Cantidad de apartamentos{" "}
            <span className="font-normal text-neutro-500 dark:text-noche-400">(opcional)</span>
          </label>
          <input
            id="campo-apartamentos"
            className="campo"
            type="text"
            inputMode="numeric"
            placeholder="24"
            value={datos.apartamentos}
            onChange={(e) => cambiar("apartamentos", e.target.value)}
            aria-invalid={errores.apartamentos ? true : undefined}
            aria-describedby={errores.apartamentos ? "error-apartamentos" : undefined}
          />
          {errores.apartamentos && (
            <p id="error-apartamentos" className="mt-1.5 text-[13px] text-alerta-700 dark:text-alerta-500">
              {errores.apartamentos}
            </p>
          )}
        </div>

        {SITIO.turnstileSitekey ? (
          <div ref={contenedorRef} />
        ) : (
          // Mismo patrón que el botón de WhatsApp cuando falta el número
          // (contenido/sitio.ts): se avisa en vez de mostrar un widget roto.
          // El servidor de todos modos exige la clave secreta -esto no es la
          // única barrera, solo la señal honesta de que falta configurarla.
          <p className="text-[13px] text-neutro-500 dark:text-noche-400">
            Verificación anti-spam pendiente de configurar.
          </p>
        )}

        <button
          type="submit"
          className="btn btn-accion btn-lg mt-1 w-full"
          disabled={estado === "enviando" || (!!SITIO.turnstileSitekey && !token)}
        >
          {estado === "enviando" ? "Enviando…" : "Enviar solicitud"}
        </button>
        <p className="text-center text-[13px] text-neutro-500 dark:text-noche-400">
          Te contactamos en menos de 24 horas. Sin compromiso.
        </p>
      </div>
    </form>
  );
}
