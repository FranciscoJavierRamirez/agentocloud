// Isla: cifra que rueda a su valor una sola vez al entrar en pantalla. Primer estado: la cifra final.
import { Cifra } from './partes/Cifra';

interface Props { valor: number; decimales?: number; lang: string }

export default function LiveNumber({ valor, decimales = 0, lang }: Props) {
  return <Cifra valor={valor} decimales={decimales} lang={lang} desdeCero />;
}
