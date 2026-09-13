import { SITIO } from "@/contenido/sitio";

/**
 * Copiado de `frontend/components/Marca.tsx` de la app -- mismo símbolo,
 * mismas proporciones. Quien vea esta portada y luego entre a la app no
 * debe notar un cambio de identidad a mitad de camino.
 */
type PropsMarca = {
  variante?: "claro" | "oscuro";
  soloSimbolo?: boolean;
  className?: string;
};

export function Marca({ variante = "oscuro", soloSimbolo = false, className = "" }: PropsMarca) {
  const claro = variante === "claro";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[10px] ${
          claro ? "bg-white/15 ring-1 ring-white/25" : "bg-marca-700"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4.5 21V6.2a1.7 1.7 0 0 1 1.7-1.7h5.6a1.7 1.7 0 0 1 1.7 1.7V21" />
          <path d="M13.5 11h4.3a1.7 1.7 0 0 1 1.7 1.7V21" />
          <path d="M2.5 21h19" />
          <path d="M7.6 8.4h2.6M7.6 12.2h2.6M7.6 16h2.6" />
        </svg>
      </span>
      {!soloSimbolo && (
        <span className="flex flex-col leading-none">
          <span
            className={`text-[17px] font-black tracking-tight ${claro ? "text-white" : "text-marca-700"}`}
          >
            {SITIO.nombre}
          </span>
          <span
            className={`mt-1 text-[10px] font-bold uppercase tracking-[0.13em] ${
              claro ? "text-marca-200" : "text-neutro-500"
            }`}
          >
            {SITIO.descriptor}
          </span>
        </span>
      )}
    </span>
  );
}
