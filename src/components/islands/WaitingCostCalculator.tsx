// Isla: cuánto cuesta esperar. El único cálculo del sitio es física general de bombeo (src/lib/calculadora.ts),
// con la fórmula a la vista. La cifra sale de los datos del visitante y se calcula en su navegador.
import { useState } from 'react';
import { registrar } from '@/lib/analitica';
import { costoDeEsperar } from '@/lib/calculadora';
import { numero } from '@/lib/formato';
import { plantilla } from '@/lib/plantilla';
import { Cifra } from './partes/Cifra';
import { botonSecundario, campo, rotulo } from './partes/estilos';

type IdEntrada = 'caudal' | 'altura' | 'horas' | 'eficiencia' | 'tarifa' | 'perdida';
interface Props {
  lang: string;
  moneda: string;
  textos: {
    instruccion: string;
    nota: string;
    deslizador: { etiqueta: string; minimo: number; maximo: number; inicial: number };
    entradas: { id: IdEntrada; etiqueta: string; unidad: string; ejemplo: number | null; ayuda?: string }[];
    salidas: { energia_anual: string; valor_punto: string; costo_dia: string; costo_total: string };
    formula: { titulo: string; lineas: string[] };
    estado_vacio: string;
  };
  interfaz: { menos: string; mas: string };
}

export default function WaitingCostCalculator({ lang, moneda, textos, interfaz }: Props) {
  const { deslizador: d } = textos;
  const [dias, setDias] = useState(d.inicial);
  const [valores, setValores] = useState<Record<string, string>>(() =>
    Object.fromEntries(textos.entradas.map((e) => [e.id, e.ejemplo === null ? '' : String(e.ejemplo)])),
  );
  const [tocada, setTocada] = useState<IdEntrada | null>(null);

  const leer = (id: IdEntrada) => (valores[id].trim() === '' ? Number.NaN : Number(valores[id].replace(',', '.')));
  const entradas = { caudal: leer('caudal'), altura: leer('altura'), horas: leer('horas'), eficiencia: leer('eficiencia'), tarifa: leer('tarifa'), perdida: leer('perdida') };
  const completo = costoDeEsperar(entradas);
  // Sin tarifa todavía se puede mostrar la energía: se calcula con tarifa 0 y no se muestran costos.
  const parcial = completo ?? costoDeEsperar({ ...entradas, tarifa: 0 });
  const cambiarDias = (v: number) => {
    setDias(Math.min(d.maximo, Math.max(d.minimo, v)));
    registrar('costo_dias');
  };
  // Qué términos de la fórmula dependen de cada entrada: se resaltan al cambiarla.
  const lineasDe: Record<IdEntrada, number[]> = { caudal: [0], altura: [0], eficiencia: [0, 2], horas: [1, 2], tarifa: [2], perdida: [2] };

  return (
    <div className="grid gap-8 lg:grid-cols-12" data-isla="costo">
      <div className="flex flex-col gap-5 lg:col-span-7">
        <p className="text-cuerpo text-texto-2">{textos.instruccion}</p>

        <div aria-live="polite" className="flex flex-col gap-1">
          <p className={rotulo}>{plantilla(textos.salidas.costo_total, { dias })}</p>
          {completo ? (
            <p className="text-cifra text-tinta font-mono font-medium tabular-nums" data-salida="costo_total">
              <span className="text-sub text-texto-2 mr-2 font-normal">{moneda}</span>
              <Cifra valor={completo.costoDia * dias} lang={lang} />
            </p>
          ) : (
            <p className="text-bajada text-texto-2" data-salida="vacio">
              {parcial ? textos.entradas.find((e) => e.id === 'tarifa')?.ayuda : textos.estado_vacio}
            </p>
          )}
        </div>

        {/* 30 marcas de días: cada día de espera es brecha, costo que no debería existir. */}
        <div className="flex h-8 items-end gap-0.5" aria-hidden="true">
          {Array.from({ length: d.maximo }, (_, i) => (
            <span
              key={i}
              className={`ease-agento flex-1 transition-colors duration-(--dur-1) ${i < dias ? 'bg-cobre h-full' : 'bg-sup-2 h-1/2'}`}
              style={{ transitionDelay: `${i * 12}ms` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="costo-dias" className="text-cuerpo font-medium">
            {d.etiqueta}: <span className="font-mono tabular-nums">{dias}</span>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" className={botonSecundario} onClick={() => cambiarDias(dias - 1)} disabled={dias <= d.minimo} aria-label={interfaz.menos}>
              −
            </button>
            <input id="costo-dias" type="range" className="perilla" min={d.minimo} max={d.maximo} value={dias} onChange={(ev) => cambiarDias(Number(ev.target.value))} />
            <button type="button" className={botonSecundario} onClick={() => cambiarDias(dias + 1)} disabled={dias >= d.maximo} aria-label={interfaz.mas}>
              +
            </button>
          </div>
        </div>

        <dl className="border-linea grid gap-4 border-t pt-4 sm:grid-cols-3">
          {[
            { clave: 'costo_dia', nombre: textos.salidas.costo_dia, valor: completo ? `${moneda} ${numero(lang, completo.costoDia, 2)}` : '—' },
            { clave: 'valor_punto', nombre: textos.salidas.valor_punto, valor: completo ? `${moneda} ${numero(lang, completo.costoAnual)}` : '—' },
            { clave: 'energia_anual', nombre: textos.salidas.energia_anual, valor: parcial ? `${numero(lang, parcial.energiaAnualMwh)} MWh` : '—' },
          ].map((s) => (
            <div key={s.clave} className="flex flex-col gap-1">
              <dt className="text-nota text-texto-2">{s.nombre}</dt>
              <dd className="text-sub font-mono tabular-nums" data-salida={s.clave}>
                {s.valor}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-nota text-texto-2">{textos.nota}</p>
      </div>

      <div className="flex flex-col gap-5 lg:col-span-5">
        <div className="grid grid-cols-2 gap-4">
          {textos.entradas.map((e) => (
            <div key={e.id} className="flex flex-col gap-1">
              <label htmlFor={`costo-${e.id}`} className="text-nota text-texto-2">
                {e.etiqueta} ({e.unidad})
              </label>
              <input
                id={`costo-${e.id}`}
                type="text"
                inputMode="decimal"
                className={`${campo} border-linea font-mono tabular-nums`}
                value={valores[e.id]}
                aria-describedby={e.ayuda ? `costo-${e.id}-ayuda` : undefined}
                onChange={(ev) => {
                  setValores((v) => ({ ...v, [e.id]: ev.target.value }));
                  setTocada(e.id);
                }}
              />
              {e.ayuda && (
                <p id={`costo-${e.id}-ayuda`} className="text-nota text-texto-2">
                  {e.ayuda}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="border-linea flex flex-col gap-2 border-t pt-4">
          <p className={rotulo}>{textos.formula.titulo}</p>
          <ol className="flex flex-col gap-2">
            {textos.formula.lineas.map((linea, i) => (
              <li key={linea} className={`text-nota ease-agento font-mono transition-colors duration-(--dur-2) ${tocada && lineasDe[tocada].includes(i) ? 'text-tinta' : 'text-texto-2'}`}>
                {linea}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
