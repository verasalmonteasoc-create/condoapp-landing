import { Marca } from "@/components/marca/Marca";

/**
 * Barra superior. Fija arriba a propósito: en una página larga, el botón de
 * demo tiene que estar siempre a un toque, no solo al final.
 */
export function Barra() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutro-200 bg-white/97 backdrop-blur dark:border-noche-700 dark:bg-noche-950/97">
      <div className="mx-auto flex h-[68px] w-[min(100%-32px,1160px)] items-center gap-4">
        <a href="#inicio" className="inline-flex items-center gap-2.5" aria-label="CondoApp, inicio">
          {/* El toggle de visibilidad va en un span propio, no en el className
              de Marca. Marca ya trae "inline-flex" fijo en su propia raíz
              (para no depender de que cada sitio se lo pase), y Tailwind v4
              genera `.hidden{display:none}` ANTES que `.inline-flex{...}` en
              la hoja de estilos -- orden inverso al de Tailwind v3, que es
              con el que se probó este mismo patrón en la app real. Puesto en
              el mismo elemento, `inline-flex` gana la pelea de cascada a
              cualquier ancho y `hidden` queda muerto: las dos versiones del
              logo se veían a la vez en móvil. Aquí el span envolvente no
              lleva ningún otro `display`, así que no hay con qué competir. */}
          <span className="hidden sm:inline-flex">
            <Marca />
          </span>
          <span className="sm:hidden">
            <Marca soloSimbolo />
          </span>
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
