/// <reference types="astro/client" />

// Entorno del Worker (bindings y secretos). Solo lo usa src/pages/api/contacto.ts.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}

interface ImportMetaEnv {
  readonly PUBLIC_AGENDA_URL?: string;
  readonly PUBLIC_TURNSTILE_SITEKEY?: string;
  readonly PUBLIC_ANALITICA_SRC?: string;
  readonly PUBLIC_ANALITICA_DOMINIO?: string;
}
