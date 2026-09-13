import {
  IconoCelular,
  IconoEscudo,
  IconoPersonas,
  IconoRayo,
  IconoRecibo,
} from "@/components/marca/Iconos";

// Cada línea de apoyo describe algo que ya está construido -- ver
// docs/modulos.md en el repositorio de la app -- y no una intención.
const BENEFICIOS = [
  {
    Icono: IconoRayo,
    titulo: "Ahorra tiempo",
    detalle: "Emites cuotas y generas recibos sin armar el reporte del mes a mano.",
  },
  {
    Icono: IconoRecibo,
    titulo: "Cobra más rápido",
    detalle: "Antigüedad de saldos por unidad y recordatorios con la tasa de mora que tu asamblea aprobó.",
  },
  {
    Icono: IconoPersonas,
    titulo: "Residentes informados",
    detalle: "Cada propietario ve su estado de cuenta y los anuncios de la administración sin llamar a la oficina.",
  },
  {
    Icono: IconoEscudo,
    titulo: "Incidencias resueltas",
    detalle: "Cada reporte queda con su estado y quién lo atendió, sin perderse en un chat.",
  },
  {
    Icono: IconoCelular,
    titulo: "Todo en el celular",
    detalle: "Se abre desde el navegador del teléfono; el propietario no instala nada de una tienda de apps.",
  },
];

export function Beneficios() {
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto w-[min(100%-32px,1160px)]">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-marca-700">Beneficios</p>
        <h2 className="mt-2 max-w-[26ch] text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-neutro-900 sm:text-[36px]">
          Lo que cambia desde la primera semana
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFICIOS.map(({ Icono, titulo, detalle }) => (
            <div key={titulo} className="rounded-tarjeta border border-neutro-200 bg-white p-6 shadow-tarjeta">
              <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-marca-50 text-marca-700">
                <Icono className="h-[22px] w-[22px]" />
              </span>
              <h3 className="mt-4 text-[17px] font-black leading-tight tracking-[-0.01em] text-neutro-900">
                {titulo}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-neutro-700">{detalle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
