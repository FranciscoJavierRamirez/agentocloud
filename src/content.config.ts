// Modelo de contenido. Esquema estricto: si falta una clave, la compilación falla.
// Todo vive bajo una carpeta de idioma; el identificador de cada entrada es "<idioma>/<id>".
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const idioma = (entry: string) => entry.split('/')[0];
const porIdioma = (base: string, ext: string) =>
  glob({
    base,
    pattern: `*/*.${ext}`,
    generateId: ({ entry, data }) => `${idioma(entry)}/${String(data.id ?? entry.split('/')[1].replace(/\.\w+$/, ''))}`,
  });

const imagen = z.object({ codigo: z.string(), alt: z.string() });
const enlace = z.object({ texto: z.string(), ancla: z.string().optional(), ruta: z.string().optional() });
const boton = z.object({ texto: z.string(), ancla: z.string() });
const base = { orden: z.number(), ancla: z.string(), prioridad: z.enum(['P0', 'P1']), titulo: z.string() };
const cifraAnimada = z.object({ valor: z.number(), decimales: z.number(), unidad: z.string() });

const sitio = z.object({
  id: z.literal('sitio'),
  idioma: z.string(),
  lang: z.string(),
  ruta_base: z.string(),
  dir: z.enum(['ltr', 'rtl']),
  seo: z.object({
    titulo: z.string(),
    descripcion: z.string(),
    imagen_compartir: z.string(),
    imagen_compartir_alt: z.string(),
    palabras_clave: z.array(z.string()),
  }),
  organizacion: z.object({ nombre: z.string(), descripcion: z.string(), url: z.string(), correo: z.string(), ciudad: z.string() }),
  navegacion: z.object({
    saltar_al_contenido: z.string(),
    logo_alt: z.string(),
    enlaces: z.array(enlace),
    accion_principal: boton,
    menu_abrir: z.string(),
    menu_cerrar: z.string(),
    idioma_etiqueta: z.string(),
    idiomas: z.array(z.object({ codigo: z.string(), corto: z.string(), nombre: z.string() })),
  }),
  barra_fija: boton,
  // Botón flotante de WhatsApp: número en formato internacional sin «+» ni espacios, y el mensaje que queda escrito.
  whatsapp: z.object({ numero: z.string().regex(/^\d{8,15}$/), mensaje: z.string(), etiqueta: z.string(), boton: z.string() }),
  controles: z.object({
    cerrar: z.string(),
    repetir: z.string(),
    ver_evidencia: z.string(),
    ver_detalle: z.string(),
    caso_anterior: z.string(),
    caso_siguiente: z.string(),
    un_dia_menos: z.string(),
    un_dia_mas: z.string(),
    enviar_archivo: z.string(),
  }),
  declaracion_realidad: z.object({ imagen: z.string(), etapa: z.string(), corta: z.string() }),
  formulario: z.object({
    campos: z.object({ nombre: z.string(), correo: z.string(), empresa: z.string(), sistema: z.string(), opcional: z.string() }),
    ejemplo_correo: z.string(),
    ayuda: z.string(),
    privacidad: z.string(),
    privacidad_enlace: z.string(),
    enviando: z.string(),
    recibido: z.string(),
    errores: z.object({
      correo: z.string(),
      nombre_vacio: z.string(),
      correo_vacio: z.string(),
      empresa_vacia: z.string(),
      envio: z.string(),
      agenda_sin_horas: z.string(),
    }),
  }),
  estados: z.object({ grafico_no_carga: z.string() }),
  pagina_404: z.object({ titulo: z.string(), texto: z.string(), boton: z.string() }),
  formato: z.object({ separador_miles: z.string(), separador_decimal: z.string(), porcentaje: z.string(), moneda: z.string() }),
  // Microtextos de interfaz: ningún componente lleva texto escrito.
  interfaz: z.object({
    fuente: z.string(),
    origen: z.object({ publico: z.string(), calculado: z.string(), simulado: z.string(), medido: z.string(), propio: z.string() }),
    seccion: z.string(),
    navegacion_principal: z.string(),
    navegacion_pie: z.string(),
    provisional: z.string(),
    imagen_ilustrativa: z.string(),
    ver_empresa: z.string(),
    escenario: z.string(),
    vista: z.string(),
    dia: z.string(),
    menos: z.string(),
    mas: z.string(),
    balance_cierra: z.string(),
    balance_no_cierra: z.string(),
    limite: z.string(),
    extraccion_unidad: z.string(),
    sin_script_formulario: z.string(),
    abre_en_otra_pestana: z.string(),
  }),
});

