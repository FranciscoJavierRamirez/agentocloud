---
id: diferencia
orden: 4
ancla: "diferencia"
prioridad: P1
titulo: "La misma curva, vista por una alarma y por un gemelo."
instruccion: "Cambie de vista y recorra el gráfico."
vistas:
  - id: "alarma"
    etiqueta: "Alarma"
    resumen: "Una alarma de umbral avisa el día 26, cuando el caudal ya cayó. Antes de eso, no dice nada."
  - id: "agento"
    etiqueta: "Agento"
    resumen: "El gemelo marca la desviación el día 13: 13 días antes que la alarma, y propone la causa."
grafico:
  eje_x: "Día"
  eje_y: "Caudal (l/s)"
  series:
    modelo: "Modelo (lo esperado)"
    medicion: "Medición"
    umbral: "UMBRAL DE ALARMA"
  estados:
    sin_aviso: "Sin aviso"
    alarma: "Alarma de caudal bajo"
    dentro: "Dentro de lo esperado"
    desviacion: "Desviación: {desviacion} l/s"
  cotas:
    sin_aviso: "{dias} días sin aviso"
    antes: "{dias} días antes"
  recorrido_lector: "Día {dia}: medición {medicion} litros por segundo. Desviación: {desviacion} litros por segundo."
  alt: "Caudal del pozo PZ-12 en 30 días. La medición se aparta del modelo desde el día 13. Una alarma de umbral avisaría el día 26."
  pie: "POZO PZ-12 · CAUDAL EN L/S"
casos:
  titulo: "Dos casos"
  etiquetas:
    causa_senalada: "Causa señalada"
    causa_descartada: "Causa descartada"
    recomendacion: "Recomendación"
  lista:
    - nombre: "Estanque · baja el nivel"
      causa_senalada: "Fuga en la salida."
      causa_descartada: "Sensor que deriva."
      recomendacion: "Inspeccionar la línea de salida antes del turno de noche."
    - nombre: "Pozo · cae el caudal"
      causa_senalada: "Colmatación."
      causa_descartada: "Desgaste de la bomba."
      recomendacion: "Limpiar el pozo; cambiar la bomba no recuperaría el caudal."
---

Una alarma compara un dato con un umbral. Un gemelo lo compara con lo que debería estar pasando, y por eso ve la desviación cuando todavía es reducida.
