// Esquema del formulario: el mismo valida en el navegador (ContactForm) y en el servidor (api/contacto).
import { z } from 'zod';

export const esquemaContacto = z.object({
  nombre: z.string().trim().min(1, 'nombre_vacio').max(120),
  correo: z.string().trim().min(1, 'correo_vacio').max(200).pipe(z.email('correo')),
  empresa: z.string().trim().min(1, 'empresa_vacia').max(160),
  sistema: z.string().trim().max(1000).optional().default(''),
});

export type Contacto = z.infer<typeof esquemaContacto>;

/** Enlace de WhatsApp (wa.me) con el mensaje ya escrito. No carga ningún script de terceros. */
export const enlaceWhatsapp = (numero: string, mensaje: string) => `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
/** Claves de error: coinciden con `formulario.errores` del contenido. */
export type ErrorContacto = 'nombre_vacio' | 'correo_vacio' | 'correo' | 'empresa_vacia' | 'envio';
