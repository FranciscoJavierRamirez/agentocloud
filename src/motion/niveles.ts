// Niveles por equipo (15 §6 y sistema_de_diseno/03 §5). Un solo lugar para decidir qué se enciende.
//   0 · Base       sin script o con movimiento reducido: todo en su estado final
//   1 · Celular    pantalla táctil: CSS ligado al scroll, sin suavizado ni desfase
//   2 · Escritorio puntero fino y pantalla ancha: suavizado, desfase y bordes que siguen al puntero
export type Nivel = 0 | 1 | 2;

export const consultas = {
  reducido: '(prefers-reduced-motion: reduce)',
  escritorio: '(hover: hover) and (pointer: fine) and (min-width: 64rem)',
};

export function nivel(): Nivel {
  if (window.matchMedia(consultas.reducido).matches) return 0;
  const ahorro = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  return window.matchMedia(consultas.escritorio).matches && !ahorro ? 2 : 1;
}
