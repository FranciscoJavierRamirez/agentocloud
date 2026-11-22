// Isla: la misma curva, vista por una alarma y por el gemelo. SVG propio con escalas de D3: el gráfico es
// texto real (se traduce y se lee con lector de pantalla) y usa el mismo lenguaje que la capa del gemelo.
// Datos ilustrativos y fijos; no explica cómo se distingue la causa.
import { useStore } from '@nanostores/react';
import { useRef, useState, type PointerEvent } from 'react';
import { registrar } from '@/lib/analitica';
import { conSigno, numero } from '@/lib/formato';
import { BANDA, DIAS, DIA_ALARMA, DIA_DESVIACION, LIENZO, LIENZO_CELULAR, UMBRAL, geometriaDesviacion, type Lienzo } from '@/lib/graficos';
import { plantilla } from '@/lib/plantilla';
import { $vista, type Vista } from '@/lib/tiendas';
import { botonSecundario, opcionSegmentada, segmentado } from './partes/estilos';

interface Props {
  lang: string;
  instruccion: string;
  vistas: { id: Vista; etiqueta: string; resumen: string }[];
  grafico: {
    eje_x: string;
    eje_y: string;
    series: { modelo: string; medicion: string; umbral: string };
    estados: { sin_aviso: string; alarma: string; dentro: string; desviacion: string };
    cotas: { sin_aviso: string; antes: string };
    recorrido_lector: string;
    alt: string;
  };
  interfaz: { vista: string; dia: string; menos: string; mas: string; noCarga: string };
}

const texto = 'fill-texto-2 font-mono text-nota';
// Rótulos dentro del gráfico: llevan un halo del color de la tarjeta para leerse sobre líneas y cursor.
const halo = 'stroke-sup [paint-order:stroke] [stroke-linejoin:round] [stroke-width:4px]';
const fundido = 'ease-agento transition-opacity duration-(--dur-2)';

// La isla reserva una franja superior para la cota de tiempo; el gráfico en reposo (charts/) no la necesita.
const LIENZO_ISLA: Lienzo = { ...LIENZO, alto: 340, margen: { ...LIENZO.margen, arriba: 52 } };
const LIENZO_ISLA_CELULAR: Lienzo = { ...LIENZO_CELULAR, alto: 300, margen: { ...LIENZO_CELULAR.margen, arriba: 52 } };

type Tono = 'neutro' | 'alerta' | 'ok' | 'brecha';
const tonoEstado: Record<Tono, string> = {
  neutro: 'bg-sup-2 text-texto-2',
  alerta: 'bg-alerta/10 text-alerta',
  ok: 'bg-patina/15 text-patina-texto',
  brecha: 'bg-cobre/15 text-cobre-texto',
};
const tonoPunto: Record<Tono, string> = { neutro: 'fill-tinta', alerta: 'fill-alerta', ok: 'fill-tinta', brecha: 'fill-cobre' };

