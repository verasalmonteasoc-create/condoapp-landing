import Link from "next/link";

import { Marca } from "@/components/marca/Marca";

export default function NoEncontrado() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <Marca className="mx-auto" />
        <p className="mt-8 text-[15px] font-bold uppercase tracking-[0.1em] text-neutro-500 dark:text-noche-400">
          Error 404
        </p>
        <h1 className="mt-2 text-[26px] font-black text-neutro-900 dark:text-noche-100">
          Esta página no existe
        </h1>
        <Link href="/" className="btn btn-accion btn-lg mt-6 inline-flex">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
