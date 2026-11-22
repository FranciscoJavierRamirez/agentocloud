// Punto de entrada del movimiento. Estado por defecto del HTML = estado final: sin este script, o con
// movimiento reducido, todo el contenido está completo. Aquí solo se suman mejoras, por nivel de equipo.
import { alEntrar, barraFija, dialogos, seccionActual } from './interfaz';
import { bordeSol, contarCifras, escenaHero, logoEnCiclo } from './movimientos';
import { nivel } from './niveles';

dialogos();
barraFija();
seccionActual();

const n = nivel();
if (n > 0) {
  // Activa lo ligado al scroll en CSS (la luz que avanza, los trazos al entrar).
  document.documentElement.classList.add('mov');
  escenaHero();
  contarCifras();
  logoEnCiclo();
  alEntrar('[data-logo="trazar"]', 'se-traza');
}
if (n === 2) bordeSol();
// El suavizado y el desfase solo se descargan donde hay una capa del gemelo que mover (el inicio):
// las páginas de contenido se quedan con el scroll nativo y sin librería de animación.
if (n === 2 && document.querySelector('.figura-gemela .capa')) {
  // Tiempo ocioso: no compiten con el primer pintado.
  const cargar = () => import('./escritorio').then((m) => m.iniciarEscritorio());
  'requestIdleCallback' in window ? requestIdleCallback(cargar) : setTimeout(cargar, 200);
}
