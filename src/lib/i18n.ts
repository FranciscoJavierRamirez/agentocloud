// Idioma, rutas y acceso al contenido. Ningún componente lleva texto: todo sale de aquí.
import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { idiomaPorDefecto, idiomasActivos } from './idiomas.mjs';

export { idiomaPorDefecto, idiomasActivos };
export type Idioma = string;

type DatosSitio = CollectionEntry<'sitio'>['data'];
export type IdSeccion = DatosSitio['id'];
export type Seccion<I extends IdSeccion> = Extract<DatosSitio, { id: I }>;
export type Comunes = Seccion<'sitio'>;

type DatosPagina = CollectionEntry<'paginas'>['data'];
export type PaginaEmpresa = Extract<DatosPagina, { tipo: 'empresa' }>;
export type PaginaLegal = Extract<DatosPagina, { tipo: 'pagina' }>;

/** Entrada completa de una sección (datos + cuerpo en Markdown). */
export async function entradaSeccion(lang: Idioma, id: IdSeccion) {
  const entrada = await getEntry('sitio', `${lang}/${id}`);
  if (!entrada) throw new Error(`Falta el contenido "${id}" en el idioma "${lang}" (src/content/sitio/${lang}/).`);
  return entrada;
}

export async function seccion<I extends IdSeccion>(lang: Idioma, id: I): Promise<Seccion<I>> {
  return (await entradaSeccion(lang, id)).data as Seccion<I>;
}

export const comunes = (lang: Idioma) => seccion(lang, 'sitio');

export async function paginas(lang: Idioma) {
  return (await getCollection('paginas')).filter((p) => p.id.startsWith(`${lang}/`));
}

export async function paginaPorTipo(lang: Idioma, tipo: 'empresa') {
  return (await paginas(lang)).find((p) => p.data.tipo === tipo);
}

/** Prefijo de ruta del idioma: "" para el idioma por defecto, "/en" para los demás. */
export const prefijo = (lang: Idioma) => (lang === idiomaPorDefecto ? '' : `/${lang}`);

/** URL interna: ruta("es") → "/", ruta("es", "empresa") → "/empresa/", con ancla opcional. */
export function ruta(lang: Idioma, camino = '', ancla?: string) {
  const limpio = camino.replace(/^\/|\/$/g, '');
  return `${prefijo(lang)}/${limpio ? `${limpio}/` : ''}${ancla ? `#${ancla}` : ''}`;
}

/** Resuelve un enlace del contenido ({ ancla } o { ruta }) a una URL. Las anclas viven en el inicio. */
export function destino(lang: Idioma, enlace: { ancla?: string; ruta?: string }) {
  return enlace.ruta !== undefined ? ruta(lang, enlace.ruta, enlace.ancla) : ruta(lang, '', enlace.ancla);
}

/** Parámetro para getStaticPaths con [...lang]. */
export const parametroIdioma = (lang: Idioma) => (lang === idiomaPorDefecto ? undefined : lang);

export async function cifra(lang: Idioma, id: string) {
  const registro = await getEntry('cifras', lang);
  const dato = registro?.data.lista.find((c) => c.id === id);
  if (!dato) throw new Error(`La cifra "${id}" no está en el registro (src/content/cifras/${lang}.yaml).`);
  return dato;
}

export async function asesores(lang: Idioma) {
  return (await getEntry('asesores', lang))?.data.lista ?? [];
}

export { plantilla } from './plantilla';