export default function AlarmVsTwinChart({ lang, instruccion, vistas, grafico, interfaz }: Props) {
  const vista = useStore($vista);
  const agento = vista === 'agento';
  const [dia, setDia] = useState<number | null>(null);
  const registrado = useRef(false);
  const diaActual = dia ?? (agento ? DIA_DESVIACION : DIA_ALARMA);
  const resumen = vistas.find((v) => v.id === vista)?.resumen;

  const elegirVista = (id: Vista) => {
    $vista.set(id);
    setDia(null);
    registrar('diferencia_vista', { vista: id });
  };
  const recorrer = (d: number) => {
    setDia(Math.min(DIAS, Math.max(1, Math.round(d))));
    if (!registrado.current) {
      registrado.current = true;
      registrar('diferencia_recorrido');
    }
  };

  const p = geometriaDesviacion().serie[diaActual - 1];
  const tono: Tono = agento ? (diaActual < DIA_DESVIACION ? 'ok' : 'brecha') : diaActual < DIA_ALARMA ? 'neutro' : 'alerta';
  const estado = {
    neutro: grafico.estados.sin_aviso,
    alerta: grafico.estados.alarma,
    ok: grafico.estados.dentro,
    brecha: plantilla(grafico.estados.desviacion, { desviacion: conSigno(lang, p.desviacion, 1) }),
  }[tono];
  // La cota mide tiempo: los días que la alarma calla, o los días que el gemelo gana.
  const cota = agento
    ? { desde: DIA_DESVIACION, rotulo: plantilla(grafico.cotas.antes, { dias: DIA_ALARMA - DIA_DESVIACION }) }
    : { desde: 1, rotulo: plantilla(grafico.cotas.sin_aviso, { dias: DIA_ALARMA - 1 }) };

  const dibujo = (lienzo: Lienzo, clase: string) => {
    const g = geometriaDesviacion(lienzo);
    const { ancho, alto, margen: m } = lienzo;
    const celular = ancho < 400;
    const base = alto - m.abajo;
    const derecha = ancho - m.derecha;
    const cx = g.x(diaActual);
    const cy = g.y(p.medicion);
    const yCota = m.arriba - 14;
    const cola = g.serie.filter((q) => q.dia >= DIA_ALARMA);
    const alPuntero = (ev: PointerEvent<SVGSVGElement>) => {
      const caja = ev.currentTarget.getBoundingClientRect();
      recorrer(g.x.invert(((ev.clientX - caja.left) / caja.width) * ancho));
    };
    return (
      <svg
        viewBox={`0 0 ${ancho} ${alto}`}
        className={`h-auto w-full cursor-crosshair touch-pan-y select-none ${clase}`}
        role="img"
        aria-label={grafico.alt}
        onPointerDown={alPuntero}
        onPointerMove={(ev) => (ev.pointerType === 'mouse' || ev.buttons || ev.pressure > 0) && alPuntero(ev)}
        data-vista={vista}
      >
        {/* Zona de alarma: todo lo que una alarma de umbral alcanza a ver. */}
        <rect
          x={m.izquierda}
          y={g.umbralY}
          width={derecha - m.izquierda}
          height={base - g.umbralY}
          className={`fill-alerta/8 ${fundido} ${agento ? 'opacity-0' : ''}`}
        />

        {g.ticksY.map((v) => (
          <g key={v}>
            <path d={`M${m.izquierda},${g.y(v)} H${derecha}`} className="stroke-tinta/10" vectorEffect="non-scaling-stroke" />
            <text x={m.izquierda - 8} y={g.y(v) + 4} textAnchor="end" className={texto}>
              {v}
            </text>
          </g>
        ))}
        <path d={`M${m.izquierda},${base} H${derecha}`} className="stroke-tinta/25" vectorEffect="non-scaling-stroke" />
        {g.ticksX.map((d) => (
          <g key={d} className={`${fundido} duration-(--dur-1) ${Math.abs(d - diaActual) < (celular ? 3 : 2) ? 'opacity-0' : ''}`}>
            <path d={`M${g.x(d)},${base} v4`} className="stroke-tinta/25" vectorEffect="non-scaling-stroke" />
            <text x={g.x(d)} y={base + 16} textAnchor="middle" className={texto}>
              {d}
            </text>
          </g>
        ))}
        <text x={derecha} y={alto - 2} textAnchor="end" className={`${texto} tracking-wider uppercase`}>
          {grafico.eje_x}
        </text>
        <text x={m.izquierda} y={10} className={`${texto} tracking-wider uppercase`}>
          {grafico.eje_y}
        </text>

        {/* Cursor: detrás de las curvas. */}
        <path d={`M${cx},${m.arriba} V${base}`} className="stroke-tinta/30" vectorEffect="non-scaling-stroke" />

        <g className={`${fundido} ${agento ? 'opacity-100' : 'opacity-0'}`}>
          <path d={g.banda} className="fill-patina/15" />
          <path d={g.brecha} className="brecha" />
          <path d={g.modelo} className="linea-esperada" />
          <text x={derecha} y={g.y(g.serie[0].modelo + BANDA) - 6} textAnchor="end" className={`fill-patina-texto font-mono text-nota ${halo}`}>
            {grafico.series.modelo}
          </text>
        </g>

        <path
          d={`M${m.izquierda},${g.umbralY} H${derecha}`}
          className={`${fundido} ${agento ? 'stroke-texto-2 opacity-50' : 'stroke-alerta'}`}
          strokeDasharray="1 4"
          vectorEffect="non-scaling-stroke"
        />
        <text x={m.izquierda + 4} y={g.umbralY - 6} className={`font-mono text-nota tracking-wider ${halo} ${agento ? 'fill-texto-2' : 'fill-alerta'}`}>
          {grafico.series.umbral}
        </text>

        <path d={g.medicion} className="linea-medida" />
        {/* Bajo el umbral, la medición pasa a rojo: es el único tramo que la alarma ve. */}
        <path
          d={`M${cola.map((q) => `${g.x(q.dia)},${g.y(q.medicion)}`).join(' L')}`}
          className={`fill-none stroke-alerta ${fundido} ${agento ? 'opacity-0' : ''}`}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />

        {/* Cota: la ventaja del producto es tiempo, y se muestra como una distancia medida. */}
        <g key={vista} className="motion-safe:animate-subir">
          <path
            d={`M${g.x(cota.desde)},${yCota - 4} v8 M${g.x(cota.desde)},${yCota} H${g.x(DIA_ALARMA)} M${g.x(DIA_ALARMA)},${yCota - 4} v8`}
            className={agento ? 'stroke-cobre' : 'stroke-texto-2'}
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={`${agento ? `M${g.puntoDesviacion.x},${yCota + 8} V${g.puntoDesviacion.y - 13} ` : ''}M${g.puntoAlarma.x},${yCota + 8} V${g.puntoAlarma.y - 10}`}
            className={agento ? 'stroke-cobre/50' : 'stroke-texto-2/50'}
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={(g.x(cota.desde) + g.x(DIA_ALARMA)) / 2}
            y={yCota - 8}
            textAnchor="middle"
            className={`font-mono text-nota font-medium tracking-wider uppercase ${agento ? 'fill-cobre-texto' : 'fill-texto-2'}`}
          >
            {cota.rotulo}
          </text>
        </g>

        {/* El anillo del día 13 crece desde 20 %: es el anillo del logo. */}
        {agento && <circle key="anillo" cx={g.puntoDesviacion.x} cy={g.puntoDesviacion.y} r={9} className="anillo motion-safe:animate-abrir" />}
        <circle cx={g.puntoAlarma.x} cy={g.puntoAlarma.y} r={10} className={`fill-alerta/20 ${fundido} ${agento ? 'opacity-0' : ''}`} />
        <circle
          cx={g.puntoAlarma.x}
          cy={g.puntoAlarma.y}
          r={4}
          className={`${fundido} ${agento ? 'fill-sup stroke-tinta opacity-50' : 'fill-alerta stroke-alerta'}`}
          vectorEffect="non-scaling-stroke"
        />

        {/* Con brecha, el cursor la mide: del modelo a la medición. */}
        {tono === 'brecha' && <path d={`M${cx},${g.y(p.modelo)} V${cy}`} className="stroke-cobre" strokeWidth={2} vectorEffect="non-scaling-stroke" />}
        <circle cx={cx} cy={cy} r={5} className={`stroke-sup ${tonoPunto[tono]}`} strokeWidth={2} />
        <g transform={`translate(${Math.min(ancho - 14, Math.max(14, cx))},${base + 12})`}>
          <rect x={-14} y={-9} width={28} height={18} rx={4} className="fill-tinta" />
          <text y={4} textAnchor="middle" className="fill-sobre font-mono text-nota font-medium">
            {diaActual}
          </text>
        </g>
      </svg>
    );
  };

  const dato = 'font-display text-sub text-tinta font-semibold tabular-nums';
  const unidad = <span className="font-sans text-cuerpo font-normal text-texto-2"> l/s</span>;

  return (
    <div className="flex flex-col gap-5" data-isla="diferencia" data-vista={vista}>
      <div className="flex flex-col gap-3 md:flex-row-reverse md:items-center md:justify-between">
        <p className="text-cuerpo text-texto-2">{instruccion}</p>
        <fieldset className={`${segmentado} min-w-0 md:w-80`}>
          <legend className="sr-only">{interfaz.vista}</legend>
          {vistas.map((v) => (
            <label key={v.id} className={`${opcionSegmentada} has-checked:shadow-sm`}>
              <input type="radio" name="vista" value={v.id} checked={v.id === vista} onChange={() => elegirVista(v.id)} className="sr-only" />
              {v.id === 'agento' && <span aria-hidden="true" className="mr-2 size-2.5 shrink-0 rounded-full border-2 border-cobre" />}
              {v.etiqueta}
            </label>
          ))}
        </fieldset>
      </div>

      <p className="max-w-lectura text-bajada text-tinta" aria-live="polite">
        {resumen}
      </p>

      <div className="grilla-grafico grid gap-x-8 gap-y-5">
        <div>
          {dibujo(LIENZO_ISLA_CELULAR, 'md:hidden')}
          {dibujo(LIENZO_ISLA, 'max-md:hidden')}
        </div>

        {/* La lectura va fuera del gráfico, nunca bajo el dedo. */}
        <div className="flex flex-col gap-4 border-linea max-lg:border-t max-lg:pt-4 lg:justify-between lg:border-l lg:pl-8">
          <div className="flex flex-col gap-4" data-lectura>
            <dl className="grilla-lecturas grid items-end gap-x-5 gap-y-4">
              <div>
                <dt className="rotulo text-texto-2">{interfaz.dia}</dt>
                <dd className="font-display text-seccion text-tinta tabular-nums">
                  {diaActual}
                  <span className="font-sans text-cuerpo font-normal text-texto-2"> / {DIAS}</span>
                </dd>
              </div>
              <div className="lg:border-t lg:border-linea lg:pt-3">
                <dt className="rotulo text-texto-2">{grafico.series.medicion}</dt>
                <dd className={dato}>
                  {numero(lang, p.medicion, 1)}
                  {unidad}
                </dd>
              </div>
              <div className="lg:border-t lg:border-linea lg:pt-3">
                <dt className="rotulo text-texto-2">{agento ? grafico.series.modelo : grafico.series.umbral}</dt>
                <dd className={`${dato} ${agento ? 'text-patina-texto' : ''}`}>
                  {numero(lang, agento ? p.modelo : UMBRAL, 1)}
                  {unidad}
                </dd>
              </div>
            </dl>
            <p
              className={`flex w-fit items-center gap-2 rounded-control px-3 py-2 rotulo transition-colors duration-(--dur-1) ease-agento ${tonoEstado[tono]}`}
            >
              <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${tono === 'neutro' ? 'border border-current' : 'bg-current'}`} />
              {estado}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className={botonSecundario} onClick={() => recorrer(diaActual - 1)} disabled={diaActual <= 1} aria-label={interfaz.menos}>
              −
            </button>
            <input
              type="range"
              className="perilla min-w-0 flex-1"
              min={1}
              max={DIAS}
              value={diaActual}
              onChange={(ev) => recorrer(Number(ev.target.value))}
              aria-label={grafico.eje_x}
              aria-valuetext={plantilla(grafico.recorrido_lector, {
                dia: diaActual,
                medicion: numero(lang, p.medicion, 1),
                desviacion: conSigno(lang, p.desviacion, 1),
              })}
            />
            <button type="button" className={botonSecundario} onClick={() => recorrer(diaActual + 1)} disabled={diaActual >= DIAS} aria-label={interfaz.mas}>
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
