// Colores de avatar según el nombre, para que cada formulario tenga el suyo.
const PAIRS = [
  ["#DCEBFA", "#2C5680"],
  ["#DDF4EC", "#1F8A6E"],
  ["#FBEFD3", "#A8761A"],
  ["#EAE3F8", "#6B4FA3"],
  ["#FDE3E3", "#B23A3A"],
  ["#D9F1F5", "#1B7C8C"],
];

export function avatarColors(text) {
  let h = 0;
  const s = String(text || "?");
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const [bg, fg] = PAIRS[h % PAIRS.length];
  return { background: bg, color: fg };
}
