// POST /api/contacto · la única pieza dinámica del sitio (Cloudflare Worker).
// Valida con el mismo esquema que el navegador, verifica Turnstile y entrega el correo. No guarda nada.
import type { APIRoute } from 'astro';
import { env as entorno } from 'cloudflare:workers';
import { esquemaContacto } from '@/lib/contacto';
import { comunes, idiomaPorDefecto, idiomasActivos, ruta } from '@/lib/i18n';

export const prerender = false;

interface Entorno {
  /** Secreto de Turnstile. Sin él no se verifica (desarrollo). En producción es obligatorio. */
  TURNSTILE_SECRET?: string;
  /** Binding send_email de Cloudflare Email Service (wrangler.jsonc). */
  EMAIL?: { send(mensaje: { to: string; from: string; replyTo?: string; subject: string; text: string }): Promise<unknown> };
  /** Remitente verificado, por ejemplo web@agentocloud.cl */
  CORREO_REMITENTE?: string;
  CORREO_DESTINO?: string;
}

const cabeceras = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
};
const json = (cuerpo: unknown, status: number) => new Response(JSON.stringify(cuerpo), { status, headers: { ...cabeceras, 'Content-Type': 'application/json; charset=utf-8' } });
const escapar = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function verificarTurnstile(secreto: string, ficha: string, ip: string | null) {
  const cuerpo = new URLSearchParams({ secret: secreto, response: ficha });
  if (ip) cuerpo.set('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: cuerpo });
  return r.ok && ((await r.json()) as { success?: boolean }).success === true;
}

export const POST: APIRoute = async ({ request, site }) => {
  const env = entorno as Entorno;
  const tipo = request.headers.get('content-type') ?? '';
  const esJson = tipo.includes('application/json');
  if (Number(request.headers.get('content-length') ?? 0) > 20_000) return json({ ok: false, error: 'envio' }, 413);
  // Solo se aceptan envíos desde el propio sitio.
  const origen = request.headers.get('origin');
  if (origen && new URL(origen).host !== new URL(request.url).host && new URL(origen).host !== site?.host) return json({ ok: false, error: 'envio' }, 403);

  let crudo: Record<string, unknown>;
  try {
    crudo = esJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'envio' }, 400);
  }
  const lang = idiomasActivos.includes(String(crudo.lang)) ? String(crudo.lang) : idiomaPorDefecto;
  const t = await comunes(lang);

  const responder = (ok: boolean, status: number, error?: string) => {
    if (esJson) return json(ok ? { ok } : { ok, error }, status);
    // Envío sin script: una página mínima con el resultado y el camino de vuelta.
    const mensaje = ok ? t.formulario.recibido : (t.formulario.errores[error as keyof typeof t.formulario.errores] ?? t.formulario.errores.envio);
    const html = `<!doctype html><html lang="${t.lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${escapar(t.organizacion.nombre)}</title><p>${escapar(mensaje)}</p><p><a href="${ruta(lang)}">${escapar(t.pagina_404.boton)}</a></p></html>`;
    return new Response(html, { status, headers: { ...cabeceras, 'Content-Type': 'text/html; charset=utf-8' } });
  };

  // Campo trampa: si viene lleno no es una persona. Se responde igual que a un envío correcto.
  if (typeof crudo.sitio_web === 'string' && crudo.sitio_web.trim() !== '') return responder(true, 200);

  const datos = esquemaContacto.safeParse(crudo);
  if (!datos.success) return responder(false, 422, datos.error.issues[0]?.message ?? 'envio');

  if (env.TURNSTILE_SECRET) {
    const ficha = String(crudo['cf-turnstile-response'] ?? '');
    if (!ficha || !(await verificarTurnstile(env.TURNSTILE_SECRET, ficha, request.headers.get('cf-connecting-ip')))) return responder(false, 403, 'envio');
  } else if (import.meta.env.PROD) {
    console.warn('[contacto] Falta TURNSTILE_SECRET: el formulario no está protegido.');
  }

  const { nombre, correo, empresa, sistema } = datos.data;
  const texto = [`Nombre: ${nombre}`, `Correo: ${correo}`, `Empresa: ${empresa}`, `Sistema: ${sistema || '—'}`, `Idioma: ${lang}`].join('\n');
  try {
    if (env.EMAIL && env.CORREO_REMITENTE) {
      await env.EMAIL.send({
        to: env.CORREO_DESTINO ?? t.organizacion.correo,
        from: env.CORREO_REMITENTE,
        replyTo: correo,
        subject: `Radiografía de Bombeo · ${empresa}`.replace(/[\r\n]/g, ' '),
        text: texto,
      });
    } else if (import.meta.env.DEV) {
      console.info(`[contacto] Sin binding de correo; envío de prueba:\n${texto}`);
    } else {
      throw new Error('Falta el binding EMAIL o CORREO_REMITENTE');
    }
  } catch (error) {
    console.error('[contacto] No se pudo entregar el correo', error);
    return responder(false, 502, 'envio');
  }
  return responder(true, 200);
};

export const ALL: APIRoute = () => new Response(null, { status: 405, headers: { ...cabeceras, Allow: 'POST' } });
