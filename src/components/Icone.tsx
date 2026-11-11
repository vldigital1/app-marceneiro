// Ícones de traço simples usados nas aulas (24×24).
const P: Record<string, React.ReactNode> = {
  bancada: (
    <>
      <path d="M3 8h18v3H3z" />
      <path d="M5 11v9M19 11v9M5 16h14" />
    </>
  ),
  ergonomia: (
    <>
      <circle cx="7" cy="4.5" r="1.8" />
      <path d="M7 6.5v6l-2 7M7 12.5l2 7M7 8.5l4 3" />
      <path d="M12 11h9M14 11v9M20 11v9" />
    </>
  ),
  serra: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </>
  ),
  furadeira: (
    <>
      <path d="M3 7h11v5H3z" />
      <path d="M14 9h4M18 8.5h3M7 12l-1 8h4l1-8" />
    </>
  ),
  trena: (
    <>
      <rect x="3" y="7" width="11" height="11" rx="2" />
      <circle cx="8.5" cy="12.5" r="2.5" />
      <path d="M14 15h7M17 15v-2M20 15v-2" />
    </>
  ),
  esquadro: <path d="M4 4v16h16M4 4l4 0M8 4v12h12v4" />,
  lixa: (
    <>
      <rect x="4" y="8" width="16" height="9" rx="2" />
      <path d="M7 8V5h10v3M6 20h12" strokeDasharray="1.5 1.5" />
    </>
  ),
  grampo: <path d="M6 3h4v18H6zM10 6h8v3M10 18h8v-3M18 9v6" />,
  oculos: (
    <>
      <circle cx="7" cy="13" r="3.5" />
      <circle cx="17" cy="13" r="3.5" />
      <path d="M10.5 13h3M3.5 12 2 9M20.5 12 22 9" />
    </>
  ),
  ouvido: <path d="M8 9a4 4 0 1 1 8 0c0 3-3 4-3 7a2.5 2.5 0 0 1-5 0M10.5 10a1.5 1.5 0 0 1 3 0" />,
  mascara: <path d="M4 10c3-2 13-2 16 0v3c-1 4-5 6-8 6s-7-2-8-6zM4 11l-2-2M20 11l2-2M8 14h8" />,
  camadas: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  chapa: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 11h11M14 5v14M9 11v8" />
    </>
  ),
  tabua: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <path d="M6 11c3-1 6 1 9 0s4 1 5 0M5 14c4 1 8-1 12 0" />
    </>
  ),
  veio: <path d="M4 6c4-2 8 2 16 0M4 10c4-2 8 2 16 0M4 14c4-2 8 2 16 0M4 18c4-2 8 2 16 0" />,
  parafuso: <path d="M8 3h8l-1 3H9zM12 6v14M10 9l4 1.5M10 12l4 1.5M10 15l4 1.5M12 20l-1-1" />,
  cavilha: (
    <>
      <rect x="9" y="3" width="6" height="18" rx="3" />
      <path d="M9 8h6M9 12h6M9 16h6" />
    </>
  ),
  dobradica: (
    <>
      <circle cx="7" cy="12" r="4" />
      <path d="M11 12h9M17 9v6M20 9v6" />
    </>
  ),
  gaveta: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 12h18M10 8.5h4M10 15.5h4" />
    </>
  ),
  porta: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M15 11v2" />
    </>
  ),
  prateleira: (
    <>
      <path d="M4 4v16M20 4v16M4 9h16M4 15h16" />
    </>
  ),
  nivel: (
    <>
      <rect x="2" y="9" width="20" height="6" rx="1" />
      <rect x="9.5" y="10.5" width="5" height="3" rx="1.5" />
    </>
  ),
  pincel: <path d="M14 3h5v6h-5zM16.5 9v4l-3 8h-2l1-8 2-4M6 21c0-3 2-4 4-4" />,
  dinheiro: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9v.01M18 15v.01" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <circle cx="12" cy="13.5" r="3.5" />
      <path d="M8 7l2-3h4l2 3" />
    </>
  ),
  caminhao: (
    <>
      <path d="M2 6h12v10H2zM14 10h4l3 3v3h-7" />
      <circle cx="6" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  regua: (
    <>
      <rect x="2" y="8" width="20" height="8" rx="1" />
      <path d="M6 8v3M10 8v4M14 8v3M18 8v4" />
    </>
  ),
  alerta: <path d="M12 3 2 20h20zM12 9v5M12 17v.01" />,
  check: <path d="M4 12l5 5L20 6" />,
  cola: <path d="M9 3h6v4H9zM8 7h8l-1 14H9zM11 11h2" />,
  tupia: (
    <>
      <path d="M7 3h10v6H7zM9 9h6v4H9zM12 13v5" />
      <path d="M10 18h4l-2 3z" />
    </>
  ),
  fita: (
    <>
      <circle cx="9" cy="12" r="6" />
      <circle cx="9" cy="12" r="2" />
      <path d="M15 12h7" />
    </>
  ),
  pes: <path d="M5 4h14v10H5zM7 14v6M17 14v6M6 20h2M16 20h2" />,
  parede: <path d="M3 4h18v16H3zM3 9h18M3 15h18M9 4v5M15 9v6M9 15v5" />,
  livro: <path d="M4 5c3-1 6 0 8 2 2-2 5-3 8-2v14c-3-1-6 0-8 2-2-2-5-3-8-2zM12 7v14" />,
  lupa: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  oficina: <path d="M3 10 12 4l9 6v10H3zM8 20v-6h8v6" />,
  calculo: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 7h8M8 12h2M12 12h2M16 12v.01M8 16h2M12 16h2M16 16v.01" />
    </>
  ),
  estrela: <path d="m12 3 2.6 5.8 6.4.6-4.8 4.3 1.4 6.3L12 16.8 6.4 20l1.4-6.3L3 9.4l6.4-.6z" />,
  martelo: <path d="M13 4h6v5h-6zM15 9 6 20l-2-2 9-9" />,
  puxador: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 9h6M9 9v3M15 9v3" />
    </>
  ),
};

export function Icone({ nome, className = "h-7 w-7" }: { nome: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {P[nome] ?? P.estrela}
    </svg>
  );
}

/** Ícone em "azulejo" claro, como nas fichas do app. */
export function IconeTile({ nome, size = "md" }: { nome: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-24 w-24 rounded-3xl" : "h-12 w-12 rounded-xl";
  const ic = size === "lg" ? "h-14 w-14" : "h-7 w-7";
  return (
    <span className={`flex shrink-0 items-center justify-center bg-[#f4ece0] text-[#2a1b11] shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)] ${box}`}>
      <Icone nome={nome} className={ic} />
    </span>
  );
}
