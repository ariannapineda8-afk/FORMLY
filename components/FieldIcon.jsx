import { toneOf } from "@/lib/fields";

const P = {
  corta: (<><rect x="3" y="8" width="18" height="8" rx="2" /><path d="M7 12h5" /></>),
  larga: (<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9h10M7 13h10M7 16.5h5" /></>),
  unica: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" /></>),
  multiple: (<><rect x="4" y="4" width="16" height="16" rx="3" /><path d="m8.5 12.5 2.5 2.5 4.5-5.5" /></>),
  desplegable: (<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="m9 11 3 3 3-3" /></>),
  sinono: (<><rect x="3" y="8" width="18" height="8" rx="4" /><circle cx="16" cy="12" r="2.2" fill="currentColor" stroke="none" /></>),
  escala: (<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />),
  fecha: (<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  hora: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  numero: (<path d="M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16" />),
  email: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>),
  telefono: (<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />),
  archivo: (<path d="m20 11.5-7.8 7.8a5 5 0 0 1-7-7l8-8a3.3 3.3 0 0 1 4.7 4.7l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.4-7.4" />),
  firma: (<><path d="M5 16c1.5-5 3-9 5-9 2 0 0 7 2 7s2-4 4-4c1.2 0 1.5 2 3 2" /><path d="M3 20h18" /></>),
  seccion: (<path d="M6 5v14M18 5v14M6 12h12" />),
  info: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" strokeWidth="2.2" /></>),
};

export default function FieldIcon({ type, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[type] || P.corta}
    </svg>
  );
}

export function FieldBadge({ type, size = 34 }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg shrink-0 ${toneOf(type)}`}
      style={{ width: size, height: size }}
    >
      <FieldIcon type={type} size={Math.round(size * 0.53)} />
    </span>
  );
}

export function GripIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="currentColor" aria-hidden="true">
      {[4, 9, 14].map((y) =>
        [4, 10].map((x) => <circle key={x + "-" + y} cx={x} cy={y} r="1.4" />)
      )}
    </svg>
  );
}
