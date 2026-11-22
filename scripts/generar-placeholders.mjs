// Genera las imágenes PROVISIONALES del sitio, su capa del gemelo y su ficha en src/content/imagenes/.
// Cada imagen sale con el tamaño y el nombre definitivos: al llegar la foto real se reemplaza el archivo,
// se exporta su capa desde Figma (ids #esperado, #medido, #brecha, #anillo) y se ajusta la ficha YAML.
// NO volver a ejecutar sobre imágenes definitivas: sobrescribe.  Uso: pnpm placeholders
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const DIR_IMG = 'src/assets/imagenes';
const DIR_CAPA = 'src/assets/capas';
const DIR_FICHA = 'src/content/imagenes';

const SAL = '#E8E5DC';
const SAL_CLARA = '#F3F1EB';
const TINTA = '#0F1A18';
const NOCHE = '#101917';
const BRUMA = '#EEF2EE';

const n = (v) => Math.round(v * 10) / 10;
const pts = (lista) => lista.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)},${n(y)}`).join(' ');

/** Marco común: fondo, cruces de registro y etiqueta. */
function lienzo({ w, h, fondo = SAL, trazo = TINTA, etiqueta, dibujo = '', etiquetaY = 0.94 }) {
  const m = Math.round(Math.min(w, h) * 0.035);
  const c = Math.round(Math.min(w, h) * 0.02);
  const cruz = (x, y) =>
    `<path d="M${x - c},${y} H${x + c} M${x},${y - c} V${y + c}" stroke="${trazo}" stroke-opacity=".3" stroke-width="2"/>`;
  const cuerpo = Math.round(Math.max(18, Math.min(w, h) * 0.022));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<rect width="${w}" height="${h}" fill="${fondo}"/>
<g fill="none" stroke="${trazo}" stroke-opacity=".5" stroke-width="${Math.max(3, Math.round(Math.max(w, h) / 420))}" stroke-linejoin="round" stroke-linecap="round">${dibujo}</g>
${cruz(m, m)}${cruz(w - m, m)}${cruz(m, h - m)}${cruz(w - m, h - m)}
<text x="${m + c * 2}" y="${Math.round(h * etiquetaY)}" font-family="Menlo, monospace" font-size="${cuerpo}" letter-spacing="${cuerpo * 0.1}" fill="${trazo}" fill-opacity=".55">${etiqueta} · ${w}×${h} · PROVISIONAL</text>
</svg>`;
}

