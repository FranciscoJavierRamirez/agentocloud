// Formato de cifras por idioma (Intl). es-CL: 1.250,5 · en: 1,250.5

export function numero(lang: string, valor: number, decimales = 0) {
  return new Intl.NumberFormat(lang, {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
    useGrouping: 'always',
  }).format(valor);
}

/** Signo menos tipográfico (−), como en los rótulos del contenido. */
export function conSigno(lang: string, valor: number, decimales = 0) {
  const texto = numero(lang, Math.abs(valor), decimales);
  return valor < 0 ? `−${texto}` : texto;
}

/** Cifra con unidad: "68 %", "4,3 TWh". El espacio antes de la unidad es fijo (no se corta). */
export function conUnidad(lang: string, valor: number, decimales: number, unidad: string, extra?: { prefijo?: string; sufijo?: string }) {
  const base = `${extra?.prefijo ?? ''}${conSigno(lang, valor, decimales)}${extra?.sufijo ?? ''}`;
  return unidad ? `${base} ${unidad}` : base;
}

export function moneda(lang: string, valor: number, codigo: string, decimales = 0) {
  return `${codigo} ${numero(lang, valor, decimales)}`;
}

/** Parte un rótulo técnico en sus segmentos: "PZ-12 · −2,5 L/S" → ["PZ-12", "−2,5 L/S"]. */
export const segmentos = (rotulo: string) => rotulo.split('·').map((s) => s.trim()).filter(Boolean);
