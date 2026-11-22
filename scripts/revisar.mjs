// Revisiones automáticas de las reglas del sitio sobre el contenido y el HTML generado.
// Uso: pnpm build && pnpm revisar
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const fallas = [];
const avisos = [];
const falla = (regla, detalle) => fallas.push(`✗ ${regla}: ${detalle}`);

async function archivos(dir, ext) {
  const salida = [];
  for (const nombre of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, nombre.name);
    if (nombre.isDirectory()) salida.push(...(await archivos(ruta, ext)));
    else if (ext.some((e) => nombre.name.endsWith(e))) salida.push(ruta);
  }
  return salida;
}
const corto = (ruta) => relative(process.cwd(), ruta);
const existe = (ruta) => stat(ruta).then(() => true, () => false);

// 1 · Palabras prohibidas, en el contenido y en el HTML generado.
const prohibidas = [
  'sustentable', 'sostenible', 'cero impacto', 'cumple la ley', 'cumple la rca', 'certificado', 'certificada', 'garantizado', 'garantizada',
  '100 % seguro', '100% seguro', 'revolucionario', 'disruptivo', 'protege el salar', 'cuida el agua', 'ia autónoma', 'agentocloud ', 'agentto',
  'solicitar demo', 'clic aquí', 'saber más',
];
const palabra = (texto, p) => new RegExp(`(^|[^\\p{L}])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu').test(texto);
const textoVisible = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');

for (const ruta of await archivos('src/content', ['.md', '.yaml'])) {
  const texto = await readFile(ruta, 'utf8');
  for (const p of prohibidas) if (palabra(texto, p)) falla('Palabra prohibida', `«${p}» en ${corto(ruta)}`);
}

const hayDist = await existe('dist/client');
if (!hayDist) avisos.push('· No hay dist/client: ejecute `pnpm build` para revisar el HTML generado.');
const paginas = hayDist ? (await archivos('dist/client', ['.html'])).filter((r) => !r.includes('/sistema/')) : [];
const html = Object.fromEntries(await Promise.all(paginas.map(async (r) => [corto(r), await readFile(r, 'utf8')])));

for (const [ruta, contenido] of Object.entries(html)) {
  const visible = textoVisible(contenido);
  for (const p of prohibidas) if (palabra(visible, p)) falla('Palabra prohibida', `«${p}» en ${ruta}`);
}

// 2 · Sin colores ni medidas sueltos en las clases de Tailwind (bg-[#B9612B], p-[13px]).
const suelto = /(?<![\w-])(?:[a-z-]+:)*[a-z][a-z0-9-]*-\[(?!&)[^\]]+\]/g;
for (const ruta of await archivos('src', ['.astro', '.tsx', '.ts'])) {
  const texto = await readFile(ruta, 'utf8');
  for (const m of texto.match(suelto) ?? []) falla('Valor suelto de Tailwind', `${m} en ${corto(ruta)}`);
  if (/#[0-9a-fA-F]{6}\b/.test(texto) && /class(Name)?=|class:list/.test(texto) && !ruta.includes('/og/') && !ruta.includes('BaseLayout')) {
    falla('Color escrito a mano', corto(ruta));
  }
}

// 3 · El cobre solo marca una brecha: nunca es fondo de un botón.
for (const ruta of await archivos('src/components', ['.astro', '.tsx'])) {
  const texto = await readFile(ruta, 'utf8');
  if (/<(a|button)[^>]*class[^>]*\bbg-cobre\b/.test(texto) || /boton\w*\s*=\s*['"`][^'"`]*bg-cobre/.test(texto)) falla('Cobre en un botón', corto(ruta));
}

if (hayDist) {
  const inicio = html['dist/client/index.html'] ?? '';

  // 5 · Las páginas de contenido no cargan React; ninguna página publica mapas de fuente.
  for (const [ruta, contenido] of Object.entries(html)) {
    // El inicio de cada idioma (/ y /en/) es la única página con islas.
    const esInicio = /^dist\/client\/([a-z]{2}\/)?index\.html$/.test(ruta);
    if (!esInicio && /astro-island/.test(contenido)) falla('React en una página de contenido', ruta);
    if (!esInicio && /<script[^>]+src="[^"]*(client|react)[^"]*"/.test(contenido)) falla('React en una página de contenido', ruta);
  }
  if (inicio && !/astro-island/.test(inicio)) falla('Islas', 'el inicio no tiene islas');
  const hero = inicio.match(/<section[^>]*data-escena="hero"[\s\S]*?<\/section>/)?.[0] ?? '';
  if (/astro-island/.test(hero)) falla('React sobre el pliegue', 'el hero contiene una isla');
  for (const mapa of await archivos('dist/client', ['.map'])) falla('Mapa de fuente publicado', corto(mapa));

  // 6 · Todo se lee sin script: cada sección trae su título y las islas su primer estado.
  for (const ancla of ['inicio', 'en-juego', 'balance', 'diferencia', 'como-funciona', 'costo-de-esperar', 'para-cada-uno', 'seguridad', 'donde-estamos', 'primer-paso', 'quienes-somos', 'preguntas']) {
    if (!new RegExp(`id="${ancla}"`).test(inicio)) falla('Sección ausente', `#${ancla}`);
  }
  for (const texto of ['UMBRAL DE ALARMA']) {
    if (!inicio.includes(texto)) falla('Primer estado de una isla', `falta «${texto}» en el HTML del inicio`);
  }

  // 7 · Presupuestos de peso (sistema_de_diseno/04 §1). Tamaños sin comprimir: son una alerta temprana, no la medición.
  for (const ruta of await archivos('dist/client/_astro', ['.avif', '.webp', '.png', '.jpg'])) {
    const { size } = await stat(ruta);
    const tope = ruta.includes('IMG-01') ? 250_000 : 150_000;
    if (size > tope) falla('Imagen sobre el presupuesto', `${corto(ruta)} pesa ${Math.round(size / 1000)} KB (tope ${tope / 1000} KB)`);
  }
  let scripts = 0;
  for (const ruta of await archivos('dist/client/_astro', ['.js'])) scripts += (await stat(ruta)).size;
  avisos.push(`· Script total publicado (sin comprimir, todas las páginas y niveles): ${Math.round(scripts / 1000)} KB`);
}

for (const a of avisos) console.log(a);
if (fallas.length) {
  console.error(fallas.join('\n'));
  console.error(`\n${fallas.length} regla(s) incumplida(s).`);
  process.exit(1);
}
console.log('✓ Reglas del sitio: sin incumplimientos.');
