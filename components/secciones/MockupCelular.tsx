import { IconoAlerta, IconoCheck, IconoRecibo } from "@/components/marca/Iconos";

/**
 * El celular del hero: no es una fotografía, es HTML y CSS.
 *
 * POR QUÉ, EN VEZ DE UN PLACEHOLDER DE IMAGEN
 * --------------------------------------------
 * Todavía no hay una captura de pantalla real que mostrar. La alternativa
 * obvia -un rectángulo gris con "imagen próximamente"- se ve a medio hacer
 * en una página que ya está en producción, y una captura de una pantalla que
 * no existe sería inventar una interfaz que nadie construyó. Este mockup no
 * es ninguna de las dos cosas: reproduce el panel real de la app (mismos
 * colores, misma disposición que `frontend/components/VistaProducto.tsx`)
 * con datos de ejemplo, así que es honesto sobre qué se ve al entrar sin
 * necesitar un archivo de imagen.
 *
 * Efecto secundario bueno para "optimiza la velocidad": esto pesa lo que
 * pesa el marcado, cero peticiones de red, cero decodificación de imagen.
 *
 * El contenido de la pantalla queda en los colores normales (claros) de la
 * app en los DOS temas del sitio -la app en sí no tiene modo oscuro todavía,
 * así que mostrarla oscura sería mentir sobre cómo se ve realmente-. Lo que
 * sí cambia con el tema del sitio es el reflejo del cristal, apenas.
 *
 * CUANDO HAYA UNA CAPTURA DE VERDAD
 * ----------------------------------
 * Se cambia este archivo entero por un `<Image>` de `next/image` dentro del
 * mismo marco de `<div className="marco-celular">...</div>`, con
 * `loading="lazy"` si no va en el hero, y un `.webp` exportado a mano -el
 * export estático de este sitio no tiene el servidor de optimización de
 * Next, así que la conversión a WebP no ocurre sola-. Nada más se entera.
 */
export function MockupCelular() {
  return (
    <div className="relative mx-auto w-[240px] sm:w-[260px]" aria-hidden="true">
      {/* Marco del teléfono. El bisel se queda oscuro en los dos temas del
          sitio -es plástico, no interfaz-, como el de un celular real. */}
      <div className="relative overflow-hidden rounded-[2.25rem] border-[6px] border-neutro-900 bg-neutro-900 shadow-elevada dark:border-black">
        {/* Isla de cámara */}
        <div className="absolute left-1/2 top-2.5 z-10 h-[18px] w-[76px] -translate-x-1/2 rounded-full bg-neutro-900 dark:bg-black" />

        {/* Pantalla: el panel real de la app, en sus colores de siempre.
            `flex-col` + la barra de pestañas en `mt-auto` la ancla al fondo
            de verdad de la pantalla -sin esto, como el contenido de arriba
            no llena todo el alto 9:19.5 de un teléfono, quedaba un hueco en
            blanco debajo que ninguna captura real tendría-. */}
        <div className="relative flex aspect-[9/19.5] flex-col overflow-hidden rounded-[1.65rem] bg-neutro-50">
          {/* Barra de la app */}
          <div className="flex items-center justify-between bg-marca-700 px-3.5 pb-2.5 pt-8">
            {/* Mismo símbolo que Marca.tsx, no un ícono nuevo: es la misma
                torre en miniatura la que identifica la marca en todas
                partes. */}
            <span className="grid h-6 w-6 place-items-center rounded-[7px] bg-white/15">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 21V6.2a1.7 1.7 0 0 1 1.7-1.7h5.6a1.7 1.7 0 0 1 1.7 1.7V21" />
                <path d="M13.5 11h4.3a1.7 1.7 0 0 1 1.7 1.7V21" />
                <path d="M2.5 21h19" />
                <path d="M7.6 8.4h2.6M7.6 12.2h2.6M7.6 16h2.6" />
              </svg>
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-bold text-white">
              Torre Central
            </span>
          </div>

          {/* Cifras del mes, igual que el panel real */}
          <div className="grid grid-cols-2 gap-2 p-3">
            <div className="rounded-[10px] border border-neutro-200 bg-white p-2.5">
              <p className="text-[7.5px] font-bold uppercase tracking-wide text-neutro-500">
                Cobrado
              </p>
              <p className="mt-1 text-[15px] font-black tracking-tight text-exito-700">RD$105K</p>
            </div>
            <div className="rounded-[10px] border border-neutro-200 bg-white p-2.5">
              <p className="text-[7.5px] font-bold uppercase tracking-wide text-neutro-500">
                Por cobrar
              </p>
              <p className="mt-1 text-[15px] font-black tracking-tight text-neutro-900">RD$16.8K</p>
            </div>
          </div>

          {/* Incidencias, con su estado -el mismo lenguaje visual que
              "Incidencias con seguimiento" promete en el texto de al lado */}
          <div className="mx-3 overflow-hidden rounded-[10px] border border-neutro-200 bg-white">
            <p className="border-b border-neutro-100 px-2.5 py-2 text-[8px] font-bold uppercase tracking-wide text-neutro-500">
              Incidencias recientes
            </p>
            {[
              { texto: "Fuga en azotea, torre B", estado: "Resuelta" },
              { texto: "Portón peatonal no cierra", estado: "En curso" },
            ].map(({ texto, estado }) => (
              <div
                key={texto}
                className="flex items-center gap-1.5 border-b border-neutro-50 px-2.5 py-2 last:border-0"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    estado === "Resuelta" ? "bg-exito-500" : "bg-accion-500"
                  }`}
                />
                <span className="flex-1 truncate text-[9px] text-neutro-700">{texto}</span>
              </div>
            ))}
          </div>

          {/* Confirmación de cobro, para que el celular tambien respalde
              "recordatorios que salen solos" */}
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-[10px] border border-exito-100 bg-exito-50 px-2.5 py-2">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-exito-100 text-exito-700">
              <IconoCheck className="h-2.5 w-2.5" />
            </span>
            <span className="text-[8.5px] font-bold text-exito-700">Cuota de sept. cobrada</span>
          </div>

          {/* Barra de pestañas. Las mismas tres secciones que este teléfono
              ya muestra -Panel, Cuotas, Incidencias-, no íconos inventados. */}
          <div className="mt-auto flex items-center justify-around border-t border-neutro-200 bg-white px-2 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[9px] bg-marca-50 text-marca-700">
              <svg
                viewBox="0 0 24 24"
                className="h-[15px] w-[15px]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7.5" height="8.5" rx="1.3" />
                <rect x="13.5" y="3" width="7.5" height="5" rx="1.3" />
                <rect x="13.5" y="11" width="7.5" height="10" rx="1.3" />
                <rect x="3" y="14.5" width="7.5" height="6.5" rx="1.3" />
              </svg>
            </span>
            <IconoRecibo className="h-[18px] w-[18px] text-neutro-400" />
            <IconoAlerta className="h-[18px] w-[18px] text-neutro-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