function capaSvg({ w, h, esperado, medido, brecha, anillo }) {
  const partes = [];
  if (esperado) partes.push(`<path id="esperado" pathLength="1" d="${esperado}"/>`);
  if (medido) partes.push(`<path id="medido" pathLength="1" d="${medido}"/>`);
  if (brecha) partes.push(`<path id="brecha" d="${brecha}"/>`);
  if (anillo) partes.push(`<circle id="anillo" cx="${n(anillo[0])}" cy="${n(anillo[1])}" r="${n(anillo[2])}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="none">\n  ${partes.join('\n  ')}\n</svg>\n`;
}

/** Línea que sigue un tramo y se aparta (dy) alrededor de un punto: lo medido frente a lo esperado. */
function conBrecha(x0, x1, y, xb, ancho, dy, pend = 0) {
  const yy = (x) => y + (x - x0) * pend;
  const a = xb - ancho / 2;
  const b = xb + ancho / 2;
  const esperado = pts([[x0, yy(x0)], [x1, yy(x1)]]);
  const medido = pts([[x0, yy(x0)], [a, yy(a)], [a + ancho * 0.2, yy(a) + dy], [b - ancho * 0.2, yy(b) + dy], [b, yy(b)], [x1, yy(x1)]]);
  const brecha = `${pts([[a, yy(a)], [a + ancho * 0.2, yy(a) + dy], [b - ancho * 0.2, yy(b) + dy], [b, yy(b)]])} Z`;
  return { esperado, medido, brecha };
}

// ───────────────────────── Escenas ─────────────────────────

const pozo = (x, y, s) =>
  `<path d="M${n(x)},${n(y)} V${n(y - s)} M${n(x - s * 0.35)},${n(y - s)} H${n(x + s * 0.35)} M${n(x - s * 0.5)},${n(y)} H${n(x + s * 0.5)}"/><circle cx="${n(x)}" cy="${n(y - s * 1.15)}" r="${n(s * 0.15)}"/>`;

function campoDePozos(w, h, vertical) {
  const yH = h * (vertical ? 0.1 : 0.4);
  const yT = h * (vertical ? 0.2 : 0.64);
  const x0 = w * (vertical ? 0.08 : 0.4);
  const x1 = w * 0.96;
  const xs = vertical ? [0.26, 0.52, 0.78] : [0.52, 0.68, 0.84];
  const s = h * (vertical ? 0.035 : 0.09);
  const cordillera = pts([[w * 0.45, yH], [w * 0.6, yH - h * 0.05], [w * 0.7, yH - h * 0.02], [w * 0.82, yH - h * 0.08], [w * 0.92, yH - h * 0.03], [w, yH - h * 0.06]]);
  const dibujo = `<path d="M0,${n(yH)} H${w}"/><path d="${cordillera}"/><path d="M${n(x0)},${n(yT)} H${n(x1)}" stroke-width="6"/>${xs.map((x) => pozo(w * x, yT, s)).join('')}`;
  const xb = w * xs[2];
  const { esperado, medido, brecha } = conBrecha(x0, x1, yT, xb, w * (vertical ? 0.2 : 0.11), h * (vertical ? 0.022 : 0.05));
  return {
    dibujo,
    capa: { esperado, medido, brecha, anillo: [xb, yT - s * 1.15, s * 0.5] },
    foco: [vertical ? 0.5 : xs[2], yT / h],
    rotulo: vertical ? [0.12, 0.235] : [0.62, 0.73],
  };
}

function impulsion(w, h, vertical) {
  // Perfil de la costa a la faena: cuatro puntos con su cota.
  const p = vertical
    ? [[0.14, 0.9], [0.4, 0.66], [0.62, 0.38], [0.86, 0.12]]
    : [[0.07, 0.8], [0.36, 0.6], [0.62, 0.42], [0.9, 0.2]];
  const P = p.map(([x, y]) => [w * x, h * y]);
  const mar = `<path d="M0,${n(P[0][1] + h * 0.02)} H${n(P[0][0])}"/><path d="M0,${n(P[0][1] + h * 0.05)} H${n(P[0][0] * 0.7)}"/>`;
  const terreno = pts([[P[0][0], P[0][1] + h * 0.02], ...P.map(([x, y]) => [x + w * 0.02, y + h * 0.05]), [w, P[3][1] + h * 0.03]]);
  const s = Math.min(w, h) * 0.03;
  const estaciones = P.slice(1, 3).map(([x, y]) => `<rect x="${n(x - s)}" y="${n(y - s * 0.2)}" width="${n(s * 2)}" height="${n(s * 1.4)}"/>`).join('');
  const dibujo = `${mar}<path d="${terreno}"/>${estaciones}<path d="${pts(P)}" stroke-width="6"/>`;
  return { dibujo, capa: { esperado: pts(P.map(([x, y]) => [x, y - h * 0.012])), medido: pts(P) }, foco: [0.5, 0.5], puntos: p };
}

function estanque(w, h, vertical) {
  const cx = w * (vertical ? 0.46 : 0.42);
  const ancho = w * (vertical ? 0.56 : 0.3);
  const y0 = h * (vertical ? 0.3 : 0.3);
  const y1 = h * (vertical ? 0.62 : 0.76);
  const x0 = cx - ancho / 2;
  const x1 = cx + ancho / 2;
  const ry = ancho * 0.09;
  const xv = x1 + w * 0.07;
  const yv = y1 - (y1 - y0) * 0.08;
  const dibujo = `<path d="M0,${n(y1 + ry)} H${w}"/><ellipse cx="${n(cx)}" cy="${n(y0)}" rx="${n(ancho / 2)}" ry="${n(ry)}"/><path d="M${n(x0)},${n(y0)} V${n(y1)} A${n(ancho / 2)},${n(ry)} 0 0 0 ${n(x1)},${n(y1)} V${n(y0)}"/><path d="M${n(x1 + w * 0.015)},${n(y0)} V${n(y1)}" stroke-dasharray="2 14"/><path d="M${n(x1)},${n(yv)} H${n(xv + w * 0.08)}" stroke-width="6"/><path d="M${n(xv - w * 0.012)},${n(yv - h * 0.02)} L${n(xv + w * 0.012)},${n(yv + h * 0.02)} V${n(yv - h * 0.02)} L${n(xv - w * 0.012)},${n(yv + h * 0.02)} Z"/>`;
  const ye = y0 + (y1 - y0) * 0.3;
  const dy = (y1 - y0) * 0.1;
  const a = x0 - w * 0.02;
  const b = x1 + w * 0.04;
  return {
    dibujo,
    capa: {
      esperado: pts([[a, ye], [b, ye]]),
      medido: pts([[a, ye + dy], [b, ye + dy]]),
      brecha: `${pts([[a, ye], [b, ye], [b, ye + dy], [a, ye + dy]])} Z`,
      anillo: [xv, yv, Math.min(w, h) * 0.035],
    },
    cierreDy: -dy,
    foco: [cx / w, (y0 + y1) / 2 / h],
    rotulo: vertical ? [0.06, 0.7] : [0.46, 0.86],
  };
}

function bombeo(w, h, vertical) {
  const yPiso = h * (vertical ? 0.62 : 0.74);
  const xs = vertical ? [0.22, 0.5, 0.78] : [0.46, 0.64, 0.82];
  const s = (vertical ? w : h) * 0.085;
  const bomba = (x) =>
    `<circle cx="${n(x)}" cy="${n(yPiso - s)}" r="${n(s * 0.7)}"/><rect x="${n(x + s * 0.7)}" y="${n(yPiso - s * 1.45)}" width="${n(s * 1.1)}" height="${n(s * 0.9)}"/><path d="M${n(x)},${n(yPiso - s * 1.7)} V${n(yPiso - s * 3)}"/>`;
  const sombra = vertical ? '' : `<rect x="0" y="0" width="${n(w * 0.33)}" height="${h}" fill="${TINTA}" fill-opacity=".12" stroke="none"/>`;
  const dibujo = `${sombra}<path d="M0,${n(yPiso)} H${w}"/><path d="M${n(w * xs[0] - s)},${n(yPiso - s * 3)} H${n(w * xs[2] + s * 2)}" stroke-width="6"/>${xs.map((x) => bomba(w * x)).join('')}`;
  const xb = w * xs[1];
  const yl = yPiso - s * 2.2;
  const { esperado, medido, brecha } = conBrecha(w * xs[0] - s, w * xs[2] + s * 2, yl, xb, s * 2.6, -s * 0.5);
  return { dibujo, capa: { esperado, medido, brecha, anillo: [xb, yPiso - s, s * 0.95] }, foco: [xs[1], (yPiso - s) / h], rotulo: vertical ? [0.06, 0.7] : [0.42, 0.84] };
}

function salaDeControl(w, h) {
  const y = h * 0.52;
  const pant = [0.2, 0.5, 0.8].map((x) => `<rect x="${n(w * x - w * 0.13)}" y="${n(y - h * 0.2)}" width="${n(w * 0.26)}" height="${n(h * 0.17)}"/>`).join('');
  const dibujo = `${pant}<path d="M0,${n(y + h * 0.02)} H${w}"/><path d="M${n(w * 0.38)},${n(h)} V${n(h * 0.72)} A${n(w * 0.12)},${n(w * 0.12)} 0 0 1 ${n(w * 0.62)},${n(h * 0.72)} V${n(h)}"/><circle cx="${n(w * 0.5)}" cy="${n(h * 0.62)}" r="${n(w * 0.06)}"/>`;
  return { dibujo, capa: null, foco: [0.5, 0.45] };
}

function pozoMonitoreo(w, h) {
  const yH = h * 0.46;
  const x = w * 0.36;
  const dibujo = `<path d="M0,${n(yH)} H${w}"/><path d="M${n(x)},${n(yH + h * 0.12)} V${n(yH - h * 0.1)}" stroke-width="8"/><rect x="${n(x - w * 0.04)}" y="${n(yH - h * 0.13)}" width="${n(w * 0.08)}" height="${n(h * 0.035)}"/><path d="M${n(x - w * 0.1)},${n(yH + h * 0.12)} H${n(x + w * 0.1)}"/>`;
  const yl = yH + h * 0.2;
  const linea = (dy) => pts([[w * 0.12, yl + dy], [w * 0.9, yl + dy]]);
  return { dibujo, capa: { esperado: linea(0), medido: linea(h * 0.008) }, estado: 'cierra', foco: [0.36, 0.45], rotulo: [0.12, 0.7] };
}

function gabinete(w, h) {
  const x0 = w * 0.12;
  const y0 = h * 0.16;
  const ancho = w * 0.46;
  const alto = h * 0.6;
  const dibujo = `<rect x="${n(x0)}" y="${n(y0)}" width="${n(ancho)}" height="${n(alto)}"/><path d="M${n(x0 + ancho / 2)},${n(y0)} V${n(y0 + alto)}"/><rect x="${n(x0 + ancho / 2 - w * 0.035)}" y="${n(y0 + alto * 0.5)}" width="${n(w * 0.07)}" height="${n(h * 0.04)}"/><path d="M${n(x0 + ancho / 2 - w * 0.022)},${n(y0 + alto * 0.5)} v${n(-h * 0.02)} a${n(w * 0.022)},${n(w * 0.022)} 0 0 1 ${n(w * 0.044)},0 v${n(h * 0.02)}"/><path d="M0,${n(y0 + alto)} H${w}"/>`;
  const yl = y0 + alto * 0.28;
  const linea = (dy) => pts([[x0 + ancho, yl + dy], [w * 0.92, yl + dy]]);
  return { dibujo, capa: { esperado: linea(0), medido: linea(h * 0.008) }, estado: 'cierra', foco: [0.35, 0.45], rotulo: [0.62, 0.36] };
}

function manometro(w, h) {
  const cx = w * 0.5;
  const cy = h * 0.4;
  const r = w * 0.3;
  const marcas = Array.from({ length: 13 }, (_, i) => {
    const a = Math.PI * (0.8 + (i / 12) * 1.4);
    return `<path d="M${n(cx + Math.cos(a) * r * 0.82)},${n(cy + Math.sin(a) * r * 0.82)} L${n(cx + Math.cos(a) * r * 0.94)},${n(cy + Math.sin(a) * r * 0.94)}"/>`;
  }).join('');
  const arco = (a0, a1, rr) => {
    const p = (a) => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
    const [ax, ay] = p(a0);
    const [bx, by] = p(a1);
    return `M${n(ax)},${n(ay)} A${n(rr)},${n(rr)} 0 0 1 ${n(bx)},${n(by)}`;
  };
  const aN = Math.PI * 2.02; // aguja fuera de su rango
  const px = cx + Math.cos(aN) * r * 0.7;
  const py = cy + Math.sin(aN) * r * 0.7;
  const dibujo = `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}"/>${marcas}<path d="M${n(cx)},${n(cy)} L${n(px)},${n(py)}" stroke-width="8"/><circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 0.06)}"/><path d="M${n(cx)},${n(cy + r)} V${n(h * 0.86)}" stroke-width="8"/>`;
  const a0 = Math.PI * 1.25;
  const a1 = Math.PI * 1.75;
  const rr = r * 0.7;
  const fin = [cx + Math.cos(aN) * rr, cy + Math.sin(aN) * rr];
  return {
    dibujo,
    capa: {
      esperado: arco(a0, a1, rr),
      medido: arco(a0, aN, rr * 0.93),
      brecha: `${arco(a1, aN, rr)} L${n(cx + Math.cos(aN) * rr * 0.93)},${n(cy + Math.sin(aN) * rr * 0.93)} A${n(rr * 0.93)},${n(rr * 0.93)} 0 0 0 ${n(cx + Math.cos(a1) * rr * 0.93)},${n(cy + Math.sin(a1) * rr * 0.93)} Z`,
      anillo: [fin[0], fin[1], w * 0.045],
    },
    foco: [0.5, 0.4],
    rotulo: [0.08, 0.76],
  };
}

function texturaSal(w, h) {
  // Polígonos de sal, vista cenital. Determinista.
  let semilla = 7;
  const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);
  const col = Math.round(w / 260);
  const fil = Math.round(h / 240);
  const P = [];
  for (let j = 0; j <= fil; j++) {
    P.push([]);
    for (let i = 0; i <= col; i++) P[j].push([(i + (j % 2 ? 0.5 : 0) + (azar() - 0.5) * 0.5) * (w / col), (j + (azar() - 0.5) * 0.5) * (h / fil)]);
  }
  let d = '';
  for (let j = 0; j <= fil; j++)
    for (let i = 0; i <= col; i++) {
      if (i < col) d += `M${n(P[j][i][0])},${n(P[j][i][1])} L${n(P[j][i + 1][0])},${n(P[j][i + 1][1])} `;
      if (j < fil) d += `M${n(P[j][i][0])},${n(P[j][i][1])} L${n(P[j + 1][i][0])},${n(P[j + 1][i][1])} `;
    }
  return { dibujo: `<path d="${d}" stroke-opacity=".5"/>`, capa: null, foco: [0.5, 0.5] };
}

