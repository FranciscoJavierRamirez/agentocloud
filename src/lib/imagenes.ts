// Acceso a las imágenes por código (IMG-01…) y a sus capas del gemelo.
import type { ImageMetadata } from 'astro';
import { getEntry } from 'astro:content';

const archivos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/imagenes/*.{png,jpg,jpeg,webp,avif}', { eager: true });
const capas = import.meta.glob<string>('/src/assets/capas/*.svg', { eager: true, query: '?raw', import: 'default' });

export async function fichaImagen(codigo: string) {
  const ficha = await getEntry('imagenes', codigo.toLowerCase());
  if (!ficha) throw new Error(`Falta la ficha de ${codigo} en src/content/imagenes/.`);
  return ficha.data;
}

export function archivoImagen(nombre: string): ImageMetadata {
  const modulo = archivos[`/src/assets/imagenes/${nombre}`];
  if (!modulo) throw new Error(`Falta el archivo src/assets/imagenes/${nombre}.`);
  return modulo.default;
}

/**
 * Lee el SVG de una capa exportado con los nombres fijos (#esperado, #medido, #brecha, #anillo)
 * y devuelve sus piezas. Los id se convierten en data-capa al insertarlo, para poder repetir capas en una página.
 */
export function leerCapa(nombre: string) {
  const svg = capas[`/src/assets/capas/${nombre}`];
  if (!svg) throw new Error(`Falta la capa src/assets/capas/${nombre}.`);
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!viewBox) throw new Error(`La capa ${nombre} no tiene viewBox.`);
  const atributo = (etiqueta: string, nombreAttr: string) => etiqueta.match(new RegExp(`\\s${nombreAttr}="([^"]*)"`))?.[1];
  const pieza = (id: string) => svg.match(new RegExp(`<(?:path|circle)[^>]*\\sid="${id}"[^>]*>`))?.[0];
  const trazo = (id: string) => {
    const e = pieza(id);
    return e ? atributo(e, 'd') : undefined;
  };
  const anilloEl = pieza('anillo');
  return {
    viewBox,
    esperado: trazo('esperado'),
    medido: trazo('medido'),
    brecha: trazo('brecha'),
    anillo: anilloEl
      ? { cx: Number(atributo(anilloEl, 'cx')), cy: Number(atributo(anilloEl, 'cy')), r: Number(atributo(anilloEl, 'r')) }
      : undefined,
  };
}
