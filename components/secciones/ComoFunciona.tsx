// "Invita a residentes y seguridad" se ajustó a "Invita a propietarios":
// el portal de acceso (backend/app/services/portal_accesos.py) invita al
// propietario, que es a quien hoy se le puede dar entrada. No existe un
// flujo de invitación para guardias de seguridad.
const PASOS = [
  {
    titulo: "Crea tu condominio",
    detalle: "Unidades, propietarios y los saldos con que vienen, importados desde tu Excel o CSV actual.",
  },
  {
    titulo: "Invita a propietarios",
    detalle: "Cada propietario recibe su acceso al portal y ve lo que debe, sin que tengas que explicárselo por teléfono.",
  },
  {
    titulo: "Empieza a gestionar",
    detalle: "Emite la primera cuota con vista previa, registra pagos y lleva la contabilidad desde el mismo lugar.",
  },
];

export function ComoFunciona() {
  return (
    <section className="border-t border-neutro-200 bg-white py-14 sm:py-20">
      <div className="mx-auto w-[min(100%-32px,1160px)]">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-marca-700">Cómo funciona</p>
        <h2 className="mt-2 max-w-[22ch] text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-neutro-900 sm:text-[36px]">
          Tres pasos, no una migración
        </h2>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {PASOS.map(({ titulo, detalle }, i) => (
            <li key={titulo}>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-marca-700 text-[16px] font-black text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 text-[19px] font-black leading-tight tracking-[-0.01em] text-neutro-900">
                {titulo}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-neutro-700">{detalle}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
