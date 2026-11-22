import { describe, expect, it } from 'vitest';
import { costoDeEsperar, kwhPorM3 } from './calculadora';
import { conUnidad, moneda, numero, segmentos } from './formato';

// Caso de prueba de referencia de la calculadora
const caso = { caudal: 250, altura: 3000, horas: 8000, eficiencia: 75, tarifa: 100, perdida: 1 };

describe('costo de esperar', () => {
  const r = costoDeEsperar(caso)!;

  it('potencia actual: 9.810 kW', () => expect(r.potenciaKw).toBeCloseTo(9810, 1));
  it('energía anual: 78.480 MWh', () => expect(r.energiaAnualMwh).toBeCloseTo(78480, 0));
  it('potencia con 74 %: 9.942,6 kW', () => expect(r.potenciaConPerdidaKw).toBeCloseTo(9942.6, 1));
  it('costo anual de la pérdida: USD 106.054', () => expect(Math.round(r.costoAnual)).toBe(106054));
  it('costo por día: USD 290,56', () => expect(r.costoDia).toBeCloseTo(290.56, 2));
  it('costo de esperar 14 días: USD 4.067,83', () => expect(r.costoDia * 14).toBeCloseTo(4067.83, 2));

  it('sin datos válidos no calcula', () => {
    expect(costoDeEsperar({ ...caso, caudal: 0 })).toBeNull();
    expect(costoDeEsperar({ ...caso, tarifa: Number.NaN })).toBeNull();
    expect(costoDeEsperar({ ...caso, eficiencia: 1, perdida: 1 })).toBeNull();
  });
});

describe('energía por metro cúbico', () => {
  it('8,2 kWh/m³ teóricos a 3.000 m', () => expect(kwhPorM3(3000)).toBeCloseTo(8.2, 1));
  it('10,9 con 75 % de eficiencia', () => expect(kwhPorM3(3000, 75)).toBeCloseTo(10.9, 1));
});

describe('formato por idioma', () => {
  it('español de Chile', () => {
    expect(numero('es-CL', 1250.5, 1)).toBe('1.250,5');
    expect(numero('es-CL', 4067.83, 2)).toBe('4.067,83');
    expect(conUnidad('es-CL', 68, 0, '%')).toBe('68 %');
    expect(conUnidad('es-CL', -2.5, 1, 'l/s')).toBe('−2,5 l/s');
    expect(moneda('es-CL', 290.56, 'USD', 2)).toBe('USD 290,56');
  });
  it('inglés', () => expect(numero('en', 1250.5, 1)).toBe('1,250.5'));
  it('rótulo en segmentos', () => expect(segmentos('PZ-12 · −2,5 L/S · SIMULADO')).toEqual(['PZ-12', '−2,5 L/S', 'SIMULADO']));
});
