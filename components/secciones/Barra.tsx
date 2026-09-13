import { Marca } from "@/components/marca/Marca";

/**
 * Barra superior. Fija arriba a propósito: en una página larga, el botón de
 * demo tiene que estar siempre a un toque, no solo al final.
 */
export function Barra() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutro-200 bg-white/97 backdrop-blur">
      <div className="mx-auto flex h-[68px] w-[min(100%-32px,1160px)] items-center gap-4">
        <a href="#inicio" className="inline-flex items-center gap-2.5" aria-label="CondoApp, inicio">
          <Marca className="hidden sm:inline-flex" />
          <Marca soloSimbolo className="sm:hidden" />
        </a>
        <a
          href="#demo"
          className="btn btn-accion btn-sm ml-auto"
        >
          Solicita una demo
        </a>
      </div>
    </header>
  );
}