const hero = z.object({
  id: z.literal('hero'),
  ...base,
  rotulo: z.string(),
  bajada: z.string(),
  botones: z.array(z.object({ texto: z.string(), ancla: z.string(), variante: z.enum(['principal', 'secundaria']) })),
  imagen,
  capa_gemelo: z.object({ rotulo: z.string() }),
  intro: z.object({ rotulo: z.string(), definicion: z.string(), puntos: z.array(z.string()), alcance: z.string() }),
});

const enJuego = z.object({
  id: z.literal('en-juego'),
  ...base,
  cifras: z.array(cifraAnimada.extend({ cifra: z.string(), texto: z.string(), fuente: z.string() })),
  perfil: z.object({ nota: z.string(), puntos: z.array(z.string()), contador: cifraAnimada.extend({ cifra: z.string() }), rotulo_energia: z.string() }),
  imagen,
});

const balance = z.object({
  id: z.literal('balance'),
  ...base,
  pestanas: z.array(z.object({ id: z.enum(['estanque', 'pozos']), texto: z.string() })),
  estanque: z.object({
    instruccion: z.string(),
    unidad: z.string(),
    barras: z.object({ entra: z.string(), sale: z.string(), cambio: z.string() }),
    escenarios: z.array(
      z.object({
        id: z.enum(['normal', 'fuga', 'sensor']),
        etiqueta: z.string(),
        entra: z.number(),
        sale: z.number(),
        cambio: z.number(),
        cierra: z.boolean(),
        sensor_rayado: z.boolean().optional(),
        texto: z.string(),
        veredicto: z.string(),
        rotulo_capa: z.string().optional(),
      }),
    ),
    lector_pantalla: z.string(),
  }),
  pozos: z.object({
    instruccion: z.string(),
    control: z.string(),
    rotulo_limite: z.string(),
    estados: z.array(z.object({ id: z.enum(['bajo', 'sobre']), veredicto: z.string(), texto: z.string() })),
  }),
  pie: z.string(),
  imagen,
});

const diferencia = z.object({
  id: z.literal('diferencia'),
  ...base,
  instruccion: z.string(),
  vistas: z.array(z.object({ id: z.enum(['alarma', 'agento']), etiqueta: z.string(), resumen: z.string() })),
  grafico: z.object({
    eje_x: z.string(),
    eje_y: z.string(),
    series: z.object({ modelo: z.string(), medicion: z.string(), umbral: z.string() }),
    estados: z.object({ sin_aviso: z.string(), alarma: z.string(), dentro: z.string(), desviacion: z.string() }),
    cotas: z.object({ sin_aviso: z.string(), antes: z.string() }),
    recorrido_lector: z.string(),
    alt: z.string(),
    pie: z.string(),
  }),
  casos: z.object({
    titulo: z.string(),
    etiquetas: z.object({ causa_senalada: z.string(), causa_descartada: z.string(), recomendacion: z.string() }),
    lista: z.array(z.object({ nombre: z.string(), causa_senalada: z.string(), causa_descartada: z.string(), recomendacion: z.string() })),
  }),
});

