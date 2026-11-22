// Medición sin cookies. Sin proveedor configurado no sale nada del navegador:
// los eventos solo se emiten como CustomEvent ("agento:evento") para depurar o conectar después.
// Compatible con la API de Plausible y de Umami si alguna se carga en Analytics.astro.

export type Evento =
  | 'balance_escenario'
  | 'balance_pestana'
  | 'pozos_extraccion'
  | 'diferencia_vista'
  | 'diferencia_recorrido'
  | 'costo_dias'
  | 'agendar'
  | 'whatsapp'
  | 'formulario_enviado';

type Propiedades = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (evento: string, opciones?: { props?: Propiedades }) => void;
    umami?: { track: (evento: string, datos?: Propiedades) => void };
  }
}

export function registrar(evento: Evento, props: Propiedades = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('agento:evento', { detail: { evento, ...props } }));
  window.plausible?.(evento, { props });
  window.umami?.track(evento, props);
}