function cordillera(w, h) {
  const base = h * 0.78;
  const cumbres = [[0, 0.62], [0.08, 0.5], [0.16, 0.58], [0.27, 0.36], [0.36, 0.52], [0.46, 0.3], [0.55, 0.48], [0.66, 0.34], [0.76, 0.5], [0.86, 0.4], [0.94, 0.54], [1, 0.46]];
  const dibujo = `<path d="${pts(cumbres.map(([x, y]) => [w * x, h * y]))}"/><path d="${pts(cumbres.map(([x, y]) => [w * x, h * (y + 0.14 + (x * 7 % 1) * 0.05)]))}" stroke-opacity=".5"/><path d="M0,${n(base)} H${w}"/>`;
  return { dibujo, capa: null, foco: [0.5, 0.6] };
}

function retrato(w, h, iniciales) {
  const dibujo = `<circle cx="${n(w / 2)}" cy="${n(h * 0.38)}" r="${n(w * 0.17)}"/><path d="M${n(w * 0.18)},${n(h)} V${n(h * 0.82)} A${n(w * 0.32)},${n(w * 0.26)} 0 0 1 ${n(w * 0.82)},${n(h * 0.82)} V${n(h)}"/>`;
  return {
    dibujo: `${dibujo}</g><text x="${n(w / 2)}" y="${n(h * 0.405)}" text-anchor="middle" font-family="Menlo, monospace" font-size="${n(w * 0.1)}" fill="${TINTA}" fill-opacity=".5">${iniciales}</text><g>`,
    capa: null,
    foco: [0.5, 0.4],
  };
}

