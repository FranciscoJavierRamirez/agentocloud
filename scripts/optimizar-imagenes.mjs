// Convierte las fotos maestras de src/assets/imagenes/ (PNG o JPG) a WebP de alta calidad y actualiza sus fichas.
// Los originales no se borran: se mueven a doc/imagenes_originales/ (fuera del sitio publicado).
// Uso: pnpm imagenes   (después de reemplazar una foto por su versión nueva en PNG o JPG)
//
// Esta es la foto MAESTRA, no la que recibe el visitante: Astro genera desde aquí las variantes AVIF y WebP
// por ancho (src/components/media/Photo.astro). Por eso la calidad es alta y el tope de ancho, generoso.
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const CARPETA = 'src/assets/imagenes';
const FICHAS = 'src/content/imagenes';
const ORIGINALES = 'doc/imagenes_originales';
const ANCHO_MAXIMO = 2560;
const CALIDAD = 90;

await mkdir(ORIGINALES, { recursive: true });
const kb = (n) => `${Math.round(n / 1024)} KB`;
let antes = 0;
let despues = 0;
const convertidas = new Map();

for (const nombre of await readdir(CARPETA)) {
  const { name, ext } = parse(nombre);
  if (!/^\.(png|jpe?g)$/i.test(ext)) continue;
  const origen = join(CARPETA, nombre);
  const destino = join(CARPETA, `${name}.webp`);
  const entrada = await readFile(origen);
  const imagen = sharp(entrada);
  const { width, height, palette } = await imagen.metadata();
  // Las ilustraciones planas (retratos y captura provisionales, en paleta) se guardan sin pérdida.
  const salida = await imagen
    .rotate()
    .resize({ width: Math.min(width, ANCHO_MAXIMO), withoutEnlargement: true })
    .webp(palette ? { lossless: true, effort: 6 } : { quality: CALIDAD, effort: 6, smartSubsample: true })
    .toBuffer();
  await writeFile(destino, salida);
  await rename(origen, join(ORIGINALES, nombre));
  antes += entrada.length;
  despues += salida.length;
  convertidas.set(nombre, `${name}.webp`);
  console.log(`${nombre.padEnd(26)} ${width}×${height}  ${kb(entrada.length).padStart(8)} → ${kb(salida.length).padStart(7)}`);
}

// Las fichas apuntan al archivo nuevo. Ancho, alto y foco no cambian: la proporción es la misma.
for (const nombre of await readdir(FICHAS)) {
  const ruta = join(FICHAS, nombre);
  let texto = await readFile(ruta, 'utf8');
  let cambio = false;
  for (const [viejo, nuevo] of convertidas) {
    if (texto.includes(`"${viejo}"`)) {
      texto = texto.replaceAll(`"${viejo}"`, `"${nuevo}"`);
      cambio = true;
    }
  }
  if (cambio) await writeFile(ruta, texto);
}

if (!convertidas.size) console.log('No hay PNG ni JPG nuevos en src/assets/imagenes/.');
else console.log(`\n${convertidas.size} imágenes: ${kb(antes)} → ${kb(despues)}. Originales en ${ORIGINALES}/.`);
