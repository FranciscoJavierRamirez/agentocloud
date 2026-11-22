// Isla: formulario de la Radiografía de Bombeo. Primer estado: el formulario completo, que también se envía
// sin script (method="post"). Con script: validación junto a cada campo, Turnstile y estados del botón.
import { zodResolver } from '@hookform/resolvers/zod';
import { Turnstile } from '@marsidev/react-turnstile';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registrar } from '@/lib/analitica';
import { esquemaContacto, type ErrorContacto } from '@/lib/contacto';
import { botonPrimario, campo } from './partes/estilos';

interface Props {
  accion: string;
  titulo: string;
  boton: string;
  lang: string;
  privacidadUrl: string;
  sinScript: string;
  /** Clave pública de Turnstile. Vacía: el widget no se carga (desarrollo). */
  turnstile: string;
  textos: {
    campos: { nombre: string; correo: string; empresa: string; sistema: string; opcional: string };
    ejemplo_correo: string;
    ayuda: string;
    privacidad: string;
    privacidad_enlace: string;
    enviando: string;
    recibido: string;
    errores: Record<ErrorContacto, string>;
  };
}

type Campos = { nombre: string; correo: string; empresa: string; sistema: string };
type Estado = 'reposo' | 'enviando' | 'recibido' | 'error';

export default function ContactForm({ accion, titulo, boton, lang, privacidadUrl, sinScript, turnstile, textos }: Props) {
  const [estado, setEstado] = useState<Estado>('reposo');
  const [ficha, setFicha] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Campos>({ resolver: zodResolver(esquemaContacto) as never, mode: 'onBlur', defaultValues: { nombre: '', correo: '', empresa: '', sistema: '' } });

  const enviar = handleSubmit(async (datos, evento) => {
    setEstado('enviando');
    try {
      const formulario = evento?.target as HTMLFormElement | undefined;
      const trampa = (formulario?.elements.namedItem('sitio_web') as HTMLInputElement | null)?.value ?? '';
      const respuesta = await fetch(accion, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...datos, sitio_web: trampa, lang, 'cf-turnstile-response': ficha }),
      });
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      setEstado('recibido');
      registrar('formulario_enviado', { origen: 'radiografia' });
    } catch {
      setEstado('error');
    }
  });

  const error = (clave: keyof Campos) => {
    const mensaje = errors[clave]?.message as ErrorContacto | undefined;
    return mensaje ? (textos.errores[mensaje] ?? textos.errores.envio) : undefined;
  };
  const filas: { id: keyof Campos; etiqueta: string; tipo: string; auto: string; opcional?: boolean; ejemplo?: string }[] = [
    { id: 'nombre', etiqueta: textos.campos.nombre, tipo: 'text', auto: 'name' },
    { id: 'correo', etiqueta: textos.campos.correo, tipo: 'email', auto: 'email', ejemplo: textos.ejemplo_correo },
    { id: 'empresa', etiqueta: textos.campos.empresa, tipo: 'text', auto: 'organization' },
    { id: 'sistema', etiqueta: textos.campos.sistema, tipo: 'text', auto: 'off', opcional: true },
  ];

  return (
    <form method="post" action={accion} onSubmit={enviar} noValidate className="flex flex-col gap-4" aria-label={titulo} data-isla="contacto" data-estado-envio={estado}>
      <input type="hidden" name="lang" value={lang} />
      {/* Campo trampa: las personas no lo ven; quien lo llena no es una persona. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="contacto-sitio-web">Sitio web</label>
        <input id="contacto-sitio-web" name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {filas.map((f) => {
        const mensaje = error(f.id);
        return (
          <div key={f.id} className="flex flex-col gap-2">
            <label htmlFor={`contacto-${f.id}`} className="text-cuerpo font-medium">
              {f.etiqueta}
              {f.opcional && <span className="text-texto-2 font-normal"> {textos.campos.opcional}</span>}
            </label>
            <input
              id={`contacto-${f.id}`}
              type={f.tipo}
              autoComplete={f.auto}
              placeholder={f.ejemplo}
              required={!f.opcional}
              aria-invalid={mensaje ? true : undefined}
              aria-describedby={mensaje ? `contacto-${f.id}-error` : undefined}
              className={`${campo} ${mensaje ? 'border-alerta' : 'border-linea'}`}
              {...register(f.id)}
            />
            {mensaje && (
              <p id={`contacto-${f.id}-error`} className="text-cuerpo text-alerta">
                {mensaje}
              </p>
            )}
          </div>
        );
      })}

      {turnstile && <Turnstile siteKey={turnstile} onSuccess={setFicha} onExpire={() => setFicha('')} options={{ theme: 'light', language: lang, size: 'flexible' }} />}

      <div className="flex flex-col gap-1">
        <button type="submit" className={`${botonPrimario} w-full`} disabled={estado === 'enviando' || estado === 'recibido'}>
          {estado === 'enviando' ? textos.enviando : boton}
        </button>
        <span className="trazo-envio bg-tinta block h-0.5" aria-hidden="true" />
      </div>

      <p role="status" aria-live="polite" className="text-cuerpo empty:hidden" data-resultado>
        {estado === 'recibido' ? textos.recibido : null}
      </p>
      {estado === 'error' && (
        <p role="alert" className="text-cuerpo text-alerta">
          {textos.errores.envio}
        </p>
      )}

      <p className="text-nota text-texto-2">
        {textos.ayuda} {textos.privacidad}{' '}
        <a href={privacidadUrl} className="underline underline-offset-2">
          {textos.privacidad_enlace}
        </a>
      </p>
      <noscript>
        <p className="text-nota text-texto-2">{sinScript}</p>
      </noscript>
    </form>
  );
}