function captura(w, h) {
  const r = (x, y, a, b) => `<rect x="${n(w * x)}" y="${n(h * y)}" width="${n(w * a)}" height="${n(h * b)}"/>`;
  const curva = pts(Array.from({ length: 24 }, (_, i) => [w * (0.3 + i * 0.027), h * (0.5 - Math.sin(i / 4) * 0.06 + (i > 14 ? (i - 14) * 0.012 : 0))]));
  const dibujo = `${r(0.04, 0.08, 0.2, 0.84)}${r(0.27, 0.08, 0.69, 0.14)}${r(0.27, 0.27, 0.69, 0.42)}${r(0.27, 0.74, 0.33, 0.18)}${r(0.63, 0.74, 0.33, 0.18)}<path d="${curva}"/>${[0.16, 0.26, 0.36, 0.46].map((y) => `<path d="M${n(w * 0.07)},${n(h * y)} H${n(w * 0.2)}"/>`).join('')}`;
  return { dibujo, capa: null, foco: [0.5, 0.5] };
}

// ───────────────────────── Catálogo ─────────────────────────

const D = (w, h, escena, extra = {}) => ({ w, h, ...escena(w, h, false), ...extra });
const C = (w, h, escena, extra = {}) => ({ w, h, ...escena(w, h, true), ...extra });

