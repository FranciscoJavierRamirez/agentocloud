// Movimientos con nombre. Los componentes no llaman a ninguna librería de animación: piden un movimiento.
// Los tres movimientos firma: el gemelo se dibuja, la brecha se abre, desfase y reencuentro.
// Los dos primeros viven en CSS (global.css › coreografía del hero y .trazo-al-entrar); aquí está lo que necesita script.
import { conSigno } from '@/lib/formato';

/** Repetir la coreografía del hero: quien llegó tarde puede verla de nuevo. */
export function repetirEscena(escena: HTMLElement) {
  escena.classList.remove('en-escena');
  void escena.offsetWidth; // reinicia las animaciones CSS
  escena.classList.add('en-escena');
}

export function escenaHero() {
  const escena = document.querySelector<HTMLElement>('[data-escena="hero"]');
  if (!escena) return;
  const boton = escena.querySelector<HTMLButtonElement>('[data-repetir]');
  if (!boton) return;
  boton.hidden = false;
  boton.addEventListener('click', () => repetirEscena(escena));
}

/** Borde del lado del sol: en escritorio sigue al puntero sin cambiar de lado. Una escritura por cuadro. */
export function bordeSol() {
  let pendiente = 0;
  document.addEventListener(
    'pointermove',
    (e) => {
      const tarjeta = (e.target as Element | null)?.closest<HTMLElement>('[data-borde-sol]');
      if (!tarjeta || pendiente) return;
      pendiente = requestAnimationFrame(() => {
        pendiente = 0;
        const caja = tarjeta.getBoundingClientRect();
        const avance = Math.min(1, Math.max(0, (e.clientX - caja.left) / caja.width));
        // La luz viene siempre de arriba a la derecha: el ángulo se mueve entre 205° y 265°, como el día.
        tarjeta.style.setProperty('--sol-angulo', `${265 - avance * 60}deg`);
      });
    },
    { passive: true },
  );
}

/**
 * Desfase y reencuentro, definido por velocidad (sistema_de_diseno/03 §1): mientras hay scroll, la capa se adelanta
 * a la foto en proporción a la velocidad, hasta `maximo` px; al detenerse vuelve a calzar en 420 ms.
 */
// Máximo 4 px (antes 12): con más, la capa se despegaba de lo que marca mientras se desplaza la página.
export function desfase(gsap: typeof import('gsap').gsap, velocidad: () => number, maximo = 4) {
  const figuras = [...document.querySelectorAll<HTMLElement>('.figura-gemela')].filter((f) => f.querySelector('.capa'));
  if (!figuras.length) return () => {};
  const estado = { y: 0 };
  const hacia = gsap.quickTo(estado, 'y', { duration: 0.42, ease: 'power3.out' });
  const visibles = new Set<HTMLElement>();
  const observador = new IntersectionObserver((entradas) => {
    for (const x of entradas) {
        if (x.isIntersecting) visibles.add(x.target as HTMLElement);
        else visibles.delete(x.target as HTMLElement);
      }
  });
  figuras.forEach((f) => observador.observe(f));
  const cuadro = () => {
    hacia(Math.max(-maximo, Math.min(maximo, velocidad() * 4)));
    // Lo que está fuera de pantalla no se anima.
    for (const f of visibles) f.style.setProperty('--desfase', `${estado.y.toFixed(2)}px`);
  };
  gsap.ticker.add(cuadro);
  return () => {
    gsap.ticker.remove(cuadro);
    observador.disconnect();
    figuras.forEach((f) => f.style.removeProperty('--desfase'));
  };
}

/** Contar: cada cifra sube desde cero cada vez que entra en pantalla, y vuelve a cero al salir del todo,
 *  así se repite al volver a pasar. Las de una misma fila parten con un escalón de 110 ms.
 *  El HTML trae la cifra final: sin script o con movimiento reducido no se mueve nada. */
