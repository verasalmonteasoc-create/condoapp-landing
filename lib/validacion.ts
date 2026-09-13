/**
 * Reglas del formulario de demo.
 *
 * Viven aparte de `FormularioDemo.tsx` a propósito: la Pages Function que
 * recibe el envío (`functions/api/solicitud-demo.ts`) importa este mismo
 * archivo. Un campo que el navegador exige pero el servidor no comprueba es
 * una validación decorativa -- basta con desactivar JavaScript, o llamar a
 * la función directo, para saltarla.
 */

export type Solicitud = {
  nombre: string;
  whatsapp: string;
  condominio: string;
  apartamentos: string;
};

export type ErroresSolicitud = Partial<Record<keyof Solicitud, string>>;

/**
 * Normaliza un teléfono dominicano a 10 dígitos, sin el "1" de país si
 * alguien lo incluyó. Devuelve null si no tiene forma de número de RD.
 */
export function telefonoRD(valor: string): string | null {
  let digitos = (valor || "").replace(/\D/g, "");
  if (digitos.length === 11 && digitos.startsWith("1")) digitos = digitos.slice(1);
  if (digitos.length !== 10) return null;
  if (!/^(809|829|849)/.test(digitos)) return null;
  return digitos;
}

export function formatearTelefono(digitos: string): string {
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`;
}

/**
 * Valida una solicitud completa. Se usa igual en el navegador (para marcar
 * el campo antes de enviar) y en la Function (para no confiar en lo que
 * llegue). Los mensajes están en español porque los lee directamente quien
 * llena el formulario, no un programador.
 */
// Solo había mínimos: un POST directo a la Function -sin pasar por este
// formulario- podía mandar un "nombre" de varios megabytes. No es una
// diferencia cosmética: ese texto viaja tal cual a Airtable, y una fila
// gigante gastaba cuota de la API por una sola solicitud falsa.
const LARGO_MAXIMO = { nombre: 80, condominio: 120 } as const;

export function validar(datos: Solicitud): ErroresSolicitud {
  const errores: ErroresSolicitud = {};

  if (datos.nombre.trim().length < 3) {
    errores.nombre = "Escribe tu nombre y apellido para saber a quién buscar.";
  } else if (datos.nombre.trim().length > LARGO_MAXIMO.nombre) {
    errores.nombre = `No puede pasar de ${LARGO_MAXIMO.nombre} caracteres.`;
  }

  if (!telefonoRD(datos.whatsapp)) {
    errores.whatsapp = "Escribe un número de 10 dígitos que empiece por 809, 829 u 849.";
  }

  if (datos.condominio.trim().length < 2) {
    errores.condominio = "Escribe el nombre del condominio o de tu administradora.";
  } else if (datos.condominio.trim().length > LARGO_MAXIMO.condominio) {
    errores.condominio = `No puede pasar de ${LARGO_MAXIMO.condominio} caracteres.`;
  }

  const apto = datos.apartamentos.trim();
  if (apto && (!/^\d+$/.test(apto) || Number(apto) < 1 || Number(apto) > 5000)) {
    errores.apartamentos = "Escribe solo el número de apartamentos, por ejemplo 24.";
  }

  return errores;
}

export function sinErrores(errores: ErroresSolicitud): boolean {
  return Object.keys(errores).length === 0;
}
