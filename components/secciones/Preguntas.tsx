import { IconoMas } from "@/components/marca/Iconos";

// Respuestas verificadas contra lo que la app hace de verdad -- no contra
// lo que "debería" hacer. Ver condoapp/CLAUDE.md y docs/modulos.md.
const PREGUNTAS = [
  {
    p: "¿Es seguro?",
    r: "Sí. Cada condominio ve solo su propia información -aislada a nivel de base de datos, no solo de pantalla-, las contraseñas nunca se guardan en texto plano y cada movimiento queda en un historial que no se puede editar ni borrar, ni siquiera por un administrador del sistema.",
  },
  {
    p: "¿Cuánto tarda la implementación?",
    r: "El condominio se carga en la primera sesión: importas las unidades desde tu Excel actual y puedes emitir la primera cuota el mismo día, con una vista previa antes de confirmar nada. Que todos los propietarios entren al portal depende de cuándo les envíes la invitación a cada uno.",
  },
  {
    p: "¿Funciona en el celular?",
    r: "Sí, se abre desde el navegador de cualquier teléfono, Android o iPhone. El propietario puede agregarla a su pantalla de inicio como una app, sin pasar por ninguna tienda de aplicaciones.",
  },
  {
    p: "¿Los residentes tienen que pagar?",
    r: "No. El propietario no paga nada por usar el portal; entra con la invitación que le da su administración. Lo que se sigue cobrando es lo de siempre: la cuota del condominio.",
  },
  {
    p: "¿Puedo probarlo antes de decidir?",
    r: "Sí -para eso es la demostración: te la damos con un condominio de ejemplo antes de que decidas nada.",
  },
];

export function Preguntas() {
  return (
    <section id="preguntas" className="bg-neutro-50 py-14 dark:bg-noche-950 sm:py-20">
      <div className="mx-auto w-[min(100%-32px,1160px)]">
        <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-marca-700 dark:text-marca-300">
          Preguntas
        </p>
        <h2 className="mt-2 max-w-[22ch] text-[28px] font-black leading-[1.1] tracking-[-0.02em] text-neutro-900 dark:text-noche-100 sm:text-[36px]">
          Antes de que preguntes, esto es lo que responderíamos
        </h2>

        <div className="mt-8 max-w-[800px] border-t border-neutro-200 dark:border-noche-700">
          {PREGUNTAS.map(({ p, r }, i) => (
            <details
              key={p}
              className="group border-b border-neutro-200 dark:border-noche-700"
              open={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[16px] font-bold text-neutro-900 hover:text-marca-700 dark:text-noche-100 dark:hover:text-marca-300 sm:text-[17px]">
                {p}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neutro-100 text-marca-700 transition-transform group-open:rotate-45 dark:bg-noche-900 dark:text-marca-300">
                  <IconoMas />
                </span>
              </summary>
              <p className="max-w-[68ch] pb-6 pr-10 text-base leading-relaxed text-neutro-700 dark:text-noche-400">
                {r}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
