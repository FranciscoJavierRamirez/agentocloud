import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import { idiomaPorDefecto, idiomasActivos } from './src/lib/idiomas.mjs';

const fuente = (name, cssVariable, weights, fallbacks) => ({
  provider: fontProviders.fontsource(),
  name,
  cssVariable,
  weights,
  styles: ['normal'],
  subsets: ['latin'],
  formats: ['woff2'],
  fallbacks,
});

// Dirección pública del sitio: canónica, imagen para compartir (WhatsApp, LinkedIn), hreflang y mapa del sitio.
// Borrador en Cloudflare Pages mientras se elige el dominio principal. También se puede fijar con la variable SITIO_URL.
const sitio = process.env.SITIO_URL || 'https://agentocloud.pages.dev';

export default defineConfig({
  site: sitio,
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  adapter: cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
  integrations: [
    react(),
    sitemap({ filter: (pagina) => !pagina.includes('/sistema/') && !pagina.includes('/api/') }),
  ],
  i18n: {
    defaultLocale: idiomaPorDefecto,
    locales: idiomasActivos, // sumar un idioma: agregarlo en src/lib/idiomas.mjs y crear su carpeta de contenido
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    fuente('Schibsted Grotesk', '--fuente-display', ['400 900'], ['Helvetica Neue', 'Arial', 'sans-serif']),
    fuente('Hanken Grotesk', '--fuente-texto', ['400 700'], ['system-ui', 'sans-serif']),
    fuente('Martian Mono', '--fuente-mono', ['400 600'], ['ui-monospace', 'Menlo', 'monospace']),
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com",
        "frame-src https://challenges.cloudflare.com https://cal.com https://app.cal.com https://calendly.com",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
      scriptDirective: { resources: ["'self'", 'https://challenges.cloudflare.com'] },
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    build: { sourcemap: false },
  },
});
