# Sitio web de Agento Cloud

Sitio estático de `agentocloud.com`, en español (`/`) e inglés (`/en/`): inicio, aviso de privacidad y 404.
La página interna de sistema (`/sistema/`) solo existe en `pnpm dev`: la compilación de producción no la genera.
Astro 7 · Tailwind CSS 4 · React 19 solo en islas · contenido en colecciones · Cloudflare Workers.

La carpeta `doc/` (documentación interna y fotos originales) **no se versiona** (`.gitignore`): vive solo en el equipo de trabajo.

## Uso

Requiere Node 22.12 o superior y pnpm 11.

| Comando | Qué hace |
|---|---|
| `pnpm install --frozen-lockfile` | Instala exactamente lo que dice el archivo de bloqueo |
| `pnpm dev` | Servidor de desarrollo en `http://localhost:4321` (queda en segundo plano: `pnpm astro dev stop` lo detiene) |
| `pnpm build` | Genera el sitio en `dist/` |
| `pnpm preview` | Sirve `dist/` como lo hará Cloudflare (`pnpm astro preview stop` lo detiene) |
| `pnpm check` | Tipos y esquema del contenido |
| `pnpm test` | Pruebas (calculadora y formato de cifras) |
| `pnpm revisar` | Reglas del sitio sobre el contenido y el HTML generado (después de `pnpm build`) |
| `pnpm auditar` | Vulnerabilidades conocidas y firmas del registro |
| `pnpm placeholders` | Regenera las imágenes **provisionales** (sobrescribe: no usar con fotos definitivas) |
| `pnpm imagenes` | Convierte las fotos PNG o JPG de `src/assets/imagenes/` a WebP de calidad 90, mueve los originales a `doc/imagenes_originales/` y actualiza las fichas |

## pnpm y la cadena de suministro

Las reglas están en `pnpm-workspace.yaml` y se aplican a toda instalación:

- **Cuarentena de 7 días** (`minimumReleaseAge`): no se instala ninguna versión publicada hace menos de una semana. Si una actualización urgente lo requiere, se agrega esa versión exacta a `minimumReleaseAgeExclude`, con revisión.
- **Sin degradación de procedencia** (`trustPolicy: no-downgrade`) y **sin dependencias desde git o tarballs** (`blockExoticSubdeps`).
- **Scripts de instalación bloqueados** salvo los de `allowBuilds` (`esbuild` y `workerd`).
- **Versiones exactas** en `package.json` y archivo de bloqueo versionado.

Para actualizar una dependencia: `pnpm update <paquete> --latest`, luego `pnpm check && pnpm test && pnpm build && pnpm revisar`.

## Dónde está cada cosa

```
src/content/sitio/<idioma>/     textos del inicio y textos comunes
src/content/paginas/<idioma>/   aviso de privacidad
src/content/cifras/             registro de cifras: fuente única de todo número del sitio
src/content/asesores/           vacía
src/content/imagenes/           ficha de cada imagen: recortes, punto de interés, capa del gemelo
src/assets/imagenes/            fotos                     src/assets/capas/   capas del gemelo en SVG
src/assets/logo/                logo
src/components/                 head · nav · ui · media · charts · sections · islands (React)
src/motion/                     movimientos con nombre y niveles por equipo
src/lib/                        idioma, formato de cifras, calculadora, tiendas, analítica
src/styles/                     agento.css (tokens) · agento.theme.css (tema de Tailwind) · global.css
```

Reglas del código: ningún componente lleva texto, color ni medida sueltos; toda cifra pública pasa por `SourcedStat`; toda foto del
territorio pasa por `TwinFigure`; una isla no importa otra isla; ninguna isla lleva lógica del producto. `pnpm revisar` comprueba varias de ellas.

## Cómo cambiar…

**Un texto.** Edite el archivo de `src/content/sitio/es/` o `src/content/paginas/es/`, y después su par en `en/`. Si falta una clave, la compilación falla y dice cuál.

**Una cifra.** Edite `src/content/cifras/es.yaml` y `en.yaml`. Complete `enlace` y `consultado` de cada cifra pública: el enlace aparece solo junto a la fuente.

**Una imagen.**
1. Copie la foto nueva en `src/assets/imagenes/` como PNG o JPG con el nombre del recorte (`IMG-03-escritorio.png`, `IMG-03-celular.png`) y borre el `.webp` anterior de ese recorte.
2. Ejecute `pnpm imagenes`: la convierte a WebP (foto maestra, calidad 90), guarda el original en `doc/imagenes_originales/` y actualiza `archivo` en la ficha.
3. En `src/content/imagenes/IMG-03.yaml` ajuste `ancho`, `alto`, `foco` (el punto de interés, en porcentaje) y ponga `provisional: false`. Si la foto cambió de encuadre, revise también su capa del gemelo.
4. El texto alternativo está en la sección que usa la imagen (`imagen.alt`).

Lo que recibe el visitante lo genera Astro desde la foto maestra (`src/components/media/Photo.astro`): AVIF 45 y WebP 70 en varios anchos;
las tarjetas se generan hasta 1.280 px y la textura de sal (`textura`) con menos ancho y calidad. `pnpm revisar` falla si un archivo pasa de 150 KB (250 KB el hero).

**WhatsApp.** Número, mensaje y textos en `whatsapp` de `src/content/sitio/es/00-sitio.md` (número sin «+» ni espacios). El botón flotante
está en todas las páginas y en el cierre «Primer paso». Es un enlace a `wa.me`: no carga scripts. Mide el evento `whatsapp` con su origen.

