// Isla: extracción del campo de pozos frente al límite del permiso. Ilustración con valores fijos.
// Control nativo de rango con botones − y + (alternativa a arrastrar, WCAG 2.2).
import { useState } from 'react';
import { registrar } from '@/lib/analitica';
import { numero } from '@/lib/formato';
import { POZOS } from '@/lib/graficos';
import { botonSecundario, rotulo } from './partes/estilos';

interface Props {
  lang: string;
  textos: {
    instruccion: string;
    control: string;
    rotulo_limite: string;
    estados: { id: 'bajo' | 'sobre'; veredicto: string; texto: string }[];
  };
  interfaz: { menos: string; mas: string; limite: string; unidadExtraccion: string };
}

export default function WellField({ lang, textos, interfaz }: Props) {
  const [total, setTotal] = useState(POZOS.inicial);
  const sobre = total > POZOS.limite;
  const estado = textos.estados.find((x) => x.id === (sobre ? 'sobre' : 'bajo')) ?? textos.estados[0];
  const pct = (v: number) => (v / POZOS.maximo) * 100;
  const cambiar = (v: number) => {
    const nuevo = Math.min(POZOS.maximo, Math.max(POZOS.minimo, v));
    setTotal(nuevo);
    registrar('pozos_extraccion', { sobre_limite: nuevo > POZOS.limite });
  };
  const dentro = Math.min(total, POZOS.limite);

  return (
    <div className="flex flex-col gap-5" data-isla="pozos" data-estado={estado.id}>
      <p className="text-cuerpo text-texto-2">{textos.instruccion}</p>

      <div className="flex flex-col gap-2">
        <div className="relative pt-6">
          <span className="rotulo text-texto-2 absolute top-0 -translate-x-full pr-2 whitespace-nowrap" style={{ left: `${pct(POZOS.limite)}%` }}>
            {textos.rotulo_limite}
          </span>
          <div className="bg-sup-2 rounded-control relative flex h-8 overflow-hidden">
            {POZOS.reparto.map((parte, i) => (
              <span key={POZOS.nombres[i]} className="bg-tinta border-sup-2 block h-full border-r" style={{ width: `${pct(dentro * parte)}%` }} />
            ))}
            {sobre && <span className="rayado-cobre block h-full" style={{ width: `${pct(total - POZOS.limite)}%` }} data-excedido />}
          </div>
          <span className="border-tinta absolute top-4 bottom-0 border-l border-dashed" style={{ left: `${pct(POZOS.limite)}%` }} aria-hidden="true" />
        </div>
        <ul className="rotulo text-texto-2 flex gap-4" aria-hidden="true">
          {POZOS.nombres.map((nombre) => (
            <li key={nombre}>{nombre}</li>
          ))}
        </ul>
      </div>

      <p className="text-seccion font-mono tabular-nums">
        {numero(lang, total)} <span className="text-sub text-texto-2">{interfaz.unidadExtraccion}</span>
        <span className={`${rotulo} ml-3`}>
          {interfaz.limite} {numero(lang, POZOS.limite)} {interfaz.unidadExtraccion}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button type="button" className={botonSecundario} onClick={() => cambiar(total - POZOS.paso)} disabled={total <= POZOS.minimo} aria-label={`${interfaz.menos}: ${textos.control}`}>
          −
        </button>
        <input
          type="range"
          className="perilla"
          min={POZOS.minimo}
          max={POZOS.maximo}
          step={POZOS.paso}
          value={total}
          onChange={(ev) => cambiar(Number(ev.target.value))}
          aria-label={textos.control}
          aria-valuetext={`${numero(lang, total)} ${interfaz.unidadExtraccion}. ${estado.veredicto}`}
        />
        <button type="button" className={botonSecundario} onClick={() => cambiar(total + POZOS.paso)} disabled={total >= POZOS.maximo} aria-label={`${interfaz.mas}: ${textos.control}`}>
          +
        </button>
      </div>

      <div aria-live="polite" className="flex flex-col gap-2">
        <p className={`rotulo rounded-control w-fit border px-3 py-2 ${sobre ? 'border-cobre text-cobre-texto' : 'border-linea text-tinta'}`} data-veredicto={estado.id}>
          {estado.veredicto}
        </p>
        <p className="text-cuerpo text-tinta">{estado.texto}</p>
      </div>
    </div>
  );
}