const catalogo = [
  { codigo: 'IMG-01', nombre: 'HERO · CAMPO DE POZOS', escritorio: D(2560, 1097, campoDePozos), celular: C(1152, 2048, campoDePozos) },
  { codigo: 'IMG-02', nombre: 'COSTA A CORDILLERA', escritorio: D(2048, 880, impulsion), celular: C(1632, 2040, impulsion) },
  { codigo: 'IMG-03', nombre: 'ESTANQUE · BALANCE', escritorio: D(2048, 1152, estanque), celular: C(1632, 2040, estanque) },
  { codigo: 'IMG-04', nombre: 'ESTACIÓN DE BOMBEO', escritorio: D(2048, 1152, bombeo), celular: C(1632, 2040, bombeo) },
  { codigo: 'IMG-05', nombre: 'OPERACIÓN · SALA DE CONTROL', escritorio: D(1632, 2040, salaDeControl) },
  { codigo: 'IMG-06', nombre: 'MEDIO AMBIENTE · POZO DE MONITOREO', escritorio: D(1632, 2040, pozoMonitoreo) },
  { codigo: 'IMG-07', nombre: 'TI/OT · GABINETE', escritorio: D(1632, 2040, gabinete) },
  { codigo: 'IMG-08', nombre: 'FINANZAS · MANÓMETRO', escritorio: D(1632, 2040, manometro) },
  { codigo: 'IMG-09', nombre: 'SEGURIDAD · SALA DE NOCHE', oscuro: true, escritorio: D(2048, 1152, salaDeControl), celular: C(1632, 2040, salaDeControl) },
  { codigo: 'IMG-10', nombre: 'TEXTURA DE SAL', fondo: SAL_CLARA, escritorio: D(2048, 880, texturaSal), celular: C(1152, 2048, texturaSal) },
  { codigo: 'IMG-11', nombre: 'PIE · CORDILLERA', escritorio: D(2016, 672, cordillera), celular: C(1344, 672, cordillera) },
  { codigo: 'RET-01', nombre: 'RETRATO PENDIENTE', fondo: SAL_CLARA, escritorio: { w: 1200, h: 1500, ...retrato(1200, 1500, 'FR') } },
  { codigo: 'RET-02', nombre: 'RETRATO PENDIENTE', fondo: SAL_CLARA, escritorio: { w: 1200, h: 1500, ...retrato(1200, 1500, 'MS') } },
  { codigo: 'CAP-01', nombre: 'CAPTURA DEL PROTOTIPO PENDIENTE', oscuro: true, escritorio: { w: 1920, h: 1200, ...captura(1920, 1200) } },
];