**Una capa del gemelo.** Exporte desde Figma un SVG con el `viewBox` en píxeles de la foto y cuatro elementos con estos `id`:
`esperado`, `medido`, `brecha` (trazos) y `anillo` (círculo). Guárdelo en `src/assets/capas/` con el nombre que indica la ficha y ajuste
`capa.rotulo` (posición del rótulo técnico, en porcentaje) y `capa.estado` (`brecha` o `cierra`). No se toca ningún código de animación.
En el estanque de la sección 3, `capa.cierre_dy` es cuánto sube lo medido (en unidades del `viewBox`) para calzar con lo esperado cuando el balance cierra.

**El logo.** Reemplace `src/assets/logo/logotipo-claro.svg` y `simbolo-claro.svg` por el vector final en capas. Para que se trace,
los trazos conservan `pathLength="1"` y las clases `lg-tinta`, `lg-gemelo` y `lg-cloud`. Reemplace también `public/favicon.svg`.

**Retratos, captura del prototipo, LinkedIn, agenda.** Retratos: `RET-01` y `RET-02`; captura: `CAP-01` (mismo procedimiento que una imagen).
LinkedIn: `linkedin` en `11-quienes-somos.md` y `13-pie.md` (vacío = el enlace no se muestra). Agenda: `PUBLIC_AGENDA_URL`.

## Idiomas

Activos: **español** (`/`) e **inglés** (`/en/`). El español manda: un texto se cambia primero en `es/` y después en `en/`, con las mismas claves (las anclas y las rutas sí se traducen: `#how-it-works`, `/en/privacy/`).

Para sumar otro idioma: copie las carpetas `es/` de `src/content/sitio/` y `src/content/paginas/` a la carpeta del idioma nuevo (mismas claves; solo cambian los valores, incluidas `ancla` y `ruta`), copie `cifras/es.yaml` y `asesores/es.yaml` con el código del idioma y agréguelo a `idiomasActivos` en `src/lib/idiomas.mjs`.
No se toca ningún componente: las rutas, el selector de idioma, los enlaces `hreflang`, el formato de cifras y las imágenes para compartir aparecen solos.

## Variables

Públicas, de compilación (ver `.env.example`): `PUBLIC_AGENDA_URL`, `PUBLIC_TURNSTILE_SITEKEY`, `PUBLIC_ANALITICA_SRC`, `PUBLIC_ANALITICA_DOMINIO`.
Secretas, del Worker (ver `.dev.vars.example`): `TURNSTILE_SECRET`, `CORREO_REMITENTE`, `CORREO_DESTINO`.

## Despliegue

El sitio se publica como **Cloudflare Worker con recursos estáticos** (no como proyecto de Cloudflare Pages: el adaptador de Astro genera
un Worker, y el formulario `POST /api/contacto` necesita ese Worker). Todo lo demás son páginas estáticas.

**Desde GitHub.** Repositorio privado, rama `main`. En Cloudflare: *Workers & Pages → Create application → Workers → Import a repository*.

| Ajuste | Valor |
|---|---|
| Nombre del Worker | `agento-cloud-sitio` (debe coincidir con `name` en `wrangler.jsonc`) |
| Comando de compilación | `pnpm install --frozen-lockfile && pnpm build` |
| Comando de despliegue | `npx wrangler deploy` |
| Variables de compilación | `NODE_VERSION` = `22.12.0` o superior · `PNPM_VERSION` = `11.0.8` · `PUBLIC_AGENDA_URL` (y, si se usan, `PUBLIC_TURNSTILE_SITEKEY`, `PUBLIC_ANALITICA_*`) |

Cada `git push` a `main` publica el sitio. Antes de apuntar el dominio:

1. En `wrangler.jsonc`: descomente `routes` (dominio `agentocloud.com`; `agentocloud.cl` redirige con una regla 301), `send_email` y `vars`.
2. Cloudflare Email Service: verifique el dominio remitente y el buzón de destino.
3. Turnstile: cree el widget, ponga la clave pública en `PUBLIC_TURNSTILE_SITEKEY` y el secreto con `pnpm wrangler secret put TURNSTILE_SECRET`.
4. El adaptador activa sesiones de Astro sobre KV con el binding `SESSION`. El sitio no usa sesiones: Wrangler aprovisiona ese KV al desplegar.
5. Si conecta analítica o cambia de proveedor de agenda, agregue su origen a la CSP en `astro.config.mjs` (`security.csp`).

Sin `TURNSTILE_SECRET` el formulario no verifica a quien envía, y sin el binding de correo responde con error en producción (en desarrollo registra el envío en la consola).

## Seguridad

- CSP con hashes por página (generada por Astro) y cabeceras en `public/_headers`: `frame-ancestors 'none'`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Fuentes alojadas en el propio sitio; ningún script de terceros salvo Turnstile y la agenda, que se cargan al usarlos.
- Formulario: mismo esquema Zod en navegador y servidor, Turnstile, campo trampa, tope de tamaño y comprobación de origen. No se guarda ningún dato.
- Sin mapas de fuente publicados. Las islas son ilustraciones con valores fijos: sin lógica del producto.

## Movimiento

Estado por defecto del HTML = estado final: sin script o con movimiento reducido, todo se lee.

| Nivel | Cuándo | Qué se enciende | Con qué |
|---|---|---|---|
| 0 | Sin script o movimiento reducido | Todo en su estado final | HTML y CSS |
| 1 | Pantalla táctil | Coreografía del hero, trazos al entrar, carril de balance, la luz que avanza | CSS (`global.css`) |
| 2 | Puntero fino y pantalla ancha | Lo anterior, más scroll suavizado, desfase y reencuentro, borde que sigue al puntero | GSAP + Lenis (`src/motion/escritorio.ts`, carga diferida) |

GSAP es gratuito pero no es código abierto. Su uso está aislado en `src/motion/escritorio.ts` y `movimientos.ts › desfase`.
