import { SolicitarDemo } from "@/components/secciones/SolicitarDemo";

/**
 * Banda oscura de cierre: mismo degradado que el panel de acceso de la app
 * (frontend/tailwind.config.js -> backgroundImage.marca-panel), para que la
 * página termine en la misma "puerta" azul por la que luego se entra a
 * trabajar todos los días.
 */
export function Cierre() {
  return (
    <section id="demo" className="banda-cierre py-14 text-white sm:py-20">
      <div className="mx-auto grid w-[min(100%-32px,1160px)] gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <h2 className="max-w-[18ch] text-[30px] font-black leading-[1.08] tracking-[-0.02em] sm:text-[40px]">
            ¿Listo para dejar el WhatsApp atrás?
          </h2>
          <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-marca-100">
            Solicita una demo y descubre cómo CondoApp puede simplificar tu administración.
          </p>
        </div>
        <SolicitarDemo />
      </div>
    </section>
  );
}
