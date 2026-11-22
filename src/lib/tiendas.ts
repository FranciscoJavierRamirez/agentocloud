// Estado compartido entre islas y la capa del gemelo de la foto vecina (Nano Stores).
// Una isla no importa otra isla: se comunican por aquí.
import { atom } from 'nanostores';

export type Escenario = 'normal' | 'fuga' | 'sensor';
export type Vista = 'alarma' | 'agento';

/** Escenario del estanque en la sección 3. El primer estado (HTML de la compilación) es "normal". */
export const $escenario = atom<Escenario>('normal');
/** Vista del gráfico de la sección 4. */
export const $vista = atom<Vista>('alarma');
