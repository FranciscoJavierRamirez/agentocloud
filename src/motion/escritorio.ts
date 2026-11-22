// Nivel 2 · Escritorio: scroll suavizado (Lenis) y desfase de la capa del gemelo (GSAP).
// Se carga con import() dinámico, solo con puntero fino, pantalla ancha y sin movimiento reducido:
// en celular no se descarga. GSAP es gratuito pero no es código abierto; todo su uso está en este archivo
// y en movimientos.ts › desfase, para poder cambiar de motor reescribiendo un módulo.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { consultas } from './niveles';
import { desfase } from './movimientos';

gsap.registerPlugin(ScrollTrigger);

export function iniciarEscritorio() {
  const mm = gsap.matchMedia();
  // Las variantes se declaran juntas: escritorio aquí; celular y movimiento reducido no crean nada.
  mm.add(`${consultas.escritorio} and (prefers-reduced-motion: no-preference)`, () => {
    // Lenis envuelve el scroll nativo: siguen funcionando sticky, las anclas, el teclado y la búsqueda en la página.
    document.documentElement.style.scrollBehavior = 'auto';
    const lenis = new Lenis({ anchors: { offset: -64 }, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    const avanzar = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(avanzar);
    gsap.ticker.lagSmoothing(0);
    const quitarDesfase = desfase(gsap, () => lenis.velocity);
    return () => {
      quitarDesfase();
      gsap.ticker.remove(avanzar);
      lenis.destroy();
      document.documentElement.style.removeProperty('scroll-behavior');
    };
  });
}
