"use client";

import { useId, useState } from "react";

import { IconoAlerta, IconoCheck, IconoWhatsapp } from "@/components/marca/Iconos";
import { enlaceWhatsapp } from "@/contenido/sitio";
import {
  type ErroresSolicitud,
  type Solicitud,
  formatearTelefono,
  sinErrores,
  telefonoRD,
  validar,
} from "@/lib/validacion";

const VACIO: Solicitud = { nombre: "", whatsapp: "", condominio: "", apartamentos: "" };

type Estado = "editando" | "enviando" | "enviado" | "fallido";

/**
 * CTA final + formulario. Un solo componente porque comparten un mismo
 * estado de envío: el título tiene que reflejar si ya se mandó la
 * solicitud, no solo el formulario.
 */
export function SolicitarDemo() {
  const [datos, setDatos] = useState<Solicitud>(VACIO);
  const [errores, setErrores] = useState<ErroresSolicitud>({});
  const [estado, setEstado] = useState<Estado>("editando");
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const idResumen = useId();

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

    setEstado("enviando");
    setErrorEnvio(null);
    try {
      const res = await fetch("/api/solicitud-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!res.ok) {
        const cuerpo = await res.json().catch(() => null);
        throw new Error(cuerpo?.error || "No se pudo enviar la solicitud.");
      }
      setEstado("enviado");
    } catch (err) {
      setEstado("fallido");
      setErrorEnvio(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la solicitud. Revisa tu conexión e intenta de nuevo.",
      );
    }
  }

  if (estado === "enviado") {
    const digitos = telefonoRD(datos.whatsapp);
    const wa = enlaceWhatsapp(
      `Hola, soy ${datos.nombre.split(/\s+/)[0]} de ${datos.condominio}. Acabo de solicitar una demo de CondoApp.`,
    );
    return (
      <div
        className="rounded-tarjeta border border-neutro-200 bg-white p-6 shadow-elevada dark:border-noche-700 dark:bg-noche-900 dark:shadow-none sm:p-8"
        tabIndex={-1}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-exito-100 text-exito-700">
          <IconoCheck className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-[22px] font-black tracking-[-0.01em] text-neutro-900 dark:text-noche-100">
          Recibimos tu solicitud, {datos.nombre.split(/\s+/)[0]}.
        </h3>
        <p className="mt-2 text-base leading-relaxed text-neutro-700 dark:text-noche-400">
          Te contactamos al {digitos ? formatearTelefono(digitos) : datos.whatsapp} en menos de 24
          horas. Sin compromiso.
        </p>
        {wa && (
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-secundario mt-6">
            <IconoWhatsapp />
            Escribir por WhatsApp ahora
          </a>
        )}
      </div>
    );
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
      <h3 className="text-[20px] font-black tracking-[-0.01em] text-neutro-900 dark:text-noche-100">
        Solicita tu demo gratis
      </h3>

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

        <button type="submit" className="btn btn-accion btn-lg mt-1 w-full" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviar solicitud"}
        </button>
        <p className="text-center text-[13px] text-neutro-500 dark:text-noche-400">
          Te contactamos en menos de 24 horas. Sin compromiso.
        </p>
      </div>
    </form>
  );
}
