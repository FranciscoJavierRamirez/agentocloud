---
id: costo-de-esperar
orden: 6
ancla: "cost-of-waiting"
prioridad: P1
titulo: "Every day of waiting has a price."
instruccion: "Move the days until the next maintenance."
nota: "Estimate with your data; not a measurement."
boton:
  texto: "Review this system with Agento"
  ancla: "first-step"
deslizador:
  etiqueta: "Days until the next maintenance"
  minimo: 1
  maximo: 30
  inicial: 14
entradas:
  - id: "caudal"
    etiqueta: "Flow"
    unidad: "L/s"
    ejemplo: 250
  - id: "altura"
    etiqueta: "Total head"
    unidad: "m"
    ejemplo: 3000
  - id: "horas"
    etiqueta: "Operating hours per year"
    unidad: "h"
    ejemplo: 8000
  - id: "eficiencia"
    etiqueta: "Current pumping efficiency"
    unidad: "%"
    ejemplo: 75
  - id: "tarifa"
    etiqueta: "Energy tariff"
    unidad: "USD/MWh"
    ejemplo: null
    ayuda: "Use your operation's tariff."
  - id: "perdida"
    etiqueta: "Efficiency loss to evaluate"
    unidad: "points"
    ejemplo: 1
salidas:
  energia_anual: "Estimated annual energy"
  valor_punto: "Annual cost of that efficiency loss"
  costo_dia: "Cost per day of waiting"
  costo_total: "Cost of waiting {dias} days"
formula:
  titulo: "How it is calculated"
  lineas:
    - "Power (kW) = 9.81 × flow (m³/s) × head (m) ÷ efficiency"
    - "Annual energy (kWh) = power × operating hours per year"
    - "Cost per day of waiting = (power with the lost efficiency − current power) × hours per year ÷ 365 × tariff"
estado_vacio: "Enter the flow and the head to see your estimate."
---

A pump that loses efficiency uses more energy every day it keeps running that way. Agento tells you what waiting until the next maintenance costs.