export function contarCifras() {
  const cifras = [...document.querySelectorAll<HTMLElement>('[data-contar]')];
  if (!cifras.length) return;
  const duracion = 1400;
  const escalon = 110;
  const salida = (x: number) => 1 - Math.pow(1 - x, 3);
  const estado = new Map<HTMLElement, { cuadro?: number; espera?: number; contada: boolean }>();

  const escribir = (el: HTMLElement, v: number) => {
    const d = Number(el.dataset.decimales ?? 0);
    el.textContent = `${el.dataset.prefijo ?? ''}${conSigno(el.dataset.lang ?? 'es', v, d)}${el.dataset.sufijo ?? ''}`;
  };
  const detener = (el: HTMLElement) => {
    const e = estado.get(el)!;
    if (e.cuadro) cancelAnimationFrame(e.cuadro);
    if (e.espera) clearTimeout(e.espera);
    e.cuadro = e.espera = undefined;
  };
  const animar = (el: HTMLElement, retraso: number) => {
    const e = estado.get(el)!;
    const final = Number(el.dataset.valor);
    escribir(el, 0);
    e.espera = window.setTimeout(() => {
      const inicio = performance.now();
      const paso = (ahora: number) => {
        const t = Math.min(1, (ahora - inicio) / duracion);
        escribir(el, final * salida(t));
        e.cuadro = t < 1 ? requestAnimationFrame(paso) : undefined;
      };
      e.cuadro = requestAnimationFrame(paso);
    }, retraso);
  };

  for (const el of cifras) {
    estado.set(el, { contada: false });
    // El lector de pantalla recibe la cifra final, no cada paso del conteo.
    el.setAttribute('aria-hidden', 'true');
    const leida = document.createElement('span');
    leida.className = 'sr-only';
    leida.textContent = el.textContent ?? '';
    el.after(leida);
    // Parte en cero: así no se ve la cifra final un instante antes de empezar a contar.
    escribir(el, 0);
  }
  // Al imprimir, las cifras completas.
  window.addEventListener('beforeprint', () => cifras.forEach((el) => (detener(el), escribir(el, Number(el.dataset.valor)))));

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const x of entradas) {
        const el = x.target as HTMLElement;
        const e = estado.get(el)!;
        if (x.isIntersecting && x.intersectionRatio >= 0.6 && !e.contada) {
          e.contada = true;
          const fila = el.closest('ul, ol');
          const i = fila ? [...fila.querySelectorAll('[data-contar]')].indexOf(el) : 0;
          animar(el, Math.max(0, i) * escalon);
        } else if (!x.isIntersecting && e.contada) {
          // Fuera de pantalla: vuelve a cero para contar de nuevo la próxima vez.
          detener(el);
          e.contada = false;
          escribir(el, 0);
        }
      }
    },
    { threshold: [0, 0.6] },
  );
  cifras.forEach((el) => observador.observe(el));
}

/** Logo del encabezado: se traza al cargar («agento», el anillo gemelo con rebote y «cloud», 1,9 s)
 *  y vuelve a trazarse cada 30 s. No corre con la pestaña oculta ni mientras el puntero está sobre el logo.
 *  Entre una vez y otra el logo queda quieto y completo: la animación es la misma del pie (global.css › .se-traza). */
export function logoEnCiclo(cada = 30_000) {
  const logo = document.querySelector<SVGElement>('[data-logo="ciclo"]');
  if (!logo) return;
  const DURACION = 2100; // lo que tarda la secuencia completa, con margen
  let quitar = 0;
  let encima = false;
  logo.addEventListener('pointerenter', () => (encima = true));
  logo.addEventListener('pointerleave', () => (encima = false));
  const trazar = () => {
    if (document.hidden || encima) return;
    clearTimeout(quitar);
    logo.classList.remove('se-traza');
    void logo.getBoundingClientRect(); // reinicia las animaciones CSS
    logo.classList.add('se-traza');
    // Al terminar se quita la clase: el logo vuelve a su estado normal, completo y sin animación pendiente.
    quitar = window.setTimeout(() => logo.classList.remove('se-traza'), DURACION);
  };
  trazar();
  window.setInterval(trazar, cada);
}
