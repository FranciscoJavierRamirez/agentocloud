---
id: diferencia
orden: 4
ancla: "difference"
prioridad: P1
titulo: "The same curve, seen by an alarm and by a twin."
instruccion: "Switch views and explore the chart."
vistas:
  - id: "alarma"
    etiqueta: "Alarm"
    resumen: "A threshold alarm goes off on day 26, when the flow has already dropped. Before that, it says nothing."
  - id: "agento"
    etiqueta: "Agento"
    resumen: "The twin flags the deviation on day 13: 13 days before the alarm, and it proposes the cause."
grafico:
  eje_x: "Day"
  eje_y: "Flow (L/s)"
  series:
    modelo: "Model (expected)"
    medicion: "Measurement"
    umbral: "ALARM THRESHOLD"
  estados:
    sin_aviso: "No warning"
    alarma: "Low-flow alarm"
    dentro: "Within expectations"
    desviacion: "Deviation: {desviacion} L/s"
  cotas:
    sin_aviso: "{dias} days without warning"
    antes: "{dias} days earlier"
  recorrido_lector: "Day {dia}: measurement {medicion} liters per second. Deviation: {desviacion} liters per second."
  alt: "Flow of well PZ-12 over 30 days. The measurement departs from the model from day 13. A threshold alarm would go off on day 26."
  pie: "WELL PZ-12 · FLOW IN L/S"
casos:
  titulo: "Two cases"
  etiquetas:
    causa_senalada: "Cause identified"
    causa_descartada: "Cause ruled out"
    recomendacion: "Recommendation"
  lista:
    - nombre: "Tank · level dropping"
      causa_senalada: "Leak at the outlet."
      causa_descartada: "Drifting sensor."
      recomendacion: "Inspect the outlet line before the night shift."
    - nombre: "Well · flow dropping"
      causa_senalada: "Clogging."
      causa_descartada: "Pump wear."
      recomendacion: "Clean the well; replacing the pump would not recover the flow."
---

An alarm compares a data point with a threshold. A twin compares it with what should be happening, so it sees the deviation while it is still small.
