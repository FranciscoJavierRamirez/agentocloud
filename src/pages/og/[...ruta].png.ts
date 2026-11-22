// Imagen para compartir (IMG-12), una por página y por idioma, 1200 × 630. PROVISIONAL: se compone en la compilación
// con el logo de referencia, «Busca causas, no solo muestra alarmas.» y la línea de balance. Cuando exista la IMG-12 de Figma,
// este archivo se reemplaza por imágenes fijas en public/og/.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import logotipo from '@/assets/logo/logotipo-claro.svg?raw';
import { comunes, idiomaPorDefecto, idiomasActivos } from '@/lib/i18n';

export const prerender = true;

const SAL = '#F3F1EB';
const TINTA = '#0F1A18';
const GRIS = '#4D5C57';
const PATINA = '#2E8F80';
const COBRE = '#B9612B';

export const getStaticPaths = (async () => {
  const paginas = await getCollection('paginas');
  return idiomasActivos.flatMap((lang) => {
    const pre = lang === idiomaPorDefecto ? '' : `${lang}/`;
    return [
      { params: { ruta: `${pre}inicio` }, props: { lang, titulo: undefined as string | undefined } },
      ...paginas.filter((p) => p.id.startsWith(`${lang}/`)).map((p) => ({ params: { ruta: `${pre}${p.data.id}` }, props: { lang, titulo: p.data.titulo } })),
    ];
  });
}) satisfies GetStaticPaths;

const fuente = (peso: 400 | 700) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/schibsted-grotesk/files/schibsted-grotesk-latin-${peso}-normal.woff`));
const svg = (contenido: string) => `data:image/svg+xml;base64,${Buffer.from(contenido).toString('base64')}`;
const caja = (style: Record<string, unknown>, children?: unknown) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } });

export const GET: APIRoute = async ({ props }) => {
  const { lang, titulo } = props as { lang: string; titulo?: string };
  const t = await comunes(lang);
  const [regular, negrita] = await Promise.all([fuente(400), fuente(700)]);
  // La línea de balance: lo esperado (pátina punteada), lo medido (tinta) y la brecha (cobre) con su anillo.
  const balance = `<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="120" viewBox="0 0 1040 120" fill="none">
    <path d="M0,40 H1040" stroke="${PATINA}" stroke-width="2.5" stroke-dasharray="8 8"/>
    <path d="M700,40 L730,84 H860 L890,40 Z" fill="${COBRE}" fill-opacity=".18" stroke="${COBRE}" stroke-width="3"/>
    <path d="M0,40 H700 L730,84 H860 L890,40 H1040" stroke="${TINTA}" stroke-width="3"/>
    <circle cx="795" cy="40" r="20" stroke="${COBRE}" stroke-width="4"/></svg>`;

  const arbol = caja({ width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: SAL, padding: 80, fontFamily: 'Schibsted Grotesk', color: TINTA }, [
    { type: 'img', props: { src: svg(logotipo), width: 396, height: 90 } },
    caja({ flexDirection: 'column' }, [
      caja({ fontSize: titulo ? 72 : 104, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }, titulo ?? t.seo.imagen_compartir_alt.replace(`${t.organizacion.nombre}. `, '')),
      caja({ fontSize: 30, fontWeight: 400, color: GRIS, marginTop: 20, maxWidth: 900 }, titulo ? t.seo.imagen_compartir_alt : t.seo.titulo.split(' · ')[1]),
    ]),
    { type: 'img', props: { src: svg(balance), width: 1040, height: 120 } },
  ]);

  const dibujo = await satori(arbol as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Schibsted Grotesk', data: regular, weight: 400, style: 'normal' },
      { name: 'Schibsted Grotesk', data: negrita, weight: 700, style: 'normal' },
    ],
  });
  const png = await sharp(Buffer.from(dibujo)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