const yaml = (v, s = '') => {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x !== 'object')) return `[${v.join(', ')}]`;
    return v.map((x) => `\n${s}- ${yaml(x, `${s}  `).trimStart()}`).join('');
  }
  if (typeof v === 'object')
    return Object.entries(v)
      .map(([k, x]) => `\n${s}${k}:${typeof x === 'object' && x !== null && !(Array.isArray(x) && x.every((y) => typeof y !== 'object')) ? '' : ' '}${yaml(x, `${s}  `)}`)
      .join('');
  return typeof v === 'string' ? JSON.stringify(v) : String(v);
};

await Promise.all([DIR_IMG, DIR_CAPA, DIR_FICHA].map((d) => mkdir(d, { recursive: true })));

for (const img of catalogo) {
  const ficha = { codigo: img.codigo, provisional: true, tema: img.oscuro ? 'oscuro' : 'claro' };
  for (const recorte of ['escritorio', 'celular']) {
    const e = img[recorte];
    if (!e) continue;
    const archivo = `${img.codigo}-${recorte}.png`;
    const svg = lienzo({
      w: e.w,
      h: e.h,
      fondo: img.oscuro ? NOCHE : (img.fondo ?? SAL),
      trazo: img.oscuro ? BRUMA : TINTA,
      etiqueta: `${img.codigo} · ${img.nombre}`,
      dibujo: e.dibujo,
      etiquetaY: recorte === 'celular' && img.codigo === 'IMG-01' ? 0.97 : 0.94,
    });
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(`${DIR_IMG}/${archivo}`);
    const datos = { archivo, ancho: e.w, alto: e.h, foco: e.foco.map((v) => n(v * 100)) };
    if (e.capa) {
      const capa = `${img.codigo}-${recorte}.svg`;
      await writeFile(`${DIR_CAPA}/${capa}`, capaSvg({ w: e.w, h: e.h, ...e.capa }));
      datos.capa = { archivo: capa, estado: e.estado ?? (e.capa.brecha ? 'brecha' : 'cierra') };
      if (e.rotulo) datos.capa.rotulo = e.rotulo.map((v) => n(v * 100));
      if (e.cierreDy) datos.capa.cierre_dy = n(e.cierreDy);
      if (e.puntos) datos.capa.puntos = e.puntos.map(([x, y]) => ({ x: n(x * 100), y: n(y * 100) }));
    }
    ficha[recorte] = datos;
  }
  await writeFile(`${DIR_FICHA}/${img.codigo}.yaml`, `# Ficha de imagen. Coordenadas en porcentaje del lienzo (x, y).${yaml(ficha)}\n`);
  console.log('✓', img.codigo);
}
