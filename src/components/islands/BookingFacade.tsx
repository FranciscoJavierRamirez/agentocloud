// Isla: fachada de la agenda. Primer estado: un botón con enlace directo. El widget de terceros (Cal.com o
// Calendly) se carga solo al tocar el botón: no le cuesta nada a quien no agenda.
import { useRef, useState, type MouseEvent } from 'react';
import { registrar } from '@/lib/analitica';
import { botonPrimario, botonSecundario } from './partes/estilos';

interface Props {
  texto: string;
  /** URL pública de la agenda (PUBLIC_AGENDA_URL). Vacía: el botón escribe al correo de contacto. */
  url: string;
  correo: string;
  sinHoras: string;
  cerrar: string;
  aviso: string;
}

export default function BookingFacade({ texto, url, correo, sinHoras, cerrar, aviso }: Props) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [abierta, setAbierta] = useState(false);
  const href = url || `mailto:${correo}?subject=${encodeURIComponent(texto)}`;

  const abrir = (ev: MouseEvent<HTMLAnchorElement>) => {
    registrar('agendar', { origen: 'primer-paso' });
    if (!url || ev.metaKey || ev.ctrlKey || !dialogo.current?.showModal) return;
    ev.preventDefault();
    setAbierta(true);
    dialogo.current.showModal();
  };

  return (
    <>
      <a href={href} className={botonPrimario} onClick={abrir} {...(url ? { target: '_blank', rel: 'noopener noreferrer' } : {})} data-isla="agenda">
        {texto}
        {url && <span className="sr-only"> {aviso}</span>}
      </a>
      {url && (
        <dialog ref={dialogo} className="hoja" aria-label={texto} onClose={() => setAbierta(false)}>
          <div className="flex flex-col gap-3 p-4">
            <button type="button" className={`${botonSecundario} self-end`} onClick={() => dialogo.current?.close()}>
              {cerrar}
            </button>
            {abierta && <iframe src={url} title={texto} className="rounded-control border-linea alto-agenda w-full border" loading="lazy" />}
            <p className="text-nota text-texto-2">{sinHoras}</p>
          </div>
        </dialog>
      )}
    </>
  );
}
