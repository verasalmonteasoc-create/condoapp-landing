/**
 * Subconjunto de `frontend/components/Iconos.tsx` de la app: solo los que
 * esta portada usa. Mismo trazo (1.75, esquinas redondeadas), sin librería.
 */
type PropsIcono = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export const IconoCheck = ({ className = "h-4 w-4" }: PropsIcono) => (
  <svg {...base} strokeWidth={3} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export const IconoAlerta = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M12 3.5 2.5 20h19z" />
    <path d="M12 9.5v5M12 17.5h.01" />
  </svg>
);

export const IconoEscudo = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M12 2.5 4 6v6c0 5 3.4 8.5 8 9.5 4.6-1 8-4.5 8-9.5V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconoReloj = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

export const IconoRecibo = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M5 3.5h14v17l-2.3-1.6-2.35 1.6-2.35-1.6-2.35 1.6L7.3 18.9 5 20.5z" />
    <path d="M9 8.5h6M9 12.5h6" />
  </svg>
);

export const IconoCampana = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2 7.5-2 7.5h16s-2-1.5-2-7.5" />
    <path d="M10.3 20a2 2 0 0 0 3.4 0" />
  </svg>
);

export const IconoPersonas = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20.5a6.5 6.5 0 0 1 13 0" />
    <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
    <path d="M17.5 14.6a6.5 6.5 0 0 1 4 5.9" />
  </svg>
);

export const IconoCelular = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
    <path d="M10.5 18.5h3" />
  </svg>
);

export const IconoPortal = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="m3 10.5 9-7.5 9 7.5" />
    <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    <path d="M10 21v-6h4v6" />
  </svg>
);

export const IconoRayo = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M13 2.5 4.5 14h6l-1 7.5L19 10h-6z" />
  </svg>
);

export const IconoLlave = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <circle cx="8" cy="8" r="4.5" />
    <path d="m11.5 11.5 8 8M17 17l-2 2M19.5 14.5l-2 2" />
  </svg>
);

export const IconoMas = ({ className = "h-3.5 w-3.5" }: PropsIcono) => (
  <svg {...base} strokeWidth={2.5} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconoWhatsapp = ({ className = "h-[18px] w-[18px]" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.45L3.5 20.5l1.55-4.3A8.5 8.5 0 1 1 20.5 11.5z" />
  </svg>
);

export const IconoAuriculares = ({ className = "h-5 w-5" }: PropsIcono) => (
  <svg {...base} className={className}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
    <rect x="2.5" y="14" width="5" height="6.5" rx="2" />
    <rect x="16.5" y="14" width="5" height="6.5" rx="2" />
  </svg>
);
