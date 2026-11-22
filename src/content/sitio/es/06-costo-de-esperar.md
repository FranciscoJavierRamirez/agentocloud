---
id: costo-de-esperar
orden: 6
ancla: "costo-de-esperar"
prioridad: P1
titulo: "Cada día de espera tiene un precio."
instruccion: "Mueva los días hasta la próxima mantención."
nota: "Estimación con sus datos; no es una medición."
boton:
  texto: "Revisar este sistema con Agento"
  ancla: "primer-paso"
deslizador:
  etiqueta: "Días hasta la próxima mantención"
  minimo: 1
  maximo: 30
  inicial: 14
entradas:
  - id: "caudal"
    etiqueta: "Caudal"
    unidad: "l/s"
    ejemplo: 250
  - id: "altura"
    etiqueta: "Altura total"
    unidad: "m"
    ejemplo: 3000
  - id: "horas"
    etiqueta: "Horas de operación al año"
    unidad: "h"
    ejemplo: 8000
  - id: "eficiencia"
    etiqueta: "Eficiencia actual del bombeo"
    unidad: "%"
    ejemplo: 75
  - id: "tarifa"
    etiqueta: "Tarifa de energía"
    unidad: "USD/MWh"
    ejemplo: null
    ayuda: "Use la tarifa de su operación."
  - id: "perdida"
    etiqueta: "Pérdida de eficiencia que quiere evaluar"
    unidad: "puntos"
    ejemplo: 1
salidas:
  energia_anual: "Energía anual estimada"
  valor_punto: "Lo que cuesta al año esa pérdida de eficiencia"
  costo_dia: "Costo por día de espera"
  costo_total: "Costo de esperar {dias} días"
formula:
  titulo: "Cómo se calcula"
  lineas:
    - "Potencia (kW) = 9,81 × caudal (m³/s) × altura (m) ÷ eficiencia"
    - "Energía anual (kWh) = potencia × horas de operación al año"
    - "Costo por día de espera = (potencia con la eficiencia perdida − potencia actual) × horas al año ÷ 365 × tarifa"
estado_vacio: "Ingrese el caudal y la altura para ver su estimación."
---

Una bomba que pierde eficiencia gasta más energía cada día que sigue operando así. Agento le dice cuánto le cuesta esperar hasta la próxima mantención.
