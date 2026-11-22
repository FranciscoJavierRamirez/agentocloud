---
id: como-funciona
orden: 5
ancla: "como-funciona"
prioridad: P1
titulo: "Un gemelo que razona, no solo simula."
pasos:
  - numero: 1
    titulo: "Proyecta"
  - numero: 2
    titulo: "Diagnostica"
  - numero: 3
    titulo: "Recomienda"
  - numero: 4
    titulo: "Mide"
plano:
  nodos:
    control: "Sistema de control (PLC)"
    historiador: "Historiador o réplica en la DMZ"
    agento: "Agento"
    persona: "Persona que aprueba"
  flecha: "SOLO LECTURA"
  pie: "Esquema ilustrativo. Agento solo lee: nunca escribe en el control."
  alt: "Esquema: pozo, bomba y estanque operados por el sistema de control (PLC); el estanque muestra una brecha. Agento lee del historiador o de su réplica en un solo sentido y entrega la causa a una persona que aprueba. No hay ninguna conexión de Agento hacia el control."
pilares:
  titulo: "Cuatro principios"
  lista:
    - titulo: "Busca causas, no solo muestra alarmas"
    - titulo: "Encima de lo que existe"
    - titulo: "Seguro por diseño"
    - titulo: "Ahorro verificable"
imagen:
  codigo: "IMG-04"
  alt: "Interior de una estación de bombeo con tres bombas. El gemelo marca que la bomba central gasta 6,1 % más energía por metro cúbico: desgaste de impulsor probable."
capa_gemelo:
  rotulo: "B-02 · +6,1 % KWH/M³ · DESGASTE DE IMPULSOR PROBABLE"
---

El gemelo no reemplaza lo que usted tiene: se pone encima, lee en solo lectura y le entrega a una persona la causa, la evidencia y lo que cuesta esperar.
