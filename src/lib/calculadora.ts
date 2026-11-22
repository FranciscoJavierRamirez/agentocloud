// Costo de esperar: física general de bombeo, con la fórmula a la vista en el sitio.
// Es el único cálculo del sitio; no contiene lógica del producto.
//   Potencia (kW) = 9,81 × caudal (m³/s) × altura (m) ÷ eficiencia
//   Energía anual (kWh) = potencia × horas de operación al año
//   Costo por día = (potencia con la eficiencia perdida − potencia actual) × horas al año ÷ 365 × tarifa

export interface Entradas {
  /** l/s */
  caudal: number;
  /** m */
  altura: number;
  /** horas de operación al año */
  horas: number;
  /** % */
  eficiencia: number;
  /** USD/MWh */
  tarifa: number;
  /** puntos de eficiencia perdidos */
  perdida: number;
}

export interface Salidas {
  potenciaKw: number;
  energiaAnualMwh: number;
  potenciaConPerdidaKw: number;
  costoAnual: number;
  costoDia: number;
}

const G = 9.81;

export function potenciaKw(caudalLs: number, alturaM: number, eficienciaPct: number) {
  return (G * (caudalLs / 1000) * alturaM) / (eficienciaPct / 100);
}

/** Devuelve null si faltan datos o no son físicamente válidos. */
export function costoDeEsperar(e: Entradas): Salidas | null {
  const validos = [e.caudal, e.altura, e.horas, e.eficiencia, e.tarifa, e.perdida].every((v) => Number.isFinite(v));
  if (!validos || e.caudal <= 0 || e.altura <= 0 || e.horas <= 0 || e.tarifa < 0 || e.perdida < 0) return null;
  if (e.eficiencia <= 0 || e.eficiencia > 100 || e.eficiencia - e.perdida <= 0) return null;

  const actual = potenciaKw(e.caudal, e.altura, e.eficiencia);
  const conPerdida = potenciaKw(e.caudal, e.altura, e.eficiencia - e.perdida);
  const costoAnual = ((conPerdida - actual) * e.horas * e.tarifa) / 1000;

  return {
    potenciaKw: actual,
    energiaAnualMwh: (actual * e.horas) / 1000,
    potenciaConPerdidaKw: conPerdida,
    costoAnual,
    costoDia: costoAnual / 365,
  };
}

/** Energía teórica para subir 1 m³ a una altura (kWh/m³): 9,81 × altura ÷ 3.600. */
export const kwhPorM3 = (alturaM: number, eficienciaPct = 100) => (G * alturaM) / 3600 / (eficienciaPct / 100);
