---
id: balance
orden: 3
ancla: "balance"
prioridad: P0
titulo: "When mass balances don't close, something is happening."
pestanas:
  - id: "estanque"
    texto: "Tank"
  - id: "pozos"
    texto: "Well field"
estanque:
  instruccion: "Change the scenario and see what the balance says."
  unidad: "m³/h"
  barras:
    entra: "In"
    sale: "Out"
    cambio: "Level change"
  escenarios:
    - id: "normal"
      etiqueta: "Normal"
      entra: 120
      sale: 120
      cambio: 0
      cierra: true
      texto: "120 m³/h in, 120 m³/h out, and the level doesn't change. The balance closes."
      veredicto: "The balance closes"
    - id: "fuga"
      etiqueta: "Leak"
      entra: 120
      sale: 120
      cambio: -4.2
      cierra: false
      texto: "120 m³/h in and 120 m³/h out through the meter, but the tank loses 4.2 m³/h, confirmed by the level sensor and the bottom pressure. 4.2 m³/h are missing: the water is leaving where nothing measures it. Probable leak."
      veredicto: "The balance doesn't close: 4.2 m³/h missing"
      rotulo_capa: "TK-03 · 4.2 M³/H MISSING · PROBABLE LEAK AT THE OUTLET"
    - id: "sensor"
      etiqueta: "Drifting sensor"
      entra: 120
      sale: 120
      cambio: -4.2
      cierra: true
      sensor_rayado: true
      texto: "The level sensor says the tank loses 4.2 m³/h, but the bottom pressure doesn't change and what comes in equals what goes out. The balance closes: the sensor is drifting."
      veredicto: "The balance closes: the sensor is drifting"
  lector_pantalla: "Balance of tank TK-03, leak scenario: 120 cubic meters per hour in and 120 out through the meter, but the level drops 4.2 cubic meters per hour. 4.2 are missing: the balance doesn't close."
pozos:
  instruccion: "Move the well field extraction."
  control: "Well field extraction"
  rotulo_limite: "PERMITTED LIMIT"
  estados:
    - id: "bajo"
      veredicto: "Below the permitted limit"
      texto: "The plan splits the flow among the three wells and leaves a margin below the permitted limit."
    - id: "sobre"
      veredicto: "Above the permitted limit"
      texto: "Extraction exceeds the permitted flow. The twin flags it before it happens and proposes another split."
pie: "TANK TK-03"
imagen:
  codigo: "IMG-03"
  alt: "Water tank at a desert mine site. The twin shows the measured level below the expected one: 4.2 m³/h missing, probable leak at the outlet."
---

A tank is governed by its balance: what comes in, what goes out, and how its level changes. If the three don't add up, something is happening, and it isn't always what it seems.