const comoFunciona = z.object({
  id: z.literal('como-funciona'),
  ...base,
  pasos: z.array(z.object({ numero: z.number(), titulo: z.string(), texto: z.string().optional() })),
  plano: z.object({
    nodos: z.object({ control: z.string(), historiador: z.string(), agento: z.string(), persona: z.string() }),
    flecha: z.string(),
    pie: z.string(),
    alt: z.string(),
  }),
  pilares: z.object({ titulo: z.string(), lista: z.array(z.object({ titulo: z.string(), texto: z.string().optional() })) }),
  imagen,
  capa_gemelo: z.object({ rotulo: z.string() }),
});

const costoDeEsperar = z.object({
  id: z.literal('costo-de-esperar'),
  ...base,
  instruccion: z.string(),
  nota: z.string(),
  boton,
  deslizador: z.object({ etiqueta: z.string(), minimo: z.number(), maximo: z.number(), inicial: z.number() }),
  entradas: z.array(
    z.object({
      id: z.enum(['caudal', 'altura', 'horas', 'eficiencia', 'tarifa', 'perdida']),
      etiqueta: z.string(),
      unidad: z.string(),
      ejemplo: z.number().nullable(),
      ayuda: z.string().optional(),
    }),
  ),
  salidas: z.object({ energia_anual: z.string(), valor_punto: z.string(), costo_dia: z.string(), costo_total: z.string() }),
  formula: z.object({ titulo: z.string(), lineas: z.array(z.string()) }),
  estado_vacio: z.string(),
});

const paraCadaUno = z.object({
  id: z.literal('para-cada-uno'),
  ...base,
  tarjetas: z.array(z.object({ id: z.string(), titulo: z.string(), texto: z.string(), imagen, capa_gemelo: z.string().nullable() })),
});

const seguridad = z.object({
  id: z.literal('seguridad'),
  ...base,
  tema: z.literal('oscuro'),
  bajada: z.string(),
  puntos: z.array(z.object({ titulo: z.string(), texto: z.string().optional() })),
  boton,
  esquema: z.object({
    nodos: z.object({ control: z.string(), historiador: z.string(), agento: z.string(), persona: z.string() }),
    flecha: z.string(),
    alt: z.string(),
  }),
  imagen,
});

const dondeEstamos = z.object({
  id: z.literal('donde-estamos'),
  ...base,
  cifras: z.array(z.object({ cifra: z.string(), valor: z.string(), texto: z.string() })),
  captura: z.object({ rotulo: z.string(), alt: z.string() }),
  boton,
});

const primerPaso = z.object({
  id: z.literal('primer-paso'),
  ...base,
  opciones: z.array(z.object({ id: z.string(), titulo: z.string(), texto: z.string(), boton: z.string(), destino: z.enum(['agenda', 'formulario']) })),
  formulario: z.object({ titulo: z.string(), boton_enviar: z.string() }),
  imagen,
});

const quienesSomos = z.object({
  id: z.literal('quienes-somos'),
  ...base,
  personas: z.array(
    z.object({
      nombre: z.string(),
      cargo: z.string(),
      // Una línea bajo el nombre en el inicio; «bio» es la trayectoria completa (variante ampliada).
      bio_corta: z.string(),
      bio: z.string(),
      linkedin: z.string(),
      linkedin_texto: z.string(),
      foto_alt: z.string(),
      retrato: z.string(),
    }),
  ),
});

const preguntas = z.object({
  id: z.literal('preguntas'),
  ...base,
  preguntas: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })),
});

const pie = z.object({
  id: z.literal('pie'),
  orden: z.number(),
  ancla: z.string(),
  prioridad: z.enum(['P0', 'P1']),
  lema: z.string(),
  contacto: z.object({ correo: z.string(), linkedin_texto: z.string(), linkedin: z.string() }),
  enlaces_legales: z.array(z.object({ texto: z.string(), ruta: z.string() })),
  derechos: z.string(),
  imagen,
  logo_alt: z.string(),
});

const seoPagina = z.object({ titulo: z.string(), descripcion: z.string() });

