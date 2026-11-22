// Comportamientos de interfaz sin librería. Todos son mejoras: el HTML ya está completo sin ellos.

/** Hojas y menú: <dialog> nativo. Los enlaces de adentro cierran la hoja. */
export function dialogos() {
  document.addEventListener('click', (e) => {
    const origen = e.target as Element | null;
    const abre = origen?.closest<HTMLElement>('[data-abre-dialogo]');
    if (abre) {
      const dialogo = document.getElementById(abre.dataset.abreDialogo!) as HTMLDialogElement | null;
      dialogo?.showModal?.();
      return;
    }
    const dentro = origen?.closest<HTMLDialogElement>('dialog');
    if (!dentro) return;
    if (origen?.closest('[data-cierra-dialogo], a[href]') || origen === dentro) dentro.close();
  });
}

/** Barra fija de acción en celular: aparece al pasar el hero y se esconde si el formulario está en pantalla. */
export function barraFija() {
  const barra = document.querySelector<HTMLElement>('[data-barra-fija]');
  const hero = document.querySelector('[data-escena="hero"]');
  if (!barra || !hero) return;
  const formulario = document.getElementById(barra.dataset.ocultaEn ?? '');
  let pasoHero = false;
  let enFormulario = false;
  const pintar = () => barra.toggleAttribute('data-visible', pasoHero && !enFormulario);
  new IntersectionObserver(([x]) => { pasoHero = !x.isIntersecting; pintar(); }).observe(hero);
  if (formulario) new IntersectionObserver(([x]) => { enFormulario = x.isIntersecting; pintar(); }).observe(formulario);
}

/** Navegación y carril: marca la sección actual con la línea doble; el carril se abre en cobre donde está el problema. */
export function seccionActual() {
  const secciones = [...document.querySelectorAll<HTMLElement>('[data-seccion]')];
  if (!secciones.length) return;
  const enlaces = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-ancla]')];
  const carril = document.querySelector<HTMLElement>('[data-carril]');
  const numero = carril?.querySelector('[data-carril-numero]');
  const visibles = new Set<HTMLElement>();
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const x of entradas) {
        if (x.isIntersecting) visibles.add(x.target as HTMLElement);
        else visibles.delete(x.target as HTMLElement);
      }
      const actual = secciones.find((s) => visibles.has(s));
      if (!actual) return;
      for (const a of enlaces) {
        if (a.dataset.navAncla === actual.id) a.setAttribute('aria-current', 'true');
        else if (a.getAttribute('aria-current') === 'true') a.removeAttribute('aria-current');
      }
      carril?.toggleAttribute('data-brecha', actual.hasAttribute('data-brecha'));
      if (numero) numero.textContent = (actual.dataset.seccion ?? '1').padStart(2, '0');
    },
    { rootMargin: '-45% 0px -45% 0px' },
  );
  secciones.forEach((s) => observador.observe(s));
}

/** Lo que se traza una sola vez al entrar en pantalla (el logo del pie). */
export function alEntrar(selector: string, clase: string) {
  const elementos = document.querySelectorAll(selector);
  if (!elementos.length) return;
  const observador = new IntersectionObserver(
    (entradas) => {
      for (const x of entradas) {
        if (!x.isIntersecting) continue;
        x.target.classList.add(clase);
        observador.unobserve(x.target);
      }
    },
    { threshold: 0.4 },
  );
  elementos.forEach((el) => observador.observe(el));
}
