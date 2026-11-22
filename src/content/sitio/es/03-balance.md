---
id: balance
orden: 3
ancla: "balance"
prioridad: P0
titulo: "Cuando los balances de masa no cierran, algo está pasando."
pestanas:
  - id: "estanque"
    texto: "Estanque"
  - id: "pozos"
    texto: "Campo de pozos"
estanque:
  instruccion: "Cambie el escenario y vea qué dice el balance."
  unidad: "m³/h"
  barras:
    entra: "Entra"
    sale: "Sale"
    cambio: "Cambio de nivel"
  escenarios:
    - id: "normal"
      etiqueta: "Normal"
      entra: 120
      sale: 120
      cambio: 0
      cierra: true
      texto: "Entran 120 m³/h, salen 120 m³/h y el nivel no cambia. El balance cierra."
      veredicto: "El balance cierra"
    - id: "fuga"
      etiqueta: "Fuga"
      entra: 120
      sale: 120
      cambio: -4.2
      cierra: false
      texto: "Entran 120 m³/h y salen 120 m³/h por el medidor, pero el estanque pierde 4,2 m³/h, y lo confirman el sensor de nivel y la presión al fondo. Faltan 4,2 m³/h: el agua se va por donde no se mide. Fuga probable."
      veredicto: "El balance no cierra: faltan 4,2 m³/h"
      rotulo_capa: "TK-03 · FALTAN 4,2 M³/H · FUGA PROBABLE EN LA SALIDA"
    - id: "sensor"
      etiqueta: "Sensor que deriva"
      entra: 120
      sale: 120
      cambio: -4.2
      cierra: true
      sensor_rayado: true
      texto: "El sensor de nivel dice que el estanque pierde 4,2 m³/h, pero la presión al fondo no cambia y lo que entra y lo que sale son iguales. El balance cierra: el que deriva es el sensor."
      veredicto: "El balance cierra: el que deriva es el sensor"
  lector_pantalla: "Balance del estanque TK-03, escenario fuga: entran 120 metros cúbicos por hora y salen 120 por el medidor, pero el nivel baja 4,2 metros cúbicos por hora. Faltan 4,2: el balance no cierra."
pozos:
  instruccion: "Mueva la extracción del campo de pozos."
  control: "Extracción del campo de pozos"
  rotulo_limite: "LÍMITE DEL PERMISO"
  estados:
    - id: "bajo"
      veredicto: "Bajo el límite del permiso"
      texto: "El plan reparte el caudal entre los tres pozos y deja margen bajo el límite del permiso."
    - id: "sobre"
      veredicto: "Sobre el límite del permiso"
      texto: "La extracción supera el caudal autorizado. El gemelo lo marca antes de que ocurra y propone otro reparto."
pie: "ESTANQUE TK-03"
imagen:
  codigo: "IMG-03"
  alt: "Estanque de agua en una faena del desierto. El gemelo muestra que el nivel medido está bajo lo esperado: faltan 4,2 m³/h, fuga probable en la salida."
---

Un estanque se gobierna por su balance: lo que entra, lo que sale y lo que cambia su nivel. Si los tres no cuadran, algo está pasando, y no siempre es lo que parece.
