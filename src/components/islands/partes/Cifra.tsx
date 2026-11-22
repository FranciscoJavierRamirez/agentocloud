// Cifra de medidor: cada dígito rueda a su valor (NumberFlow). El HTML de la compilación trae la cifra final,
// así que sin script o con movimiento reducido se lee igual.
import NumberFlow from '@number-flow/react';
import { useEffect, useState } from 'react';
import { numero } from '@/lib/formato';

interface Props {
  valor: number;
  decimales?: number;
  lang: string;
  /** Cuenta desde 0 la primera vez que se muestra */
  desdeCero?: boolean;
}

export function Cifra({ valor, decimales = 0, lang, desdeCero = false }: Props) {
  const [animada, setAnimada] = useState(false);
  const [mostrado, setMostrado] = useState(desdeCero ? 0 : valor);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setAnimada(true);
  }, []);
  useEffect(() => {
    if (!animada) return;
    const cuadro = requestAnimationFrame(() => setMostrado(valor));
    return () => cancelAnimationFrame(cuadro);
  }, [animada, valor]);

  if (!animada) return <span>{numero(lang, valor, decimales)}</span>;
  return (
    <NumberFlow
      value={mostrado}
      locales={lang}
      format={{ minimumFractionDigits: decimales, maximumFractionDigits: decimales, useGrouping: 'always' }}
      aria-label={numero(lang, valor, decimales)}
    />
  );
}
