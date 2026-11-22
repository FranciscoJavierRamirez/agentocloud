// Geometría de los gráficos. Datos ILUSTRATIVOS y fijos (prototipo · datos simulados):
// sirven para dibujar la idea, no contienen lógica del producto.
import { scaleLinear } from 'd3-scale';
import { area, line } from 'd3-shape';

export const DIAS = 30;
export const DIA_DESVIACION = 13;
export const DIA_ALARMA = 26;
const CAUDAL_MODELO = 42; // l/s
const CAIDA_AL_AVISO = 2.5; // l/s: la desviación del ejemplo cuando la alarma avisa
export const UMBRAL = CAUDAL_MODELO - CAIDA_AL_AVISO;
export const BANDA = 0.35; // l/s: tolerancia del modelo

export interface Punto { dia: number; modelo: number; medicion: number; desviacion: number }

/** La misma curva para las dos vistas: la medición se aparta del modelo desde el día 13 y cruza el umbral el día 26. */
export function serieDesviacion(): Punto[] {
  const pendiente = CAIDA_AL_AVISO / (DIA_ALARMA - DIA_DESVIACION);
  return Array.from({ length: DIAS }, (_, i) => {
    const dia = i + 1;
    const ruido = Math.sin(dia * 2.3) * 0.06;
    const caida = dia > DIA_DESVIACION ? (dia - DIA_DESVIACION) * pendiente : 0;
    const medicion = Math.round((CAUDAL_MODELO - caida + (dia > DIA_DESVIACION ? 0 : ruido)) * 100) / 100;
    return { dia, modelo: CAUDAL_MODELO, medicion, desviacion: Math.round((medicion - CAUDAL_MODELO) * 10) / 10 };
  });
}

export const LIENZO = { ancho: 640, alto: 320, margen: { arriba: 20, derecha: 16, abajo: 36, izquierda: 44 } };
/** Los gráficos se dibujan en dos anchos: en celular el texto no puede bajar de 10 px reales. */
export const LIENZO_CELULAR = { ancho: 340, alto: 280, margen: { arriba: 20, derecha: 10, abajo: 36, izquierda: 34 } };
export type Lienzo = typeof LIENZO;

export function geometriaDesviacion(lienzo: Lienzo = LIENZO, serie = serieDesviacion()) {
  const { ancho, alto, margen: m } = lienzo;
  const x = scaleLinear().domain([1, DIAS]).range([m.izquierda, ancho - m.derecha]);
  const y = scaleLinear().domain([38, 43]).range([alto - m.abajo, m.arriba]);
  const trazo = line<Punto>().x((p) => x(p.dia));
  const desde = serie.filter((p) => p.dia >= DIA_DESVIACION);
  return {
    x,
    y,
    modelo: trazo.y((p) => y(p.modelo))(serie) ?? '',
    medicion: trazo.y((p) => y(p.medicion))(serie) ?? '',
    banda: area<Punto>().x((p) => x(p.dia)).y0((p) => y(p.modelo - BANDA)).y1((p) => y(p.modelo + BANDA))(serie) ?? '',
    brecha: area<Punto>().x((p) => x(p.dia)).y0((p) => y(p.modelo)).y1((p) => y(p.medicion))(desde) ?? '',
    umbralY: y(UMBRAL),
    lienzo,
    serie,
    ticksX: ancho < 400 ? [1, 13, 20, 26, 30] : [1, 5, 10, 13, 20, 26, 30],
    ticksY: [39, 40, 41, 42],
    puntoDesviacion: { x: x(DIA_DESVIACION), y: y(serie[DIA_DESVIACION - 1].medicion) },
    puntoAlarma: { x: x(DIA_ALARMA), y: y(serie[DIA_ALARMA - 1].medicion) },
  };
}

/** Barras del balance: ancho proporcional al mayor de los flujos. */
export function anchoBarra(valor: number, maximo: number) {
  return Math.max(0, Math.min(100, (Math.abs(valor) / maximo) * 100));
}

// Campo de pozos (ilustrativo): tres pozos, extracción total frente al límite del permiso.
export const POZOS = { limite: 60, minimo: 30, maximo: 75, inicial: 48, paso: 1, reparto: [0.36, 0.34, 0.3], nombres: ['PZ-10', 'PZ-11', 'PZ-12'] };
