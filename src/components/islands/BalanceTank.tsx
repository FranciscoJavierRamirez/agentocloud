// Isla: escenarios del estanque (normal, fuga, sensor que deriva). Es una ilustración con los valores fijos
// del contenido: no lleva lógica del producto. El escenario vive en una tienda compartida, para que la capa
// del gemelo de la foto vecina cambie con él.
import { useStore } from '@nanostores/react';
import { registrar } from '@/lib/analitica';
import { conSigno } from '@/lib/formato';
import { anchoBarra } from '@/lib/graficos';
import { $escenario, type Escenario } from '@/lib/tiendas';
import { opcionSegmentada, rotulo, segmentado } from './partes/estilos';

interface Textos {
  instruccion: string;
  unidad: string;
  barras: { entra: string; sale: string; cambio: string };
  escenarios: {
    id: Escenario;
    etiqueta: string;
    entra: number;
    sale: number;
    cambio: number;
    cierra: boolean;
    sensor_rayado?: boolean;
    texto: string;
    veredicto: string;
  }[];
  lector_pantalla: string;
}
interface Props {
  lang: string;
  textos: Textos;
  interfaz: { escenario: string; cierra: string; noCierra: string };
}

export default function BalanceTank({ lang, textos, interfaz }: Props) {
  const elegido = useStore($escenario);
  const e = textos.escenarios.find((x) => x.id === elegido) ?? textos.escenarios[0];
  const maximo = Math.max(...textos.escenarios.flatMap((x) => [x.entra, x.sale]), 1);
  const dec = (v: number) => (Number.isInteger(v) ? 0 : 1);
  const filas = [
    { clave: 'entra', nombre: textos.barras.entra, valor: e.entra, relleno: 'bg-tinta', tachado: false },
    { clave: 'sale', nombre: textos.barras.sale, valor: e.sale, relleno: 'bg-tinta', tachado: false },
    {
      clave: 'cambio',
      nombre: textos.barras.cambio,
      valor: e.cambio,
      relleno: e.sensor_rayado ? 'rayado' : e.cierra ? 'bg-tinta' : 'rayado-cobre',
      tachado: Boolean(e.sensor_rayado),
    },
  ];

  const elegir = (id: Escenario) => {
    $escenario.set(id);
    registrar('balance_escenario', { escenario: id });
  };

  return (
    <div className="flex flex-col gap-5" data-isla="balance" data-escenario={e.id}>
      <p className="text-cuerpo text-texto-2">{textos.instruccion}</p>

      <fieldset className={segmentado}>
        <legend className="sr-only">{interfaz.escenario}</legend>
        {textos.escenarios.map((x) => (
          <label key={x.id} className={opcionSegmentada}>
            <input type="radio" name="escenario" value={x.id} checked={x.id === e.id} onChange={() => elegir(x.id)} className="sr-only" />
            {x.etiqueta}
          </label>
        ))}
      </fieldset>

      <dl className="flex flex-col gap-4">
        {filas.map((f) => (
          <div key={f.clave} className="flex flex-col gap-1">
            <dt className={rotulo}>{f.nombre}</dt>
            <dd className="flex items-center gap-3">
              <span className="bg-sup-2 rounded-control relative h-4 flex-1 overflow-hidden">
                <span
                  className={`ease-resorte absolute inset-0 block origin-left transition-transform duration-(--dur-3) ${f.relleno}`}
                  style={{ transform: `scaleX(${f.valor ? Math.max(anchoBarra(f.valor, maximo), 6) / 100 : 0})` }}
                />
              </span>
              <span className={`text-cuerpo w-28 text-right font-mono tabular-nums ${f.tachado ? 'text-texto-2 line-through' : ''}`}>
                {conSigno(lang, f.valor, dec(f.valor))} {textos.unidad}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      {/* La cuenta a la vista: cuando el balance no cierra, el signo = pasa a ≠, en cobre. */}
      <p className="rotulo text-tinta border-linea flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4" aria-hidden="true">
        <span>
          {textos.barras.entra} {conSigno(lang, e.entra, dec(e.entra))}
        </span>
        <span>−</span>
        <span>
          {textos.barras.sale} {conSigno(lang, e.sale, dec(e.sale))}
        </span>
        <span className={`text-sub font-medium ${e.cierra ? '' : 'text-cobre-texto'}`}>{e.cierra ? interfaz.cierra : interfaz.noCierra}</span>
        <span className={e.sensor_rayado ? 'text-texto-2 line-through' : ''}>
          {textos.barras.cambio} {conSigno(lang, e.cambio, dec(e.cambio))}
        </span>
      </p>

      <div aria-live="polite" className="flex flex-col gap-2">
        <p
          className={`rotulo rounded-control flex w-fit items-center gap-2 border px-3 py-2 ${e.cierra ? 'border-linea text-tinta' : 'border-cobre text-cobre-texto'}`}
          data-veredicto={e.cierra ? 'cierra' : 'no-cierra'}
        >
          <span aria-hidden="true">{e.cierra ? interfaz.cierra : interfaz.noCierra}</span>
          {e.veredicto}
        </p>
        <p className="text-cuerpo text-tinta">{e.texto}</p>
      </div>
    </div>
  );
}
