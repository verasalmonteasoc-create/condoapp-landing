import { Barra } from "@/components/secciones/Barra";
import { Beneficios } from "@/components/secciones/Beneficios";
import { Cierre } from "@/components/secciones/Cierre";
import { ComoFunciona } from "@/components/secciones/ComoFunciona";
import { Pie } from "@/components/secciones/Pie";
import { Portada } from "@/components/secciones/Portada";
import { Preguntas } from "@/components/secciones/Preguntas";
import { ProblemaSolucion } from "@/components/secciones/ProblemaSolucion";

// PENDIENTE: no hay sección de prueba social. El testimonio que se propuso
// para esta portada no venía de un cliente real, y esta página no publica
// una cita inventada. Se agrega en cuanto exista una de verdad.
export default function PaginaPrincipal() {
  return (
    <>
      <Barra />
      <main>
        <Portada />
        <ProblemaSolucion />
        <Beneficios />
        <ComoFunciona />
        <Preguntas />
        <Cierre />
      </main>
      <Pie />
    </>
  );
}
