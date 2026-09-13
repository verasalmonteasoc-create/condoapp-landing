import { Marca } from "@/components/marca/Marca";
import { SITIO } from "@/contenido/sitio";

export function Pie() {
  return (
    <footer className="border-t border-neutro-200 bg-white py-10 dark:border-noche-700 dark:bg-noche-950">
      <div className="mx-auto flex w-[min(100%-32px,1160px)] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Marca />
          <p className="mt-2 text-[13.5px] text-neutro-500 dark:text-noche-400">
            Administración de condominios hecha en República Dominicana.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] font-bold text-neutro-700 dark:text-noche-100">
          <a href="#preguntas" className="hover:text-marca-700 dark:hover:text-marca-300">
            Preguntas
          </a>
          <a href="#demo" className="hover:text-marca-700 dark:hover:text-marca-300">
            Solicitar demo
          </a>
          <a href={SITIO.urlApp + "/login"} className="hover:text-marca-700 dark:hover:text-marca-300">
            Iniciar sesión
          </a>
          <a href="/privacidad" className="hover:text-marca-700 dark:hover:text-marca-300">
            Privacidad
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-6 w-[min(100%-32px,1160px)] border-t border-neutro-100 pt-5 text-[12.5px] text-neutro-500 dark:border-noche-700 dark:text-noche-400">
        © {new Date().getFullYear()} {SITIO.nombre}
      </p>
    </footer>
  );
}
