import { IconoAuriculares, IconoCelular, IconoEscudo } from "@/components/marca/Iconos";

const CONFIANZA = [
  { Icono: IconoEscudo, texto: "Probado en condominios dominicanos" },
  { Icono: IconoCelular, texto: "Funciona en Android y iPhone" },
  { Icono: IconoAuriculares, texto: "Soporte en español" },
];

/**
 * Hero + barra de confianza. Van juntos porque la barra de confianza es la
 * primera objeción que resuelve ("¿esto es de verdad, o es una promesa
 * bonita?") y tiene que leerse en el mismo primer vistazo que el título.
 */
export function Portada() {
  return (
    <section id="inicio" className="pb-14 pt-12 sm:pb-20 sm:pt-16">
      <div className="mx-auto w-[min(100%-32px,1160px)]">
        <h1 className="max-w-[16ch] text-[38px] font-black leading-[1.04] tracking-[-0.03em] text-neutro-900 sm:text-[52px] lg:text-[60px]">
          ¿Todavía administras tu condominio por WhatsApp?
        </h1>

        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-neutro-700 sm:text-[19px]">
          CondoApp organiza residentes, cuotas, incidencias y reservas en una sola app.
          Sin mensajes perdidos, sin Excel.
        </p>

        <div className="mt-7 flex flex-col items-start gap-3">
          <a href="#demo" className="btn btn-accion btn-lg w-full sm:w-auto">
            Solicita una demo gratis
          </a>
          <p className="text-[13.5px] text-neutro-500">
            Te contactamos en menos de 24 horas. Sin compromiso.
          </p>
        </div>

        <ul className="mt-10 flex flex-col gap-3 border-t border-neutro-200 pt-8 sm:flex-row sm:gap-8">
          {CONFIANZA.map(({ Icono, texto }) => (
            <li key={texto} className="flex items-center gap-2.5 text-[14.5px] font-bold text-neutro-700">
              <Icono className="h-5 w-5 shrink-0 text-marca-700" />
              {texto}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
