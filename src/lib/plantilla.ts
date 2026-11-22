/** Reemplaza variables {nombre} en un texto del contenido. Sin dependencias: se puede usar en las islas. */
export function plantilla(texto: string, valores: Record<string, string | number>) {
  return texto.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? `{${k}}`));
}
