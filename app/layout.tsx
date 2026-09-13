import type { Metadata } from "next";
import { Lato } from "next/font/google";

import { ConsentimientoCookies } from "@/components/ConsentimientoCookies";
import { SITIO } from "@/contenido/sitio";

import "./globals.css";

/**
 * `next/font/google` descarga a Lato en el momento del build y la sirve
 * desde el propio dominio -- a diferencia de la app principal, que la
 * enlaza en vivo desde fonts.googleapis.com (frontend/app/layout.tsx) para
 * no atarse a `next/font` en un proyecto que sí tiene servidor. Aquí, al
 * exportarse como sitio estático, alojarla local es estrictamente mejor:
 * ni depende de que el visitante llegue a Google Fonts, ni añade una
 * petición externa al cargar la página.
 */
const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: "CondoApp — Deja el WhatsApp del condominio atrás",
  description:
    "CondoApp organiza residentes, cuotas, incidencias y reservas en una sola app. Solicita una demo gratis para tu condominio en República Dominicana.",
  openGraph: {
    title: "CondoApp — Deja el WhatsApp del condominio atrás",
    description:
      "Residentes, cuotas, incidencias y reservas en una sola app. Sin mensajes perdidos, sin Excel.",
    locale: "es_DO",
    type: "website",
  },
};

export default function RaizIdioma({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-DO" className={lato.variable}>
      <body className="font-sans">
        {children}
        <ConsentimientoCookies />
      </body>
    </html>
  );
}