const paginaEmpresa = z.object({
  id: z.literal('empresa'),
  tipo: z.literal('empresa'),
  ruta: z.string(),
  borrador: z.boolean(),
  titulo: z.string(),
  seo: seoPagina,
  cabecera: z.object({ rotulo: z.string(), entrada: z.string(), imagen }),
  historia: z.object({ titulo: z.string(), parrafos: z.array(z.string()) }),
  equipo: z.object({ titulo: z.string() }),
  desde_chile: z.object({ titulo: z.string(), parrafos: z.array(z.string()), cifras: z.array(z.object({ cifra: z.string(), texto: z.string() })) }),
  etapa: z.object({ titulo: z.string(), hay: z.object({ titulo: z.string(), puntos: z.array(z.string()) }), sigue: z.object({ titulo: z.string(), puntos: z.array(z.string()) }) }),
  asesores: z.object({ titulo: z.string() }),
  cierre: z.object({ titulo: z.string(), boton: z.string() }),
});

const paginaLegal = z.object({
  id: z.string(),
  tipo: z.literal('pagina'),
  ruta: z.string(),
  prioridad: z.enum(['P0', 'P1']).optional(),
  borrador: z.boolean(),
  titulo: z.string(),
  actualizado: z.string(),
  seo: seoPagina,
});

const origen = z.enum(['publico', 'calculado', 'simulado', 'medido', 'propio']);

export const collections = {
  sitio: defineCollection({
    loader: porIdioma('./src/content/sitio', 'md'),
    schema: z.discriminatedUnion('id', [
      sitio, hero, enJuego, balance, diferencia, comoFunciona, costoDeEsperar, paraCadaUno,
      seguridad, dondeEstamos, primerPaso, quienesSomos, preguntas, pie,
    ]),
  }),
  paginas: defineCollection({
    loader: porIdioma('./src/content/paginas', 'md'),
    schema: z.discriminatedUnion('tipo', [paginaEmpresa, paginaLegal]),
  }),
  // Registro de cifras: fuente única de todo número del sitio.
  cifras: defineCollection({
    loader: glob({ base: './src/content/cifras', pattern: '*.yaml' }),
    schema: z.object({
      lista: z.array(
        z.object({
          id: z.string(),
          valor: z.number(),
          decimales: z.number(),
          unidad: z.string(),
          prefijo: z.string().optional(),
          sufijo: z.string().optional(),
          fuente: z.string(),
          origen,
          enlace: z.string().nullable(),
          consultado: z.string().nullable(),
        }),
      ),
    }),
  }),
  // Vacía hasta que haya aceptaciones escritas: la sección no se renderiza.
  asesores: defineCollection({
    loader: glob({ base: './src/content/asesores', pattern: '*.yaml' }),
    schema: z.object({ lista: z.array(z.object({ nombre: z.string(), cargo: z.string(), bio: z.string(), linkedin: z.string().optional() })) }),
  }),
  imagenes: defineCollection({
    loader: glob({ base: './src/content/imagenes', pattern: '*.yaml' }),
    schema: z.object({
      codigo: z.string(),
      provisional: z.boolean(),
      // Muestra el rótulo «Imagen ilustrativa». Las fotos reales de una operación lo apagan con false.
      ilustrativa: z.boolean().default(true),
      tema: z.enum(['claro', 'oscuro']),
      escritorio: recorte(),
      celular: recorte().optional(),
    }),
  }),
};

function recorte() {
  const par = z.tuple([z.number(), z.number()]);
  return z.object({
    archivo: z.string(),
    ancho: z.number(),
    alto: z.number(),
    foco: par,
    // Esquina del rótulo «Imagen ilustrativa» en este recorte (por defecto, arriba a la derecha).
    aviso: z.enum(['arriba-derecha', 'arriba-izquierda', 'abajo-derecha', 'abajo-izquierda']).optional(),
    capa: z
      .object({
        archivo: z.string(),
        estado: z.enum(['cierra', 'brecha']),
        rotulo: par.optional(),
        cierre_dy: z.number().optional(),
        puntos: z.array(z.object({ x: z.number(), y: z.number(), cota: z.number().optional() })).optional(),
      })
      .optional(),
  });
}
